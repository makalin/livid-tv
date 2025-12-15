import { useStore } from '@/store/useStore';

export const useScreenShare = () => {
  const {
    peerConnection,
    localStream,
    screenStream,
    setIsScreenSharing,
    setScreenStream,
  } = useStore();

  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always' } as MediaTrackConstraints,
        audio: true,
      });

      setScreenStream(stream);
      setIsScreenSharing(true);

      // Replace video track in peer connection
      if (peerConnection && localStream) {
        const videoTrack = stream.getVideoTracks()[0];
        const sender = peerConnection.getSenders().find(
          (s) => s.track && s.track.kind === 'video'
        );

        if (sender && videoTrack) {
          await sender.replaceTrack(videoTrack);
        }

        // Handle stop sharing
        videoTrack.onended = () => {
          stopScreenShare();
        };
      }
    } catch (error) {
      console.error('Error starting screen share:', error);
      setIsScreenSharing(false);
    }
  };

  const stopScreenShare = async () => {
    if (screenStream) {
      screenStream.getTracks().forEach((track) => track.stop());
      setScreenStream(null);
      setIsScreenSharing(false);

      // Restore camera track
      if (peerConnection && localStream) {
        const cameraTrack = localStream.getVideoTracks()[0];
        const sender = peerConnection.getSenders().find(
          (s) => s.track && s.track.kind === 'video'
        );

        if (sender && cameraTrack) {
          await sender.replaceTrack(cameraTrack);
        }
      }
    }
  };

  return { startScreenShare, stopScreenShare };
};

