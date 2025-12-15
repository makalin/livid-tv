'use client';

import { useStore } from '@/store/useStore';
import { useWebRTC } from '@/hooks/useWebRTC';
import { useDraggable } from '@/hooks/useDraggable';
import { motion, AnimatePresence } from 'framer-motion';

const EMOJIS = ['👍', '❤️', '😂', '🎉', '🔥', '👏', '💯', '🎯', '🚀', '⭐'];

export default function EmojiReactions() {
  const { widgets, addWidget, removeWidget, hudOpacity } = useStore();
  const { sendWidget } = useWebRTC();

  const addReaction = (emoji: string) => {
    const widget = {
      id: Date.now().toString(),
      type: 'emoji' as const,
      content: emoji,
      x: Math.random() * (window.innerWidth - 100) + 50,
      y: Math.random() * (window.innerHeight - 100) + 50,
      timestamp: Date.now(),
    };

    addWidget(widget);
    sendWidget(widget);
  };

  return (
    <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 z-20">
      <div className="glass-dark rounded-lg p-2 flex gap-2" style={{ opacity: hudOpacity }}>
        {EMOJIS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => addReaction(emoji)}
            className="glass rounded-lg p-2 text-2xl hover:scale-110 transition-transform"
            title={`React with ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Render floating emojis */}
      <AnimatePresence>
        {widgets
          .filter((w) => w.type === 'emoji')
          .map((widget) => {
            const EmojiWidget = () => {
              const { isDragging, widgetRef, handleMouseDown, handleTouchStart } = useDraggable(widget.id);
              const isNew = Date.now() - widget.timestamp < 2000;

              return (
                <motion.div
                  ref={widgetRef}
                  key={widget.id}
                  initial={isNew ? { opacity: 0, scale: 0, y: 0 } : false}
                  animate={{ 
                    opacity: 1, 
                    scale: isDragging ? 1.3 : 1,
                    y: isNew && !isDragging ? -50 : 0,
                    zIndex: isDragging ? 50 : 15,
                  }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={isNew ? { duration: 2 } : { duration: 0.2 }}
                  className="absolute text-4xl cursor-move select-none"
                  style={{ 
                    left: widget.x, 
                    top: widget.y,
                    filter: isDragging ? 'drop-shadow(0 8px 16px rgba(0,0,0,0.5))' : 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))',
                  }}
                  onMouseDown={handleMouseDown}
                  onTouchStart={handleTouchStart}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    removeWidget(widget.id);
                  }}
                >
                  {widget.content}
                  {isDragging && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></div>
                  )}
                </motion.div>
              );
            };

            return <EmojiWidget key={widget.id} />;
          })}
      </AnimatePresence>
    </div>
  );
}

