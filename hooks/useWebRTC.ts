import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useStore } from '@/store/useStore';

const SIGNALING_SERVER_URL = process.env.NEXT_PUBLIC_SIGNALING_URL || 'http://localhost:3001';

export const useWebRTC = () => {
  const socketRef = useRef<Socket | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const {
    roomId,
    setConnected,
    setLocalStream,
    setRemoteStream,
    setPeerConnection,
    addMessage,
    addStroke,
  } = useStore();

  useEffect(() => {
    if (!roomId) return;

    // Initialize Socket.io connection
    const socket = io(SIGNALING_SERVER_URL);
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to signaling server');
      setConnected(true);
      socket.emit('join-room', roomId);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from signaling server');
      setConnected(false);
    });

    // Initialize WebRTC
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    });

    setPeerConnection(pc);

    // Handle remote stream
    pc.ontrack = (event) => {
      console.log('Received remote stream');
      setRemoteStream(event.streams[0]);
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
          
          if (data.type === 'drawing') {
            addStroke(data.stroke);
          } else if (data.type === 'chat') {
            addMessage({
              id: Date.now().toString(),
              text: data.message,
              timestamp: Date.now(),
              from: data.from || 'Peer',
            });
        } else if (data.type === 'widget') {
          const { addWidget, updateWidget } = useStore.getState();
          // Check if widget exists, update it, otherwise add it
          const existingWidget = useStore.getState().widgets.find((w) => w.id === data.widget.id);
          if (existingWidget) {
            updateWidget(data.widget.id, data.widget);
          } else {
            addWidget(data.widget);
          }
        } else if (data.type === 'file-start') {
            // Handle file reception
            const { addSharedFile } = useStore.getState();
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
        
        if (data.type === 'drawing') {
          addStroke(data.stroke);
        } else if (data.type === 'chat') {
          addMessage({
            id: Date.now().toString(),
            text: data.message,
            timestamp: Date.now(),
            from: data.from || 'Peer',
          });
          } else if (data.type === 'widget') {
            const { addWidget, updateWidget } = useStore.getState();
            // Check if widget exists, update it, otherwise add it
            const existingWidget = useStore.getState().widgets.find((w) => w.id === data.widget.id);
            if (existingWidget) {
              updateWidget(data.widget.id, data.widget);
            } else {
              addWidget(data.widget);
            }
          } else if (data.type === 'file-start') {
            // Handle file reception start
            const { addSharedFile } = useStore.getState();
            // File chunks will be handled in file-chunk messages
          }
      } catch (error) {
        console.error('Error parsing data channel message:', error);
      }
    };

    // Get user media
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setLocalStream(stream);
        stream.getTracks().forEach((track) => {
          pc.addTrack(track, stream);
        });
      })
      .catch((error) => {
        console.error('Error accessing media devices:', error);
      });

    // Handle signaling events
    socket.on('existing-users', async (userIds: string[]) => {
      console.log('Existing users:', userIds);
      if (userIds.length > 0) {
        // Create offer
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('offer', {
          roomId,
          offer: pc.localDescription,
        });
      }
    });

    socket.on('user-joined', async (userId: string) => {
      console.log('User joined:', userId);
      // Create offer for new user
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit('offer', {
        roomId,
        offer: pc.localDescription,
      });
    });

    socket.on('offer', async (data: { offer: RTCSessionDescriptionInit; from: string }) => {
      console.log('Received offer');
      await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit('answer', {
        roomId,
        answer: pc.localDescription,
      });
    });

    socket.on('answer', async (data: { answer: RTCSessionDescriptionInit; from: string }) => {
      console.log('Received answer');
      await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
    });

    socket.on('ice-candidate', async (data: { candidate: RTCIceCandidateInit; from: string }) => {
      if (data.candidate) {
        await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    });

    socket.on('user-left', (userId: string) => {
      console.log('User left:', userId);
      setRemoteStream(null);
    });

    // Cleanup
    return () => {
      socket.disconnect();
      pc.close();
      dataChannelRef.current = null;
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
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
        type: fileData.type,
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

