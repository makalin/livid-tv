'use client';

import { useState, useRef, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { useWebRTC } from '@/hooks/useWebRTC';
import { useDraggable } from '@/hooks/useDraggable';
import { motion, AnimatePresence } from 'framer-motion';

export default function TextTool() {
  const {
    drawingTool,
    widgets,
    addWidget,
    updateWidget,
    removeWidget,
    hudOpacity,
  } = useStore();
  const { sendWidget } = useWebRTC();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [textInput, setTextInput] = useState('');
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (drawingTool.type === 'text' && editingId === null) {
      // Text tool is active, wait for click to place text
      const handleCanvasClick = (e: MouseEvent) => {
        // Don't trigger if clicking on UI elements
        const target = e.target as HTMLElement;
        if (
          target.closest('.glass') ||
          target.closest('button') ||
          target.closest('input') ||
          target.closest('video') ||
          target.closest('canvas')
        ) {
          return;
        }

        if (drawingTool.type === 'text') {
          setPosition({ x: e.clientX, y: e.clientY });
          setEditingId('new');
          setTextInput('');
          setTimeout(() => inputRef.current?.focus(), 100);
        }
      };

      // Small delay to avoid immediate trigger
      const timeout = setTimeout(() => {
        window.addEventListener('click', handleCanvasClick);
      }, 100);

      return () => {
        clearTimeout(timeout);
        window.removeEventListener('click', handleCanvasClick);
      };
    }
  }, [drawingTool.type, editingId]);

  const handleSaveText = () => {
    if (!textInput.trim()) {
      setEditingId(null);
      return;
    }

    if (editingId === 'new') {
      const widget = {
        id: Date.now().toString(),
        type: 'text' as const,
        content: textInput,
        x: position.x,
        y: position.y,
        fontSize: 24,
        fontColor: drawingTool.color,
        timestamp: Date.now(),
      };
      addWidget(widget);
      sendWidget(widget);
    } else {
      updateWidget(editingId, {
        content: textInput,
        fontColor: drawingTool.color,
      });
      const widget = widgets.find((w) => w.id === editingId);
      if (widget) {
        sendWidget({ ...widget, content: textInput, fontColor: drawingTool.color });
      }
    }

    setEditingId(null);
    setTextInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveText();
    } else if (e.key === 'Escape') {
      setEditingId(null);
      setTextInput('');
    }
  };

  return (
    <>
      {/* Text Input Overlay */}
      <AnimatePresence>
        {editingId && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed z-50"
            style={{
              left: position.x,
              top: position.y,
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleSaveText}
              placeholder="Type text..."
              className="glass-dark rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 min-w-[200px]"
              style={{
                fontSize: `${drawingTool.lineWidth * 4}px`,
                color: drawingTool.color,
                opacity: hudOpacity,
              }}
              autoFocus
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Render Text Widgets */}
      {widgets
        .filter((w) => w.type === 'text')
        .map((widget) => {
          const TextWidget = () => {
            const { isDragging, widgetRef, handleMouseDown, handleTouchStart } = useDraggable(widget.id);
            const [wasDragging, setWasDragging] = useState(false);

            useEffect(() => {
              if (isDragging) {
                setWasDragging(true);
              } else if (wasDragging) {
                // Reset after a short delay to allow click detection
                setTimeout(() => setWasDragging(false), 100);
              }
            }, [isDragging, wasDragging]);

            return (
              <motion.div
                ref={widgetRef}
                key={widget.id}
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: 1,
                  scale: isDragging ? 1.1 : 1,
                  zIndex: isDragging ? 50 : 15,
                }}
                exit={{ opacity: 0 }}
                className="absolute cursor-move select-none"
                style={{
                  left: widget.x,
                  top: widget.y,
                  fontSize: `${widget.fontSize || 24}px`,
                  color: widget.fontColor || '#ffffff',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                  filter: isDragging ? 'drop-shadow(0 8px 16px rgba(0,0,0,0.5))' : 'none',
                }}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                onClick={(e) => {
                  // Only trigger edit if we didn't just finish dragging
                  if (!wasDragging && !isDragging) {
                    setEditingId(widget.id);
                    setTextInput(widget.content);
                    setPosition({ x: widget.x, y: widget.y });
                    setTimeout(() => inputRef.current?.focus(), 100);
                  }
                }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  removeWidget(widget.id);
                }}
              >
                <div className="relative">
                  {widget.content}
                  {isDragging && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
              </motion.div>
            );
          };

          return <TextWidget key={widget.id} />;
        })}
    </>
  );
}

