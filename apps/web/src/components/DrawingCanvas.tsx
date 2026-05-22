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
    ctx.fillStyle = '#ffffff';
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
    ctx.fillStyle = '#0a0a0a';
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
    ctx.strokeStyle = '#0a0a0a';
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
        className="block w-full h-full rounded-xl bg-white touch-none cursor-crosshair"
      />
      <div className="absolute inset-0 rounded-xl canvas-grid pointer-events-none" />
    </div>
  );
}

export function readModelTensor(canvas: HTMLCanvasElement): { data: Float32Array; preview: ImageData } {
  const tmp = document.createElement('canvas');
  tmp.width = MODEL_SIZE;
  tmp.height = MODEL_SIZE;
  const ctx = tmp.getContext('2d')!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, MODEL_SIZE, MODEL_SIZE);
  ctx.drawImage(canvas, 0, 0, MODEL_SIZE, MODEL_SIZE);
  const img = ctx.getImageData(0, 0, MODEL_SIZE, MODEL_SIZE);
  const data = new Float32Array(MODEL_SIZE * MODEL_SIZE);
  for (let i = 0; i < data.length; i++) {
    data[i] = 1 - img.data[i * 4] / 255;
  }
  return { data, preview: img };
}
