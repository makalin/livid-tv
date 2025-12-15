'use client';

import { useRef, useState } from 'react';
import { useStore } from '@/store/useStore';
import { motion, AnimatePresence } from 'framer-motion';

const PRESET_BACKGROUNDS = [
  { name: 'Blur', type: 'blur' as const },
  { name: 'Office', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800' },
  { name: 'Nature', url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800' },
  { name: 'Space', url: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800' },
];

export default function VirtualBackground() {
  const {
    virtualBackground,
    virtualBackgroundType,
    setVirtualBackground,
    hudOpacity,
  } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showBackgroundPicker, setShowBackgroundPicker] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageData = event.target?.result as string;
      setVirtualBackground(imageData, 'image');
    };
    reader.readAsDataURL(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const applyBackground = (type: 'none' | 'blur' | 'image', url?: string) => {
    setVirtualBackground(url || null, type);
    setShowBackgroundPicker(false);
  };

  return (
    <AnimatePresence>
      {showBackgroundPicker && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
          onClick={() => setShowBackgroundPicker(false)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className="glass-dark rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
            style={{ opacity: hudOpacity }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-white text-xl font-semibold mb-4">Virtual Background</h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {/* None */}
              <button
                onClick={() => applyBackground('none')}
                className={`glass rounded-lg p-4 text-white hover:bg-white/20 transition-colors ${
                  virtualBackgroundType === 'none' ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <div className="text-2xl mb-2">🚫</div>
                <div className="text-sm">None</div>
              </button>

              {/* Blur */}
              <button
                onClick={() => applyBackground('blur')}
                className={`glass rounded-lg p-4 text-white hover:bg-white/20 transition-colors ${
                  virtualBackgroundType === 'blur' ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <div className="text-2xl mb-2">🌫️</div>
                <div className="text-sm">Blur</div>
              </button>

              {/* Preset Backgrounds */}
              {PRESET_BACKGROUNDS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => {
                    if (preset.type === 'blur') {
                      applyBackground('blur');
                    } else if (preset.url) {
                      applyBackground('image', preset.url);
                    }
                  }}
                  className={`glass rounded-lg overflow-hidden hover:bg-white/20 transition-colors ${
                    virtualBackground === preset.url ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  {preset.url ? (
                    <img
                      src={preset.url}
                      alt={preset.name}
                      className="w-full h-24 object-cover"
                    />
                  ) : (
                    <div className="w-full h-24 flex items-center justify-center text-2xl">
                      🌫️
                    </div>
                  )}
                  <div className="p-2 text-white text-xs">{preset.name}</div>
                </button>
              ))}
            </div>

            {/* Custom Upload */}
            <div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full glass rounded-lg px-4 py-3 text-white hover:bg-white/20 transition-colors"
              >
                📁 Upload Custom Image
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            <button
              onClick={() => setShowBackgroundPicker(false)}
              className="mt-4 w-full glass rounded-lg px-4 py-2 text-white hover:bg-white/20 transition-colors"
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}

      {/* Toggle Button - Only show when settings panel is not open */}
      {!showBackgroundPicker && (
        <button
          onClick={() => setShowBackgroundPicker(true)}
          className={`glass-dark rounded-lg px-4 py-2 text-white text-sm hover:bg-white/20 transition-colors ${
            virtualBackgroundType !== 'none' ? 'bg-blue-500/50' : ''
          }`}
          style={{ opacity: hudOpacity }}
          title="Virtual Background"
        >
          🎭 Background
        </button>
      )}
    </AnimatePresence>
  );
}

