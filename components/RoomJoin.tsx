'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';

export default function RoomJoin() {
  const [inputRoomId, setInputRoomId] = useState('');
  const [inputPassword, setInputPassword] = useState('');
  const { setRoomId, roomPassword, setRoomPassword } = useStore();

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputRoomId.trim()) {
      setRoomId(inputRoomId.trim());
      if (inputPassword.trim()) {
        setRoomPassword(inputPassword.trim());
      }
    } else {
      // Generate random room ID
      const randomId = Math.random().toString(36).substring(2, 9);
      setRoomId(randomId);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-black">
      <div className="glass rounded-2xl p-8 max-w-md w-full">
        <h1 className="text-4xl font-bold text-white mb-2 text-center">LiVid TV</h1>
        <p className="text-gray-300 text-center mb-6">Live Video, Reimagined</p>
        
        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label htmlFor="roomId" className="block text-white text-sm mb-2">
              Room ID (leave empty to create new room)
            </label>
            <input
              id="roomId"
              type="text"
              value={inputRoomId}
              onChange={(e) => setInputRoomId(e.target.value)}
              placeholder="Enter room ID..."
              className="w-full glass-dark rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-white text-sm mb-2">
              Password (optional)
            </label>
            <input
              id="password"
              type="password"
              value={inputPassword}
              onChange={(e) => setInputPassword(e.target.value)}
              placeholder="Enter password..."
              className="w-full glass-dark rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-white/20 hover:bg-white/30 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            Join Room
          </button>
        </form>
      </div>
    </div>
  );
}

