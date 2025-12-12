import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Brush, Eraser, Download, Trash2, Undo, Redo } from 'lucide-react';
import { Slider } from '../components/ui/slider';

type Tool = 'pen' | 'eraser';

export function Whiteboard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<Tool>('pen');
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);
  const cursorPreviewRef = useRef<HTMLDivElement>(null);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size to fill container
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        // Redraw from history if available
        if (historyStep >= 0 && history[historyStep]) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.putImageData(history[historyStep], 0, 0);
          }
        }
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [history, historyStep]);

  // Save state to history
  const saveToHistory = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(imageData);
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  }, [history, historyStep]);

  // Get coordinates from event (mouse or touch)
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

  // Update cursor preview position
  const updateCursorPreview = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCursorPos({ x, y });
  };

  const hideCursorPreview = () => {
    setCursorPos(null);
  };

  // Start drawing
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const { x, y } = getCoordinates(e);

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (tool === 'pen') {
      ctx.strokeStyle = color;
      ctx.globalCompositeOperation = 'source-over';
    } else {
      ctx.strokeStyle = '#ffffff';
      ctx.globalCompositeOperation = 'destination-out';
    }
  };

  // Draw
  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  // Stop drawing
  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveToHistory();
    }
  };

  // Clear canvas
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    saveToHistory();
  };

  // Undo
  const undo = () => {
    if (historyStep > 0) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const newStep = historyStep - 1;
      setHistoryStep(newStep);
      ctx.putImageData(history[newStep], 0, 0);
    } else if (historyStep === 0) {
      clearCanvas();
      setHistoryStep(-1);
    }
  };

  // Redo
  const redo = () => {
    if (historyStep < history.length - 1) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const newStep = historyStep + 1;
      setHistoryStep(newStep);
      ctx.putImageData(history[newStep], 0, 0);
    }
  };

  // Download canvas as image
  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `whiteboard-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  // Load canvas from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('whiteboard-canvas');
    if (saved && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0);
          saveToHistory();
        };
        img.src = saved;
      }
    }
  }, []);

  // Auto-save to localStorage
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || historyStep < 0) return;

    const saveInterval = setInterval(() => {
      const dataUrl = canvas.toDataURL();
      localStorage.setItem('whiteboard-canvas', dataUrl);
    }, 2000); // Save every 2 seconds

    return () => clearInterval(saveInterval);
  }, [historyStep]);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Toolbar */}
      <div className="flex items-center gap-4 p-4 border-b border-border bg-card">
        {/* Tools */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTool('pen')}
            className={`p-2 rounded-lg transition-colors ${
              tool === 'pen'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80 text-muted-foreground'
            }`}
            title="Pen"
          >
            <Brush className="w-5 h-5" />
          </button>
          <button
            onClick={() => setTool('eraser')}
            className={`p-2 rounded-lg transition-colors ${
              tool === 'eraser'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80 text-muted-foreground'
            }`}
            title="Eraser"
          >
            <Eraser className="w-5 h-5" />
          </button>
        </div>

        <div className="w-px h-8 bg-border" />

        {/* Color Picker */}
        {tool === 'pen' && (
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Color:</label>
            <input
              type="color"
              value={color}
              onChange={e => setColor(e.target.value)}
              className="w-10 h-10 rounded border border-border cursor-pointer"
              title="Choose color"
            />
          </div>
        )}

        <div className="w-px h-8 bg-border" />

        {/* Brush Size */}
        <div className="flex items-center gap-3 min-w-[200px]">
          <label className="text-sm text-muted-foreground whitespace-nowrap">Size:</label>
          <Slider
            value={[brushSize]}
            onValueChange={(value) => setBrushSize(value[0])}
            min={1}
            max={50}
            step={1}
            className="flex-1"
          />
          <span className="text-sm font-medium w-12 text-right">{brushSize}px</span>
        </div>

        <div className="flex-1" />

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={undo}
            disabled={historyStep <= 0}
            className="btn-secondary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            title="Undo"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            onClick={redo}
            disabled={historyStep >= history.length - 1}
            className="btn-secondary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            title="Redo"
          >
            <Redo className="w-4 h-4" />
          </button>
          <button
            onClick={clearCanvas}
            className="btn-secondary text-sm text-destructive hover:text-destructive"
            title="Clear canvas"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={downloadCanvas}
            className="btn-primary text-sm"
            title="Download as image"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative overflow-hidden">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={(e) => {
            draw(e);
            if (!isDrawing) {
              updateCursorPreview(e);
            }
          }}
          onMouseUp={stopDrawing}
          onMouseLeave={(e) => {
            stopDrawing();
            hideCursorPreview();
          }}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="absolute inset-0 cursor-crosshair touch-none"
          style={{ backgroundColor: '#ffffff' }}
        />
        {/* Cursor Preview */}
        {cursorPos && !isDrawing && (
          <div
            ref={cursorPreviewRef}
            className="absolute pointer-events-none border-2 rounded-full"
            style={{
              left: cursorPos.x,
              top: cursorPos.y,
              width: brushSize,
              height: brushSize,
              marginLeft: -brushSize / 2,
              marginTop: -brushSize / 2,
              borderColor: tool === 'pen' ? color : '#ffffff',
              backgroundColor: tool === 'pen' ? `${color}40` : 'transparent',
              boxShadow: tool === 'pen' ? `0 0 0 1px ${color}20` : '0 0 0 1px rgba(255,255,255,0.3)',
            }}
          />
        )}
      </div>
    </div>
  );
}
