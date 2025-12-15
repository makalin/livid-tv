'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { motion, AnimatePresence } from 'framer-motion';

export default function RoomSettings() {
  const { showSettings, setShowSettings, roomId, setRoomPassword, roomPassword, hudOpacity } = useStore();
  const [passwordInput, setPasswordInput] = useState('');

  const handleSetPassword = () => {
    setRoomPassword(passwordInput || null);
    setPasswordInput('');
  };

  const copyRoomId = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
    }
  };

  if (!showSettings) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center"
        onClick={() => setShowSettings(false)}
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.9 }}
          className="glass-dark rounded-lg p-6 max-w-md w-full mx-4"
          style={{ opacity: hudOpacity }}
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-white text-xl font-semibold mb-4">Room Settings</h2>

          <div className="space-y-4">
            {/* Room ID */}
            <div>
              <label className="block text-white text-sm mb-2">Room ID</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={roomId || ''}
                  readOnly
                  className="flex-1 glass rounded-lg px-4 py-2 text-white"
                />
                <button
                  onClick={copyRoomId}
                  className="glass rounded-lg px-4 py-2 text-white hover:bg-white/20 transition-colors"
                >
                  📋 Copy
                </button>
              </div>
            </div>

            {/* Password Protection */}
            <div>
              <label className="block text-white text-sm mb-2">Password Protection</label>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder={roomPassword ? 'Change password...' : 'Set password...'}
                  className="flex-1 glass rounded-lg px-4 py-2 text-white placeholder-gray-400"
                />
                <button
                  onClick={handleSetPassword}
                  className="glass rounded-lg px-4 py-2 text-white hover:bg-white/20 transition-colors"
                >
                  {roomPassword ? 'Update' : 'Set'}
                </button>
              </div>
              {roomPassword && (
                <button
                  onClick={() => {
                    setRoomPassword(null);
                    setPasswordInput('');
                  }}
                  className="mt-2 text-red-400 text-sm hover:text-red-300"
                >
                  Remove Password
                </button>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={() => setShowSettings(false)}
              className="w-full glass rounded-lg px-4 py-2 text-white hover:bg-white/20 transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

