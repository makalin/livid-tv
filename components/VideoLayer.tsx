'use client';

import { useEffect, useRef, useState } from 'react';
import { useStore } from '@/store/useStore';

export default function VideoLayer() {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null);
  const {
    localStream,
    remoteStream,
    screenStream,
    isVideoEnabled,
    isMuted,
    isScreenSharing,
    virtualBackground,
    virtualBackgroundType,
  } = useStore();

  // Load background image
  useEffect(() => {
    if (virtualBackgroundType === 'image' && virtualBackground) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => setBackgroundImage(img);
      img.onerror = () => setBackgroundImage(null);
      img.src = virtualBackground;
    } else {
      setBackgroundImage(null);
    }
  }, [virtualBackground, virtualBackgroundType]);

  // Apply virtual background
  useEffect(() => {
    const localVideo = localVideoRef.current;
    const canvas = canvasRef.current;
    if (!localVideo || !canvas) return;

    if (virtualBackgroundType === 'none' || !localStream) {
      canvas.style.display = 'none';
      return;
    }

    canvas.style.display = 'block';
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = localVideo.videoWidth || 640;
    canvas.height = localVideo.videoHeight || 480;

    const drawFrame = () => {
      if (!localVideo.videoWidth || !localVideo.videoHeight) {
        requestAnimationFrame(drawFrame);
        return;
      }

      canvas.width = localVideo.videoWidth;
      canvas.height = localVideo.videoHeight;

      // Draw background
      if (virtualBackgroundType === 'blur') {
        // Draw blurred video as background
        ctx.filter = 'blur(20px)';
        ctx.drawImage(localVideo, 0, 0, canvas.width, canvas.height);
        ctx.filter = 'none';
      } else if (virtualBackgroundType === 'image' && backgroundImage) {
        // Draw background image
        ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
      }

      // Draw foreground video (person)
      // Simple chroma key or segmentation would go here
      // For now, we'll use a simple approach with canvas compositing
      ctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(localVideo, 0, 0, canvas.width, canvas.height);

      requestAnimationFrame(drawFrame);
    };

    if (localVideo.readyState >= 2) {
      drawFrame();
    } else {
      localVideo.addEventListener('loadeddata', drawFrame);
    }

    return () => {
      localVideo.removeEventListener('loadeddata', drawFrame);
    };
  }, [localStream, virtualBackgroundType, backgroundImage]);

  useEffect(() => {
    if (localVideoRef.current) {
      const streamToUse = isScreenSharing && screenStream ? screenStream : localStream;
      if (streamToUse) {
        localVideoRef.current.srcObject = streamToUse;
        
        // Update video/audio tracks based on state
        if (localStream) {
          localStream.getVideoTracks().forEach((track) => {
            track.enabled = isVideoEnabled && !isScreenSharing;
          });
          localStream.getAudioTracks().forEach((track) => {
            track.enabled = !isMuted;
          });
        }
      }
    }
  }, [localStream, screenStream, isVideoEnabled, isMuted, isScreenSharing]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  return (
    <div className="absolute inset-0 w-full h-full z-0">
      {/* Remote video - full screen */}
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
      />
      
      {/* Local video - small preview in corner */}
      <div className="absolute bottom-4 right-4 w-48 h-36 rounded-lg overflow-hidden shadow-2xl border-2 border-white/20 z-30">
        {virtualBackgroundType !== 'none' ? (
          <canvas
            ref={canvasRef}
            className="w-full h-full object-cover scale-x-[-1]"
          />
        ) : (
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover scale-x-[-1]"
          />
        )}
      </div>
    </div>
  );
}

