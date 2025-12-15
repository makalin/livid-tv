'use client';

import { useRef } from 'react';
import { useStore } from '@/store/useStore';
import { useFileShare } from '@/hooks/useFileShare';
import { motion, AnimatePresence } from 'framer-motion';

export default function FileShare() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { sharedFiles, hudOpacity } = useStore();
  const { shareFile, downloadFile } = useFileShare();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      shareFile(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="absolute top-20 right-4 z-30" style={{ opacity: hudOpacity }}>
      <button
        onClick={() => fileInputRef.current?.click()}
        className="glass-dark rounded-lg px-4 py-2 text-white text-sm hover:bg-white/20 transition-colors mb-2"
        title="Share File"
      >
        📎 Share File
      </button>
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Shared Files List */}
      <AnimatePresence>
        {sharedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="glass-dark rounded-lg p-3 space-y-2 min-w-[250px] max-h-64 overflow-y-auto"
          >
            <h3 className="text-white text-sm font-semibold">Shared Files</h3>
            {sharedFiles.map((file) => (
              <div
                key={file.id}
                className="glass rounded-lg p-2 flex items-center justify-between"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-white text-xs truncate">{file.name}</div>
                  <div className="text-gray-400 text-xs">
                    {(file.size / 1024).toFixed(2)} KB
                  </div>
                </div>
                <button
                  onClick={() => downloadFile(file)}
                  className="ml-2 glass rounded px-2 py-1 text-white text-xs hover:bg-white/20 transition-colors"
                >
                  ⬇️
                </button>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

