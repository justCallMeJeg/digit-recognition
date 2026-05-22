import { useRef, useEffect, useCallback } from 'react';

const DISPLAY_SIZE = 392; // 28 * 14 — crisp grid alignment
const MODEL_SIZE = 28;

interface DrawingCanvasProps {
  brush: number;
  isDrawing: boolean;
  setIsDrawing: (v: boolean) => void;
  onChange?: (state: { hasInk: boolean }) => void;
  clearKey: number;
}

export function DrawingCanvas({ brush, isDrawing, setIsDrawing, onChange, clearKey }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastRef = useRef<{ x: number; y: number } | null>(null);
  const hasInkRef = useRef(false);

  const resetCanvas = useCallback(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext('2d')!;
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, cvs.width, cvs.height);
    hasInkRef.current = false;
    onChange?.({ hasInk: false });
  }, [onChange]);

  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const dpr = window.devicePixelRatio || 1;
    cvs.width = DISPLAY_SIZE * dpr;
    cvs.height = DISPLAY_SIZE * dpr;
    const ctx = cvs.getContext('2d')!;
    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    resetCanvas();
  }, [resetCanvas]);

  useEffect(() => { resetCanvas(); }, [clearKey, resetCanvas]);

  const localPoint = (e: React.PointerEvent) => {
    const r = canvasRef.current!.getBoundingClientRect();
    const sx = DISPLAY_SIZE / r.width;
    const sy = DISPLAY_SIZE / r.height;
    return { x: (e.clientX - r.left) * sx, y: (e.clientY - r.top) * sy };
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    (e.currentTarget as HTMLCanvasElement).setPointerCapture(e.pointerId);
    setIsDrawing(true);
    const p = localPoint(e);
    lastRef.current = p;
    const ctx = canvasRef.current!.getContext('2d')!;
    const r = (brush / MODEL_SIZE) * DISPLAY_SIZE * 0.5;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.fill();
    hasInkRef.current = true;
    onChange?.({ hasInk: true });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawing) return;
    const ctx = canvasRef.current!.getContext('2d')!;
    const p = localPoint(e);
    const last = lastRef.current ?? p;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = (brush / MODEL_SIZE) * DISPLAY_SIZE;
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    lastRef.current = p;
  };

  const handlePointerUp = () => {
    setIsDrawing(false);
    lastRef.current = null;
  };

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="block w-full h-full rounded-xl bg-black touch-none cursor-crosshair"
      />
      <div className="absolute inset-0 rounded-xl canvas-grid pointer-events-none" />
    </div>
  );
}
