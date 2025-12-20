import { useState, useEffect, useRef, useCallback } from 'react';
import { useStore } from '@/store/useStore';
import { useWebRTC } from '@/hooks/useWebRTC';

export const useDraggable = (widgetId: string) => {
  const { widgets, updateWidget } = useStore();
  const { sendWidget } = useWebRTC();
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const widgetRef = useRef<HTMLDivElement>(null);

  const widget = widgets.find((w) => w.id === widgetId);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!widget) return;

    setIsDragging(true);
    const rect = widgetRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    } else {
      setDragOffset({
        x: e.clientX - widget.x,
        y: e.clientY - widget.y,
      });
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (!widget) return;

    setIsDragging(true);
    const touch = e.touches[0];
    const rect = widgetRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      });
    } else {
      setDragOffset({
        x: touch.clientX - widget.x,
        y: touch.clientY - widget.y,
      });
    }
  };

  useEffect(() => {
    if (!isDragging || !widget) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;

      // Get widget dimensions for boundary checking
      const widgetWidth = widget.width || (widgetRef.current?.offsetWidth || 100);
      const widgetHeight = widget.height || (widgetRef.current?.offsetHeight || 50);

      const maxX = window.innerWidth - widgetWidth;
      const maxY = window.innerHeight - widgetHeight;

      updateWidget(widgetId, {
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      });
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      const newX = touch.clientX - dragOffset.x;
      const newY = touch.clientY - dragOffset.y;

      // Get widget dimensions for boundary checking
      const widgetWidth = widget.width || (widgetRef.current?.offsetWidth || 100);
      const widgetHeight = widget.height || (widgetRef.current?.offsetHeight || 50);

      const maxX = window.innerWidth - widgetWidth;
      const maxY = window.innerHeight - widgetHeight;

      updateWidget(widgetId, {
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      });
    };

    const handleMouseUp = () => {
      if (isDragging) {
        // Get current widget state from store
        const currentWidget = useStore.getState().widgets.find((w) => w.id === widgetId);
        if (currentWidget) {
          sendWidget(currentWidget);
        }
        setIsDragging(false);
      }
    };

    const handleTouchEnd = () => {
      if (isDragging) {
        // Get current widget state from store
        const currentWidget = useStore.getState().widgets.find((w) => w.id === widgetId);
        if (currentWidget) {
          sendWidget(currentWidget);
        }
        setIsDragging(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, dragOffset, widgetId, widget?.x, widget?.y, widget?.width, widget?.height, updateWidget, sendWidget]);

  return {
    isDragging,
    widgetRef,
    handleMouseDown,
    handleTouchStart,
  };
};

