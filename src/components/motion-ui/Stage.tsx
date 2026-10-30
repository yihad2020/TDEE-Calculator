import type { ReactNode } from "react";

export function StageHeader({ index, eyebrow, title, sub }: { index: string; eyebrow: string; title: ReactNode; sub?: string }) {
  return (
    <header className="mb-10 md:mb-14">
      <div className="eyebrow flex items-center gap-3">
        <span className="text-lime">{index}</span>
        <span>{eyebrow}</span>
      </div>
      <h2 className="mt-4 font-hero text-3xl font-semibold leading-[1.05] tracking-[-0.005em] md:text-5xl">{title}</h2>
      {sub && <p className="mt-4 max-w-md text-sm text-muted-foreground">{sub}</p>}
    </header>
  );
}

export function NumField({
  value, onChange, min, max, step = 1, label, suffix, width = "w-20",
}: {
  value: number; onChange: (v: number) => void; min: number; max: number; step?: number; label: string; suffix?: string; width?: string;
}) {
  return (
    <label className="inline-flex items-baseline gap-1 border-b border-input pb-1 focus-within:border-lime">
      <span className="sr-only">{label}</span>
      <input
        type="number"
        inputMode="decimal"
        min={min}
        max={max}
        step={step}
        value={Number.isFinite(value) ? Math.round(value * 10) / 10 : ""}
        onChange={(e) => {
          const v = parseFloat(e.target.value);
          if (!Number.isNaN(v)) onChange(v);
        }}
        onBlur={(e) => {
          const v = parseFloat(e.target.value);
          onChange(Number.isNaN(v) ? min : Math.min(max, Math.max(min, v)));
        }}
        className={`${width} bg-transparent font-mono text-sm tabular text-foreground outline-none`}
      />
      {suffix && <span className="font-mono text-xs text-muted-foreground">{suffix}</span>}
    </label>
  );
}

export function Segmented<T extends string>({
  options, value, onChange, label,
}: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex border border-input p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={`px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest transition-colors ${
            value === o.value ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
