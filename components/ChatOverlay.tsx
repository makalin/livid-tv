'use client';

import { useEffect, useRef, useState } from 'react';
import { useStore } from '@/store/useStore';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatOverlay() {
  const { messages, hudOpacity } = useStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div
      className="absolute top-4 left-4 w-80 max-h-96 z-20 overflow-hidden"
      style={{ opacity: hudOpacity }}
    >
      <div className="glass-dark rounded-lg p-4 flex flex-col h-full max-h-96">
        <h3 className="text-white text-sm font-semibold mb-2">Chat</h3>
        <div className="flex-1 overflow-y-auto hide-scrollbar space-y-2 mb-2">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="glass rounded-lg p-2 text-white text-sm"
              >
                <div className="text-xs text-gray-300 mb-1">{message.from}</div>
                <div>{message.text}</div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
}

