'use client';

import { useStore } from '@/store/useStore';
import { useWebRTC } from '@/hooks/useWebRTC';
import { useScreenShare } from '@/hooks/useScreenShare';
import { useRecording } from '@/hooks/useRecording';
import VirtualBackground from '@/components/VirtualBackground';

export default function Controls() {
  const {
    isMuted,
    isVideoEnabled,
    hudOpacity,
    chatInput,
    setChatInput,
    toggleMute,
    toggleVideo,
    setHudOpacity,
    addMessage,
    clearStrokes,
    isScreenSharing,
    isRecording,
    showDrawingTools,
    setShowDrawingTools,
    showSettings,
    setShowSettings,
  } = useStore();
  const { sendChatMessage } = useWebRTC();
  const { startScreenShare, stopScreenShare } = useScreenShare();
  const { startRecording, stopRecording } = useRecording();

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    addMessage({
      id: Date.now().toString(),
      text: chatInput,
      timestamp: Date.now(),
      from: 'You',
    });

    sendChatMessage(chatInput);
    setChatInput('');
  };

  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex items-center gap-4">
      {/* Chat Input */}
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder="Type a message..."
          className="glass-dark rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 min-w-[300px]"
          style={{ opacity: hudOpacity }}
        />
        <button
          type="submit"
          className="glass-dark rounded-lg px-4 py-2 text-white hover:bg-white/20 transition-colors"
          style={{ opacity: hudOpacity }}
        >
          Send
        </button>
      </form>

      {/* Control Buttons */}
      <div className="flex gap-2" style={{ opacity: hudOpacity }}>
        <button
          onClick={toggleMute}
          className={`glass-dark rounded-lg p-3 text-white hover:bg-white/20 transition-colors ${
            isMuted ? 'bg-red-500/50' : ''
          }`}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? '🔇' : '🔊'}
        </button>

        <button
          onClick={toggleVideo}
          className={`glass-dark rounded-lg p-3 text-white hover:bg-white/20 transition-colors ${
            !isVideoEnabled ? 'bg-red-500/50' : ''
          }`}
          title={isVideoEnabled ? 'Turn off video' : 'Turn on video'}
        >
          {isVideoEnabled ? '📹' : '📷'}
        </button>

        <button
          onClick={clearStrokes}
          className="glass-dark rounded-lg p-3 text-white hover:bg-white/20 transition-colors"
          title="Clear canvas"
        >
          🗑️
        </button>

        <button
          onClick={() => setShowDrawingTools(!showDrawingTools)}
          className={`glass-dark rounded-lg p-3 text-white hover:bg-white/20 transition-colors ${
            showDrawingTools ? 'bg-blue-500/50' : ''
          }`}
          title="Drawing Tools (Ctrl+D)"
        >
          ✏️
        </button>

        <button
          onClick={isScreenSharing ? stopScreenShare : startScreenShare}
          className={`glass-dark rounded-lg p-3 text-white hover:bg-white/20 transition-colors ${
            isScreenSharing ? 'bg-green-500/50' : ''
          }`}
          title="Screen Share (Shift+S)"
        >
          🖥️
        </button>

        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`glass-dark rounded-lg p-3 text-white hover:bg-white/20 transition-colors ${
            isRecording ? 'bg-red-500/50 animate-pulse' : ''
          }`}
          title="Record Session"
        >
          {isRecording ? '⏹️' : '🔴'}
        </button>

        <VirtualBackground />

        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`glass-dark rounded-lg p-3 text-white hover:bg-white/20 transition-colors ${
            showSettings ? 'bg-blue-500/50' : ''
          }`}
          title="Settings"
        >
          ⚙️
        </button>

        {/* Opacity Slider */}
        <div className="glass-dark rounded-lg px-4 py-2 flex items-center gap-2">
          <span className="text-white text-xs">Opacity</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={hudOpacity}
            onChange={(e) => setHudOpacity(parseFloat(e.target.value))}
            className="w-20"
          />
        </div>
      </div>
    </div>
  );
}

