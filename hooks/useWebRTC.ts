import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useStore } from '@/store/useStore';

const SIGNALING_SERVER_URL = process.env.NEXT_PUBLIC_SIGNALING_URL || 'http://localhost:3001';

export const useWebRTC = () => {
  const socketRef = useRef<Socket | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const isNegotiatingRef = useRef<boolean>(false);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const initializedRef = useRef<boolean>(false);
  const { roomId } = useStore();
  
  // Get setters via getState to avoid dependency issues
  const getSetters = () => {
    const store = useStore.getState();
    return {
      setConnected: store.setConnected,
      setLocalStream: store.setLocalStream,
      setRemoteStream: store.setRemoteStream,
      setPeerConnection: store.setPeerConnection,
      addMessage: store.addMessage,
      addStroke: store.addStroke,
    };
  };

  useEffect(() => {
    if (!roomId) {
      initializedRef.current = false;
      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
        useStore.getState().setPeerConnection(null);
      }
      return;
    }
    
    // Check if we're in browser environment and WebRTC is available
    if (typeof window === 'undefined' || typeof RTCPeerConnection === 'undefined') return;

    // Prevent re-initialization if already initialized
    if (initializedRef.current) {
      return;
    }

    // Check if peerConnection already exists in store
    const existingPc = useStore.getState().peerConnection;
    if (existingPc && existingPc.signalingState !== 'closed') {
      initializedRef.current = true;
      pcRef.current = existingPc;
      return;
    }

    initializedRef.current = true;

    // Get setters to avoid dependency issues
    const setters = getSetters();

    // Initialize Socket.io connection
    const socket = io(SIGNALING_SERVER_URL);
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to signaling server');
      setters.setConnected(true);
      socket.emit('join-room', roomId);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from signaling server');
      setters.setConnected(false);
    });

    // Initialize WebRTC
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    });

    pcRef.current = pc;
    // Only set if it's different from current value to prevent infinite loops
    const currentPc = useStore.getState().peerConnection;
    if (currentPc !== pc) {
      useStore.getState().setPeerConnection(pc);
    }

    // Handle remote stream
    pc.ontrack = (event) => {
      console.log('Received remote stream');
      setters.setRemoteStream(event.streams[0]);
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', {
          roomId,
          candidate: event.candidate,
        });
      }
    };

    // Handle incoming data channel
    pc.ondatachannel = (event) => {
      const channel = event.channel;
      dataChannelRef.current = channel;
      
      channel.onopen = () => {
        console.log('Data channel opened (received)');
      };

      channel.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const store = useStore.getState();
          
          if (data.type === 'drawing') {
            store.addStroke(data.stroke);
          } else if (data.type === 'chat') {
            store.addMessage({
              id: Date.now().toString(),
              text: data.message,
              timestamp: Date.now(),
              from: data.from || 'Peer',
            });
        } else if (data.type === 'widget') {
          // Check if widget exists, update it, otherwise add it
          const existingWidget = store.widgets.find((w) => w.id === data.widget.id);
          if (existingWidget) {
            store.updateWidget(data.widget.id, data.widget);
          } else {
            store.addWidget(data.widget);
          }
        } else if (data.type === 'file-start') {
            // Handle file reception
            // File chunks will be handled separately
          }
        } catch (error) {
          console.error('Error parsing data channel message:', error);
        }
      };
    };

    // Create data channel for drawing/chat (only if we're the initiator)
    const dataChannel = pc.createDataChannel('drawing', { ordered: true });
    dataChannelRef.current = dataChannel;
    
    dataChannel.onopen = () => {
      console.log('Data channel opened (created)');
    };

    dataChannel.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const store = useStore.getState();
        
        if (data.type === 'drawing') {
          store.addStroke(data.stroke);
        } else if (data.type === 'chat') {
          store.addMessage({
            id: Date.now().toString(),
            text: data.message,
            timestamp: Date.now(),
            from: data.from || 'Peer',
          });
          } else if (data.type === 'widget') {
            // Check if widget exists, update it, otherwise add it
            const existingWidget = store.widgets.find((w) => w.id === data.widget.id);
            if (existingWidget) {
              store.updateWidget(data.widget.id, data.widget);
            } else {
              store.addWidget(data.widget);
            }
          } else if (data.type === 'file-start') {
            // Handle file reception start
            // File chunks will be handled in file-chunk messages
          }
      } catch (error) {
        console.error('Error parsing data channel message:', error);
      }
    };

    // Get user media (only in browser)
    if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          setters.setLocalStream(stream);
          stream.getTracks().forEach((track) => {
            pc.addTrack(track, stream);
          });
        })
        .catch((error) => {
          console.error('Error accessing media devices:', error);
        });
    }

    // Handle signaling events
    socket.on('existing-users', async (userIds: string[]) => {
      console.log('Existing users:', userIds);
      if (userIds.length > 0 && !isNegotiatingRef.current) {
        try {
          isNegotiatingRef.current = true;
          // Check if we're already in a state that allows creating an offer
          if (pc.signalingState === 'stable' || pc.signalingState === 'have-local-offer') {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            socket.emit('offer', {
              roomId,
              offer: pc.localDescription,
            });
          }
        } catch (error) {
          console.error('Error creating offer for existing users:', error);
        } finally {
          isNegotiatingRef.current = false;
        }
      }
    });

    socket.on('user-joined', async (userId: string) => {
      console.log('User joined:', userId);
      if (!isNegotiatingRef.current) {
        try {
          isNegotiatingRef.current = true;
          // Only create offer if we're in stable state
          if (pc.signalingState === 'stable') {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            socket.emit('offer', {
              roomId,
              offer: pc.localDescription,
            });
          }
        } catch (error) {
          console.error('Error creating offer for new user:', error);
        } finally {
          isNegotiatingRef.current = false;
        }
      }
    });

    socket.on('offer', async (data: { offer: RTCSessionDescriptionInit; from: string }) => {
      console.log('Received offer');
      if (isNegotiatingRef.current) {
        console.log('Already negotiating, ignoring offer');
        return;
      }
      
      try {
        isNegotiatingRef.current = true;
        // Check current state before setting remote description
        if (pc.signalingState === 'stable' || pc.signalingState === 'have-local-offer') {
          await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit('answer', {
            roomId,
            answer: pc.localDescription,
          });
        } else {
          console.warn('Cannot handle offer in state:', pc.signalingState);
        }
      } catch (error) {
        console.error('Error handling offer:', error);
        // Try to recover by resetting connection state
        if (error instanceof Error && error.name === 'InvalidStateError') {
          console.log('Attempting to recover from InvalidStateError');
          // Close and recreate connection if needed
        }
      } finally {
        isNegotiatingRef.current = false;
      }
    });

    socket.on('answer', async (data: { answer: RTCSessionDescriptionInit; from: string }) => {
      console.log('Received answer');
      try {
        // Only set remote description if we're expecting an answer
        if (pc.signalingState === 'have-local-offer') {
          await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
        } else {
          console.warn('Cannot set answer in state:', pc.signalingState);
        }
      } catch (error) {
        console.error('Error handling answer:', error);
      }
    });

    socket.on('ice-candidate', async (data: { candidate: RTCIceCandidateInit; from: string }) => {
      if (data.candidate) {
        try {
          // Only add ICE candidate if connection is not closed
          if (pc.signalingState !== 'closed') {
            await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
          }
        } catch (error) {
          console.error('Error adding ICE candidate:', error);
        }
      }
    });

    socket.on('user-left', (userId: string) => {
      console.log('User left:', userId);
      setters.setRemoteStream(null);
    });

    // Cleanup
    return () => {
      initializedRef.current = false;
      socket.disconnect();
      pc.close();
      pcRef.current = null;
      dataChannelRef.current = null;
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      // Use getState to avoid dependency
      useStore.getState().setPeerConnection(null);
    };
  }, [roomId]);

  const sendDrawingData = (stroke: any) => {
    const channel = dataChannelRef.current;
    if (channel && channel.readyState === 'open') {
      channel.send(JSON.stringify({ type: 'drawing', stroke }));
    }
  };

  const sendChatMessage = (message: string) => {
    const channel = dataChannelRef.current;
    if (channel && channel.readyState === 'open') {
      channel.send(JSON.stringify({ type: 'chat', message, from: 'You' }));
    }
  };

  const sendFileData = (fileData: any) => {
    const channel = dataChannelRef.current;
    if (channel && channel.readyState === 'open') {
      // Split large files into chunks
      const chunkSize = 16 * 1024; // 16KB chunks
      const chunks = [];
      for (let i = 0; i < fileData.data.length; i += chunkSize) {
        chunks.push(fileData.data.slice(i, i + chunkSize));
      }
      
      // Send file metadata first
      channel.send(JSON.stringify({
        type: 'file-start',
        id: fileData.id,
        name: fileData.name,
        size: fileData.size,
        mimeType: fileData.type,
        totalChunks: chunks.length,
      }));

      // Send chunks
      chunks.forEach((chunk, index) => {
        channel.send(JSON.stringify({
          type: 'file-chunk',
          id: fileData.id,
          chunkIndex: index,
          data: Array.from(chunk),
        }));
      });
    }
  };

  const sendWidget = (widget: any) => {
    const channel = dataChannelRef.current;
    if (channel && channel.readyState === 'open') {
      channel.send(JSON.stringify({ type: 'widget', widget }));
    }
  };

  return { sendDrawingData, sendChatMessage, sendFileData, sendWidget };
};

