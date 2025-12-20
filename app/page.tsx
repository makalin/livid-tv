'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import RoomJoin from '@/components/RoomJoin';
import VideoLayer from '@/components/VideoLayer';
import CanvasLayer from '@/components/CanvasLayer';
import ChatOverlay from '@/components/ChatOverlay';
import Controls from '@/components/Controls';
import DrawingTools from '@/components/DrawingTools';
import ConnectionStats from '@/components/ConnectionStats';
import EmojiReactions from '@/components/EmojiReactions';
import FileShare from '@/components/FileShare';
import RoomSettings from '@/components/RoomSettings';
import ImageOverlay from '@/components/ImageOverlay';
import TextTool from '@/components/TextTool';
import { useWebRTC } from '@/hooks/useWebRTC';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useReconnection } from '@/hooks/useReconnection';

export default function Home() {
  const { roomId, isConnected } = useStore();
  
  useWebRTC(); // Initialize WebRTC connection
  useKeyboardShortcuts(); // Initialize keyboard shortcuts
  useReconnection(); // Handle reconnection logic

  if (!roomId) {
    return <RoomJoin />;
  }

  return (
    <main className="relative w-full h-screen overflow-hidden bg-black" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
      <VideoLayer />
      <CanvasLayer />
      <ChatOverlay />
      <Controls />
      <DrawingTools />
      <ConnectionStats />
      <EmojiReactions />
      <FileShare />
      <ImageOverlay />
      <TextTool />
      <RoomSettings />
      
      {/* Connection Status */}
      {!isConnected && (
        <div className="absolute top-4 left-4 z-30 glass-dark rounded-lg px-4 py-2 text-white text-sm animate-pulse">
          🔄 Connecting...
        </div>
      )}
      
      {/* Room ID Display */}
      {isConnected && (
        <div className="absolute top-4 left-4 z-30 glass-dark rounded-lg px-4 py-2 text-white text-sm">
          🟢 Room: {roomId}
        </div>
      )}

      {/* Keyboard Shortcuts Help */}
      <div className="absolute bottom-4 right-4 z-30 glass-dark rounded-lg px-3 py-2 text-white text-xs opacity-50 hover:opacity-100 transition-opacity">
        <div className="space-y-1">
          <div><kbd className="px-1 bg-white/20 rounded">M</kbd> Mute</div>
          <div><kbd className="px-1 bg-white/20 rounded">V</kbd> Video</div>
          <div><kbd className="px-1 bg-white/20 rounded">Ctrl+Z</kbd> Undo</div>
          <div><kbd className="px-1 bg-white/20 rounded">Ctrl+D</kbd> Tools</div>
        </div>
      </div>
    </main>
  );
}

