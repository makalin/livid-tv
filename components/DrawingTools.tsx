'use client';

import { useStore } from '@/store/useStore';
import { motion, AnimatePresence } from 'framer-motion';

const COLORS = [
  '#ffffff', '#000000', '#ff0000', '#00ff00', '#0000ff',
  '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#800080',
];

const BRUSH_SIZES = [1, 2, 3, 5, 8, 12, 16, 20];

export default function DrawingTools() {
  const {
    drawingTool,
    setDrawingTool,
    showDrawingTools,
    setShowDrawingTools,
    hudOpacity,
    undoStroke,
    redoStroke,
    clearStrokes,
  } = useStore();

  if (!showDrawingTools) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        exit={{ x: -300 }}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-30"
        style={{ opacity: hudOpacity }}
      >
        <div className="glass-dark rounded-lg p-4 space-y-4 min-w-[280px]">
          {/* Tool Selection */}
          <div className="space-y-2">
            <h3 className="text-white text-sm font-semibold">Tools</h3>
            <div className="grid grid-cols-3 gap-2">
              {(['pen', 'eraser', 'rectangle', 'circle', 'arrow', 'text'] as const).map((tool) => (
                <button
                  key={tool}
                  onClick={() => {
                    setDrawingTool({ type: tool });
                    if (tool === 'text') {
                      // Text tool will be handled by TextTool component
                    }
                  }}
                  className={`glass rounded-lg p-2 text-white text-xs hover:bg-white/20 transition-colors ${
                    drawingTool.type === tool ? 'ring-2 ring-blue-500' : ''
                  }`}
                  title={tool.charAt(0).toUpperCase() + tool.slice(1)}
                >
                  {tool === 'pen' && '✏️'}
                  {tool === 'eraser' && '🧹'}
                  {tool === 'rectangle' && '▭'}
                  {tool === 'circle' && '○'}
                  {tool === 'arrow' && '→'}
                  {tool === 'text' && '📝'}
                </button>
              ))}
            </div>
          </div>

          {/* Color Picker */}
          {drawingTool.type !== 'eraser' && (
            <div className="space-y-2">
              <h3 className="text-white text-sm font-semibold">Color</h3>
              <div className="grid grid-cols-5 gap-2">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setDrawingTool({ color })}
                    className={`w-8 h-8 rounded-lg border-2 transition-all ${
                      drawingTool.color === color ? 'border-white scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
              <input
                type="color"
                value={drawingTool.color}
                onChange={(e) => setDrawingTool({ color: e.target.value })}
                className="w-full h-10 rounded-lg cursor-pointer"
              />
            </div>
          )}

          {/* Brush Size */}
          <div className="space-y-2">
            <h3 className="text-white text-sm font-semibold">Size</h3>
            <div className="flex gap-2 flex-wrap">
              {BRUSH_SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() => setDrawingTool({ lineWidth: size })}
                  className={`glass rounded-lg px-3 py-1 text-white text-xs hover:bg-white/20 transition-colors ${
                    drawingTool.lineWidth === size ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  {size}px
                </button>
              ))}
            </div>
            <input
              type="range"
              min="1"
              max="20"
              value={drawingTool.lineWidth}
              onChange={(e) => setDrawingTool({ lineWidth: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <button
                onClick={undoStroke}
                className="flex-1 glass rounded-lg px-3 py-2 text-white text-sm hover:bg-white/20 transition-colors"
                title="Undo (Ctrl+Z)"
              >
                ↶ Undo
              </button>
              <button
                onClick={redoStroke}
                className="flex-1 glass rounded-lg px-3 py-2 text-white text-sm hover:bg-white/20 transition-colors"
                title="Redo (Ctrl+Y)"
              >
                ↷ Redo
              </button>
            </div>
            <button
              onClick={clearStrokes}
              className="w-full glass rounded-lg px-3 py-2 text-white text-sm hover:bg-red-500/50 transition-colors"
            >
              🗑️ Clear All
            </button>
          </div>

          {/* Close Button */}
          <button
            onClick={() => setShowDrawingTools(false)}
            className="w-full glass rounded-lg px-3 py-2 text-white text-sm hover:bg-white/20 transition-colors"
          >
            Hide Tools
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

