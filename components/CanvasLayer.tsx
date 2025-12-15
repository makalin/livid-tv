'use client';

import { useEffect, useRef, useState } from 'react';
import { useStore, DrawingStroke } from '@/store/useStore';
import { useWebRTC } from '@/hooks/useWebRTC';

export default function CanvasLayer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([]);
  const { strokes, addStroke, setCurrentStroke, drawingTool, widgets } = useStore();
  const { sendDrawingData } = useWebRTC();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Draw all strokes
    const drawStrokes = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      strokes.forEach((stroke) => {
        if (stroke.points.length < 2) return;

        // Check if this is an eraser stroke
        const isEraser = stroke.color === '#000000' && stroke.lineWidth > 5;
        
        if (isEraser) {
          ctx.globalCompositeOperation = 'destination-out';
        }

        ctx.beginPath();
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.lineWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        for (let i = 1; i < stroke.points.length; i++) {
          ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
        }
        ctx.stroke();

        if (isEraser) {
          ctx.globalCompositeOperation = 'source-over';
        }
      });

      // Draw current path
      if (currentPath.length > 1 && drawingTool.type === 'pen') {
        ctx.beginPath();
        ctx.strokeStyle = drawingTool.color;
        ctx.lineWidth = drawingTool.lineWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.moveTo(currentPath[0].x, currentPath[0].y);
        for (let i = 1; i < currentPath.length; i++) {
          ctx.lineTo(currentPath[i].x, currentPath[i].y);
        }
        ctx.stroke();
      } else if (currentPath.length === 2 && drawingTool.type === 'eraser') {
        // Eraser mode - draw white over existing content
        ctx.beginPath();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = drawingTool.lineWidth * 2;
        ctx.lineCap = 'round';
        ctx.globalCompositeOperation = 'destination-out';
        ctx.moveTo(currentPath[0].x, currentPath[0].y);
        ctx.lineTo(currentPath[1].x, currentPath[1].y);
        ctx.stroke();
        ctx.globalCompositeOperation = 'source-over';
      }

      // Draw image widgets
      widgets
        .filter((w) => w.type === 'image' && w.imageData)
        .forEach((widget) => {
          const img = new Image();
          img.onload = () => {
            ctx.drawImage(
              img,
              widget.x,
              widget.y,
              widget.width || img.width,
              widget.height || img.height
            );
          };
          img.src = widget.imageData || '';
        });
    };

    drawStrokes();
  }, [strokes, currentPath, widgets]);

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    // Don't start drawing if text tool is active
    if (drawingTool.type === 'text') {
      return;
    }
    setIsDrawing(true);
    const coords = getCoordinates(e);
    setCurrentPath([coords]);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();

    const coords = getCoordinates(e);
    setCurrentPath((prev) => [...prev, coords]);
  };

  const stopDrawing = () => {
    if (!isDrawing || currentPath.length === 0) return;

    const stroke: DrawingStroke = {
      id: Date.now().toString(),
      points: currentPath,
      color: drawingTool.type === 'eraser' ? '#000000' : drawingTool.color,
      lineWidth: drawingTool.type === 'eraser' ? drawingTool.lineWidth * 2 : drawingTool.lineWidth,
      timestamp: Date.now(),
    };

    addStroke(stroke);
    sendDrawingData(stroke);
    setCurrentPath([]);
    setIsDrawing(false);
  };

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full z-10 cursor-crosshair"
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={stopDrawing}
      onMouseLeave={stopDrawing}
      onTouchStart={startDrawing}
      onTouchMove={draw}
      onTouchEnd={stopDrawing}
    />
  );
}

