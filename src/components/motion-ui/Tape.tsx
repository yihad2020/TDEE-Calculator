import { useRef } from "react";
import { clamp } from "@/lib/tdee";

/** A physical measuring tape: drag to scroll, arrow keys to nudge. Value is in the tape's own unit. */
export function Tape({
  value,
  min,
  max,
  step = 1,
  majorEvery = 10,
  midEvery = 5,
  pxPerUnit = 12,
  label,
  formatMajor = (v) => String(v),
  onChange,
  height = 96,
}: {
  value: number;
  min: number;
  max: number;
  step?: number;
  majorEvery?: number;
  midEvery?: number;
  pxPerUnit?: number;
  label: string;
  formatMajor?: (v: number) => string;
  onChange: (v: number) => void;
  height?: number;
}) {
  const drag = useRef<{ x: number; v: number } | null>(null);
  const ticks: number[] = [];
  const span = 520 / pxPerUnit;
  const i0 = Math.ceil(Math.max(min, value - span) / step - 1e-9);
  const i1 = Math.floor(Math.min(max, value + span) / step + 1e-9);
  for (let i = i0; i <= i1; i++) ticks.push(+(i * step).toFixed(4));

  const snap = (v: number) => clamp(Math.round(v / step) * step, min, max);

  return (
    <div
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={Math.round(value * 10) / 10}
      className="relative w-full cursor-grab touch-none select-none overflow-hidden active:cursor-grabbing"
      style={{
        height,
        maskImage: "linear-gradient(90deg, transparent, black 18%, black 82%, transparent)",
        WebkitMaskImage: "linear-gradient(90deg, transparent, black 18%, black 82%, transparent)",
      }}
      onPointerDown={(e) => {
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        drag.current = { x: e.clientX, v: value };
      }}
      onPointerMove={(e) => {
        if (!drag.current) return;
        const dx = e.clientX - drag.current.x;
        onChange(snap(drag.current.v - dx / pxPerUnit));
      }}
      onPointerUp={() => (drag.current = null)}
      onPointerCancel={() => (drag.current = null)}
      onWheel={(e) => onChange(snap(value + Math.sign(e.deltaY || e.deltaX) * step))}
      onKeyDown={(e) => {
        const big = e.shiftKey ? majorEvery : 1;
        if (e.key === "ArrowRight" || e.key === "ArrowUp") { e.preventDefault(); onChange(snap(value + step * big)); }
        if (e.key === "ArrowLeft" || e.key === "ArrowDown") { e.preventDefault(); onChange(snap(value - step * big)); }
      }}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-border" />
      {ticks.map((t) => {
        const x = (t - value) * pxPerUnit;
        const units = Math.round(t / step);
        const major = Math.abs(t % majorEvery) < 1e-6 || Math.abs((t % majorEvery) - majorEvery) < 1e-6;
        const mid = !major && Math.abs(t % midEvery) < 1e-6;
        void units;
        return (
          <div key={t} className="absolute top-0" style={{ left: `calc(50% + ${x}px)` }}>
            <div
              className={major ? "w-px bg-foreground" : mid ? "w-px bg-muted-foreground" : "w-px bg-faint"}
              style={{ height: major ? 34 : mid ? 22 : 12 }}
            />
            {major && (
              <div className="absolute top-10 -translate-x-1/2 font-mono text-[10px] text-muted-foreground tabular">
                {formatMajor(t)}
              </div>
            )}
          </div>
        );
      })}
      <div className="pointer-events-none absolute left-1/2 top-0 h-14 w-[2px] -translate-x-1/2 bg-lime glow-lime" />
      <div className="pointer-events-none absolute left-1/2 top-14 -translate-x-1/2 border-x-[5px] border-t-[6px] border-x-transparent border-t-lime" />
    </div>
  );
}
