'use client';

import { useEffect, useRef, useState } from 'react';
import { useStore } from '@/store/useStore';

export default function VideoLayer() {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null);
  const [showRemoteVideo, setShowRemoteVideo] = useState(true);
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
    if (typeof window === 'undefined') return;
    
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
      if (localVideo) {
        localVideo.style.display = 'block';
      }
      return;
    }

    // Hide video, show canvas
    localVideo.style.display = 'none';
    canvas.style.display = 'block';
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match full viewport
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let animationFrameId: number;
    let isDrawing = true;

    const drawFrame = () => {
      if (!isDrawing || !localVideo.videoWidth || !localVideo.videoHeight) {
        if (isDrawing) {
          animationFrameId = requestAnimationFrame(drawFrame);
        }
        return;
      }

      // Update canvas size to match viewport (full screen)
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // Draw background
      if (virtualBackgroundType === 'blur') {
        // Draw blurred video as background (full screen)
        ctx.save();
        ctx.filter = 'blur(20px) brightness(1.2)';
        // Scale video to cover canvas while maintaining aspect ratio
        const videoAspect = localVideo.videoWidth / localVideo.videoHeight;
        const canvasAspect = canvas.width / canvas.height;
        let drawWidth = canvas.width;
        let drawHeight = canvas.height;
        let offsetX = 0;
        let offsetY = 0;

        if (videoAspect > canvasAspect) {
          // Video is wider - fit to height
          drawHeight = canvas.height;
          drawWidth = drawHeight * videoAspect;
          offsetX = (canvas.width - drawWidth) / 2;
        } else {
          // Video is taller - fit to width
          drawWidth = canvas.width;
          drawHeight = drawWidth / videoAspect;
          offsetY = (canvas.height - drawHeight) / 2;
        }
        ctx.drawImage(localVideo, offsetX, offsetY, drawWidth, drawHeight);
        ctx.restore();
      } else if (virtualBackgroundType === 'image' && backgroundImage) {
        // Draw background image, scaled to cover (full screen)
        const scale = Math.max(
          canvas.width / backgroundImage.width,
          canvas.height / backgroundImage.height
        );
        const x = (canvas.width - backgroundImage.width * scale) / 2;
        const y = (canvas.height - backgroundImage.height * scale) / 2;
        ctx.drawImage(
          backgroundImage,
          x,
          y,
          backgroundImage.width * scale,
          backgroundImage.height * scale
        );
      }

      // Draw foreground video (person) - full screen with proper scaling
      ctx.globalCompositeOperation = 'source-over';
      const videoAspect = localVideo.videoWidth / localVideo.videoHeight;
      const canvasAspect = canvas.width / canvas.height;
      let drawWidth = canvas.width;
      let drawHeight = canvas.height;
      let offsetX = 0;
      let offsetY = 0;

      if (videoAspect > canvasAspect) {
        // Video is wider - fit to height
        drawHeight = canvas.height;
        drawWidth = drawHeight * videoAspect;
        offsetX = (canvas.width - drawWidth) / 2;
      } else {
        // Video is taller - fit to width
        drawWidth = canvas.width;
        drawHeight = drawWidth / videoAspect;
        offsetY = (canvas.height - drawHeight) / 2;
      }
      ctx.drawImage(localVideo, offsetX, offsetY, drawWidth, drawHeight);

      if (isDrawing) {
        animationFrameId = requestAnimationFrame(drawFrame);
      }
    };

    const startDrawing = () => {
      if (localVideo.readyState >= 2) {
        drawFrame();
      } else {
        localVideo.addEventListener('loadeddata', drawFrame, { once: true });
      }
    };

    startDrawing();

    return () => {
      isDrawing = false;
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
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
      {/* Local video - full screen (broadcaster's view) */}
      <div className="absolute inset-0 w-full h-full z-0">
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          style={{ display: virtualBackgroundType === 'none' ? 'block' : 'none' }}
        />
        <canvas
          ref={canvasRef}
          className="w-full h-full object-cover"
          style={{ display: virtualBackgroundType !== 'none' ? 'block' : 'none' }}
        />
      </div>
      
      {/* Remote video - small preview window (other users) */}
      {remoteStream && showRemoteVideo && (
        <div className="absolute bottom-4 right-4 w-64 h-48 rounded-lg overflow-hidden shadow-2xl border-2 border-white/20 z-30" style={{ position: 'fixed' }}>
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          {/* Minimize button for remote video */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowRemoteVideo(false);
            }}
            className="absolute top-2 right-2 glass-dark rounded-full w-6 h-6 flex items-center justify-center text-white text-xs hover:bg-red-500/50 transition-colors z-40"
            title="Minimize remote video"
          >
            ×
          </button>
        </div>
      )}
      
      {/* Show remote video button when minimized */}
      {remoteStream && !showRemoteVideo && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowRemoteVideo(true);
          }}
          className="absolute bottom-4 right-4 glass-dark rounded-lg px-4 py-2 text-white text-sm hover:bg-white/20 transition-colors z-30"
          style={{ position: 'fixed' }}
          title="Show remote video"
        >
          👤 Show Remote
        </button>
      )}
    </div>
  );
}

