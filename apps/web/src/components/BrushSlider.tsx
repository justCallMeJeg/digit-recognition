import { useRef } from 'react';
import { cn } from '@/lib/utils';

interface BrushSliderProps {
  value: number;
  onChange: (v: number) => void;
  options: number[];
}

export function BrushSlider({ value, onChange, options }: BrushSliderProps) {
  const idx = options.indexOf(value);
  const pct = (idx / (options.length - 1)) * 100;
  const trackRef = useRef<HTMLDivElement>(null);

  const pickFromX = (clientX: number) => {
    const r = trackRef.current!.getBoundingClientRect();
    const t = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
    const i = Math.round(t * (options.length - 1));
    onChange(options[i]);
  };

  return (
    <div className="flex flex-col gap-2 select-none">
      <div className="flex items-baseline justify-between">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Brush size
        </span>
        <span className="font-mono text-xs text-foreground tabular-nums">{value}px</span>
      </div>

      <div
        ref={trackRef}
        onPointerDown={(e) => { (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId); pickFromX(e.clientX); }}
        onPointerMove={(e) => { if (e.buttons === 0) return; pickFromX(e.clientX); }}
        className="relative h-6 flex items-center cursor-pointer touch-none"
      >
        {/* Track */}
        <div className="absolute inset-x-0 h-1.5 rounded-full bg-muted" />
        {/* Filled portion */}
        <div
          className="absolute h-1.5 rounded-full bg-primary transition-all duration-150"
          style={{ width: `calc(${pct}% + 2px)` }}
        />
        {/* Stop dots */}
        {options.map((o, i) => {
          const sp = (i / (options.length - 1)) * 100;
          const active = i <= idx;
          return (
            <div
              key={o}
              className={cn(
                'absolute w-1 h-1 rounded-full -translate-x-1/2 transition-colors',
                active ? 'bg-white' : 'bg-border',
              )}
              style={{ left: `${sp}%` }}
            />
          );
        })}
        {/* Thumb */}
        <div
          className="absolute -translate-x-1/2 w-4 h-4 bg-white border-2 border-primary rounded-full shadow-sm transition-all duration-150"
          style={{ left: `${pct}%` }}
        />
      </div>

      <div className="flex justify-between">
        {options.map((o) => (
          <button
            key={o}
            onClick={() => onChange(o)}
            className={cn(
              'font-mono text-[11px] tabular-nums transition-colors hover:text-foreground',
              o === value ? 'text-foreground font-semibold' : 'text-muted-foreground',
            )}
          >
            {o}px
          </button>
        ))}
      </div>
    </div>
  );
}
