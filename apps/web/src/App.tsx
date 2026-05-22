import { useState, useCallback, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DrawingCanvas, readModelTensor } from '@/components/DrawingCanvas';
import { ResultsPanel, type PredictionResult } from '@/components/ResultsPanel';
import { cn } from '@/lib/utils';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';
const BRUSH_SIZE = 2;

export default function App() {
  const [brush] = useState(BRUSH_SIZE);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasInk, setHasInk] = useState(false);
  const [clearKey, setClearKey] = useState(0);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  const onCanvasChange = useCallback(({ hasInk }: { hasInk: boolean }) => setHasInk(hasInk), []);

  const handleClear = () => {
    setClearKey((k) => k + 1);
    setResult(null);
    setBusy(false);
    setHasInk(false);
  };

  const handlePredict = async () => {
    const cvs = canvasContainerRef.current?.querySelector('canvas');
    if (!cvs || !hasInk) return;
    setBusy(true);
    setResult(null);
    setRevealed(true);
    try {
      const tensor = readModelTensor(cvs);
      const res = await fetch(`${API_URL}/predict/raw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: Array.from(tensor.data) }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const json = await res.json();
      setResult({
        predictedClass: json.predictedClass,
        probabilities: json.probabilities,
        confidence: json.confidence,
        tensor,
      });
    } catch (err) {
      console.error('Prediction failed:', err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      {/* Header */}
      <header className="border-b border-border bg-white/70 backdrop-blur-sm shrink-0">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-md bg-primary text-primary-foreground grid place-items-center font-mono text-xs font-semibold">
              28
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold">Digit Recognizer</span>
              <span className="text-[11px] text-muted-foreground">MNIST · Dense inference</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              model online
            </Badge>
            <Badge variant="outline" className="font-mono">v1.0.0</Badge>
          </div>
        </div>
      </header>

      <main className="flex-1 min-h-0 w-full max-w-6xl mx-auto px-6 py-6 flex flex-col">
        <div className="shrink-0 mb-4 flex items-end justify-between gap-6">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Draw a digit</h1>
            <p className="text-xs text-muted-foreground mt-1 max-w-xl">
              Sketch any digit from 0–9. Press{' '}
              <kbd className="font-mono text-[10px] bg-muted border border-border rounded px-1.5 py-0.5">
                Predict
              </kbd>{' '}
              to run the model — your stroke is downsampled to 28×28 grayscale and classified.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-3 text-[11px] text-muted-foreground shrink-0">
            <span>POST <span className="font-mono text-foreground">/predict/raw</span></span>
          </div>
        </div>

        <div
          className={cn(
            'flex-1 min-h-0 grid gap-6 transition-[grid-template-columns] duration-500 ease-out',
            revealed
              ? 'grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]'
              : 'grid-cols-1 lg:grid-cols-[minmax(0,1fr)_0fr]',
          )}
        >
          {/* Left: canvas */}
          <Card className="p-5 flex flex-col gap-4 min-h-0 overflow-hidden border-border">
            <CardContent className="p-0 flex flex-col gap-4 flex-1 min-h-0">
              <div className="flex items-start justify-between shrink-0">
                <div>
                  <h2 className="text-sm font-semibold">Canvas</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Drawing area · 28×28 model input</p>
                </div>
                <Badge variant="outline" className="font-mono text-xs">
                  {hasInk ? 'ink detected' : 'empty'}
                </Badge>
              </div>

              <div ref={canvasContainerRef} className="canvas-area flex-1 flex items-center justify-center">
                <div className="canvas-fit">
                  <DrawingCanvas
                    brush={brush}
                    isDrawing={isDrawing}
                    setIsDrawing={setIsDrawing}
                    onChange={onCanvasChange}
                    clearKey={clearKey}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-border shrink-0">
                <Button
                  variant="outline"
                  onClick={handleClear}
                  disabled={!hasInk && !result && !busy}
                  className="flex-1"
                >
                  <EraserIcon />
                  Clear
                </Button>
                <Button
                  onClick={handlePredict}
                  disabled={!hasInk || busy}
                  className="flex-1"
                >
                  {busy ? <><SpinnerIcon />Predicting…</> : <><SparkleIcon />Predict</>}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Right: results */}
          <div
            className={cn(
              'overflow-hidden transition-all duration-500 min-h-0',
              revealed ? 'opacity-100 max-w-full' : 'opacity-0 max-w-0 pointer-events-none',
            )}
          >
            {revealed && (
              <Card className="p-5 animate-slide-in-right h-full overflow-y-auto border-border">
                <CardContent className="p-0">
                  <ResultsPanel result={result} busy={busy} />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function SparkleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
    </svg>
  );
}
function EraserIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18" /><path d="M5 15L15 5l4 4-10 10H5v-4z" />
    </svg>
  );
}
function SpinnerIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="animate-spin">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
