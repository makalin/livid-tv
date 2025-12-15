'use client';

import { useRef } from 'react';
import { useStore } from '@/store/useStore';
import { useWebRTC } from '@/hooks/useWebRTC';
import { useDraggable } from '@/hooks/useDraggable';
import { motion } from 'framer-motion';

export default function ImageOverlay() {
  const { widgets, addWidget, removeWidget, hudOpacity } = useStore();
  const { sendWidget } = useWebRTC();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageData = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const maxWidth = 400;
        const maxHeight = 300;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = width * ratio;
          height = height * ratio;
        }

        const widget = {
          id: Date.now().toString(),
          type: 'image' as const,
          content: file.name,
          x: (window.innerWidth - width) / 2,
          y: (window.innerHeight - height) / 2,
          width,
          height,
          imageData,
          timestamp: Date.now(),
        };

        addWidget(widget);
        sendWidget(widget);
      };
      img.src = imageData;
    };
    reader.readAsDataURL(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };


  return (
    <>
      {/* Upload Button */}
      <div className="absolute top-20 right-4 z-30" style={{ opacity: hudOpacity }}>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="glass-dark rounded-lg px-4 py-2 text-white text-sm hover:bg-white/20 transition-colors"
          title="Upload Image Overlay"
        >
          🖼️ Upload Image
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>

      {/* Render Image Widgets */}
      {widgets
        .filter((w) => w.type === 'image')
        .map((widget) => {
          const ImageWidget = () => {
            const { isDragging, widgetRef, handleMouseDown, handleTouchStart } = useDraggable(widget.id);

            return (
              <motion.div
                ref={widgetRef}
                key={widget.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: 1, 
                  scale: isDragging ? 1.05 : 1,
                  zIndex: isDragging ? 50 : 15,
                }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute cursor-move"
                style={{
                  left: widget.x,
                  top: widget.y,
                  width: widget.width,
                  height: widget.height,
                }}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
              >
                <img
                  src={widget.imageData}
                  alt={widget.content}
                  className="w-full h-full object-contain rounded-lg shadow-2xl border-2 border-white/20"
                  draggable={false}
                  style={{
                    filter: isDragging ? 'drop-shadow(0 8px 16px rgba(0,0,0,0.5))' : 'none',
                  }}
                />
                {isDragging && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></div>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeWidget(widget.id);
                  }}
                  className="absolute -top-2 -right-2 glass-dark rounded-full w-6 h-6 flex items-center justify-center text-white text-xs hover:bg-red-500/50 transition-colors z-10"
                >
                  ×
                </button>
              </motion.div>
            );
          };

          return <ImageWidget key={widget.id} />;
        })}
    </>
  );
}

