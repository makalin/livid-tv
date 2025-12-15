import { useEffect } from 'react';
import { useStore } from '@/store/useStore';

export const useKeyboardShortcuts = () => {
  const {
    toggleMute,
    toggleVideo,
    undoStroke,
    redoStroke,
    clearStrokes,
    setShowDrawingTools,
    showDrawingTools,
    setIsScreenSharing,
    isScreenSharing,
  } = useStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Ctrl/Cmd + Key combinations
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              redoStroke();
            } else {
              undoStroke();
            }
            break;
          case 'y':
            e.preventDefault();
            redoStroke();
            break;
          case 'd':
            e.preventDefault();
            setShowDrawingTools(!showDrawingTools);
            break;
        }
      }

      // Single key shortcuts
      switch (e.key.toLowerCase()) {
        case 'm':
          if (!e.ctrlKey && !e.metaKey) {
            toggleMute();
          }
          break;
        case 'v':
          if (!e.ctrlKey && !e.metaKey) {
            toggleVideo();
          }
          break;
        case 's':
          if (!e.ctrlKey && !e.metaKey && e.shiftKey) {
            e.preventDefault();
            setIsScreenSharing(!isScreenSharing);
          }
          break;
        case 'delete':
        case 'backspace':
          if (!e.ctrlKey && !e.metaKey) {
            clearStrokes();
          }
          break;
        case 'escape':
          setShowDrawingTools(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    toggleMute,
    toggleVideo,
    undoStroke,
    redoStroke,
    clearStrokes,
    setShowDrawingTools,
    showDrawingTools,
    setIsScreenSharing,
    isScreenSharing,
  ]);
};

