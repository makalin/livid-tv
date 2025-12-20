import { useRef } from 'react';
import { useStore } from '@/store/useStore';

export const useRecording = () => {
  const {
    localStream,
    remoteStream,
    isRecording,
    setIsRecording,
    setMediaRecorder,
    mediaRecorder,
  } = useStore();
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    if (typeof window === 'undefined' || typeof MediaRecorder === 'undefined') {
      return;
    }
    
    try {
      if (!localStream && !remoteStream) {
        console.error('No streams available for recording');
        return;
      }

      // Combine streams if both available
      const streams: MediaStream[] = [];
      if (localStream) streams.push(localStream);
      if (remoteStream) streams.push(remoteStream);

      // Create a combined stream (simplified - in production, use MediaRecorder API properly)
      const combinedStream = new MediaStream();
      
      streams.forEach((stream) => {
        stream.getVideoTracks().forEach((track) => {
          combinedStream.addTrack(track);
        });
        stream.getAudioTracks().forEach((track) => {
          combinedStream.addTrack(track);
        });
      });

      const recorder = new MediaRecorder(combinedStream, {
        mimeType: 'video/webm;codecs=vp9,opus',
      });

      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `livid-tv-recording-${Date.now()}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setIsRecording(false);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setMediaRecorder(null);
    }
  };

  return { startRecording, stopRecording };
};

