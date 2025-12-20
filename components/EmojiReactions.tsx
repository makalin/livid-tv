'use client';

import { useState, useEffect, memo } from 'react';
import { useStore } from '@/store/useStore';
import { useWebRTC } from '@/hooks/useWebRTC';
import { useDraggable } from '@/hooks/useDraggable';
import { motion, AnimatePresence } from 'framer-motion';

const EMOJIS = ['👍', '❤️', '😂', '🎉', '🔥', '👏', '💯', '🎯', '🚀', '⭐'];
const EMOJI_LIFETIME = 5000; // 5 seconds before auto-removal
const FLY_DISTANCE = -400; // How far up emojis fly (negative = up)

// Memoized emoji widget component to prevent unnecessary re-renders
const EmojiWidget = memo(({ widget, currentTime, removeWidget }: { widget: any; currentTime: number; removeWidget: (id: string) => void }) => {
  const { isDragging, widgetRef, handleMouseDown, handleTouchStart } = useDraggable(widget.id);

  // Calculate animation progress based on widget timestamp and current time
  const age = currentTime - widget.timestamp;
  const animationProgress = Math.min(age / EMOJI_LIFETIME, 1);

  // Calculate animation values
  const fadeStart = 0.75; // Start fading at 75% of lifetime
  const currentOpacity = animationProgress < fadeStart 
    ? 1 
    : 1 - ((animationProgress - fadeStart) / (1 - fadeStart));
  const currentScale = isDragging ? 1.3 : Math.min(0.7 + (animationProgress * 0.5), 1.2);
  const flyOffset = FLY_DISTANCE * animationProgress;

  // Auto-remove when expired
  useEffect(() => {
    if (animationProgress >= 1 && !isDragging) {
      const timeoutId = setTimeout(() => {
        removeWidget(widget.id);
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [animationProgress, widget.id, isDragging, removeWidget]);

  return (
    <motion.div
      ref={widgetRef}
      key={widget.id}
      initial={{ opacity: 0, scale: 0.5, y: 0 }}
      animate={{ 
        opacity: isDragging ? 1 : currentOpacity, 
        scale: currentScale,
        y: isDragging ? 0 : flyOffset,
      }}
      exit={{ 
        opacity: 0, 
        scale: 0,
        y: FLY_DISTANCE,
        transition: { duration: 0.3, ease: 'easeIn' }
      }}
      transition={{ 
        duration: 0.1,
        ease: 'linear'
      }}
      className="fixed text-4xl cursor-move select-none pointer-events-auto"
      style={{ 
        position: 'fixed',
        left: `${widget.x}px`, 
        top: `${widget.y}px`,
        zIndex: isDragging ? 50 : 25,
        filter: isDragging ? 'drop-shadow(0 8px 16px rgba(0,0,0,0.5))' : 'drop-shadow(2px 2px 4px rgba(0,0,0,0.8))',
        textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
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
});

EmojiWidget.displayName = 'EmojiWidget';

export default function EmojiReactions() {
  const { widgets, addWidget, removeWidget, hudOpacity } = useStore();
  const { sendWidget } = useWebRTC();
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Update time continuously for all animations - use requestAnimationFrame for smoother updates
  useEffect(() => {
    let animationFrameId: number;
    const updateTime = () => {
      setCurrentTime(Date.now());
      animationFrameId = requestAnimationFrame(updateTime);
    };
    animationFrameId = requestAnimationFrame(updateTime);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // Auto-remove expired emojis
  useEffect(() => {
    const expiredWidgets = widgets
      .filter((w) => w.type === 'emoji')
      .filter((widget) => {
        const age = currentTime - widget.timestamp;
        return age >= EMOJI_LIFETIME;
      });
    
    expiredWidgets.forEach((widget) => {
      removeWidget(widget.id);
    });
  }, [currentTime, widgets, removeWidget]);

  const addReaction = (emoji: string) => {
    const widget = {
      id: Date.now().toString(),
      type: 'emoji' as const,
      content: emoji,
      x: Math.random() * (window.innerWidth - 100) + 50,
      y: window.innerHeight - 200, // Start near bottom (above controls)
      timestamp: Date.now(),
    };

    addWidget(widget);
    sendWidget(widget);
  };

  return (
    <>
      {/* Emoji Button Bar */}
      <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-20" style={{ position: 'fixed' }}>
        <div className="glass-dark rounded-lg p-2 flex gap-2" style={{ opacity: hudOpacity }}>
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                addReaction(emoji);
              }}
              className="glass rounded-lg p-2 text-2xl hover:scale-110 transition-transform"
              title={`React with ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Render floating emojis - positioned fixed relative to viewport */}
      <AnimatePresence mode="popLayout">
        {widgets
          .filter((w) => w.type === 'emoji')
          .map((widget) => (
            <EmojiWidget 
              key={widget.id} 
              widget={widget} 
              currentTime={currentTime} 
              removeWidget={removeWidget}
            />
          ))}
      </AnimatePresence>
    </>
  );
}

