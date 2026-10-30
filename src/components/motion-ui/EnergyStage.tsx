import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { breakdown, clamp, type Profile } from "@/lib/tdee";
import { AnimatedNumber } from "./AnimatedNumber";
import { StepsControl } from "./MovementStage";
import { sessionsToDays, TrainingDays } from "./TrainingStage";
import { NumField } from "./Stage";

const SEGMENTS = [
  { key: "resting", label: "Resting metabolism", note: "Organs, cells, staying alive", color: "var(--seg-1)" },
  { key: "baselineActivity", label: "Baseline activity", note: "Daily living, digestion, fidgeting", color: "var(--seg-2)" },
  { key: "walking", label: "Walking", note: "Your daily steps", color: "var(--seg-3)" },
  { key: "training", label: "Training", note: "Strength sessions, averaged daily", color: "var(--seg-4)" },
] as const;

export function EnergyStage({ p, set, days, setDays, onRestart }: {
  p: Profile; set: (patch: Partial<Profile>) => void; days: boolean[]; setDays: (d: boolean[]) => void; onRestart: () => void;
}) {
  const b = breakdown(p);
  const reduce = useReducedMotion();
  const [active, setActive] = useState<string | null>(null);
  const [cut, setCut] = useState(20);
  const [bulk, setBulk] = useState(10);
  const toggleDay = (i: number) => {
    const next = days.map((v, k) => (k === i ? !v : v));
    setDays(next);
    set({ sessions: next.filter(Boolean).length });
  };
  const d = (s: number) => (reduce ? 0 : s);

  return (
    <div>
      {/* Reveal */}
      <section className="relative py-10 text-center md:py-16">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: d(0.2) }} className="eyebrow">
          <span className="text-lime">04</span>&nbsp;&nbsp;Your energy · total daily expenditure
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.92, filter: "blur(16px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ delay: d(0.4), duration: d(1.4), ease: [0.22, 1, 0.36, 1] }}
          className="relative mt-6"
        >
          <motion.div aria-hidden className="absolute inset-0 -z-10 mx-auto rounded-full blur-3xl"
            style={{ background: "var(--lime-dim)", width: "60%" }}
            animate={reduce ? {} : { opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 4, repeat: Infinity }} />
          <div className="font-display text-[26vw] leading-[0.85] tracking-tight tabular md:text-[14rem]">
            <AnimatedNumber value={b.tdee} duration={reduce ? 0 : 2.2} />
          </div>
          <div className="mt-2 font-mono text-sm uppercase tracking-[0.3em] text-lime">kcal / day</div>
        </motion.div>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: d(2.2) }}
          className="mx-auto mt-6 max-w-sm text-xs text-muted-foreground">
          An estimate modelled from your inputs (Mifflin–St Jeor), not a direct measurement. Real expenditure varies person to person.
        </motion.p>
      </section>

      {/* Breakdown */}
      <section className="mt-6">
        <div className="eyebrow mb-4">Where it goes</div>
        <div className="flex h-16 w-full overflow-hidden md:h-20" role="img" aria-label="Energy breakdown bar">
          {SEGMENTS.map((s, i) => {
            const v = b[s.key];
            return (
              <motion.button
                type="button"
                key={s.key}
                onMouseEnter={() => setActive(s.key)} onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(s.key)} onBlur={() => setActive(null)}
                onClick={() => setActive(active === s.key ? null : s.key)}
                aria-label={`${s.label}: ${Math.round(v)} kcal`}
                initial={{ width: 0 }}
                animate={{ width: `${(v / b.tdee) * 100}%`, opacity: active && active !== s.key ? 0.3 : 1 }}
                transition={{ delay: d(1 + i * 0.25), duration: d(0.9), ease: [0.22, 1, 0.36, 1] }}
                className="h-full border-r border-background last:border-r-0"
                style={{ background: s.color }}
              />
            );
          })}
        </div>
        <div className="mt-6 grid grid-cols-2 gap-px bg-border md:grid-cols-4">
          {SEGMENTS.map((s) => {
            const v = b[s.key];
            return (
              <div key={s.key} onMouseEnter={() => setActive(s.key)} onMouseLeave={() => setActive(null)}
                className={`bg-background p-4 transition-opacity md:p-5 ${active && active !== s.key ? "opacity-40" : ""}`}>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2" style={{ background: s.color }} />
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{s.label}</span>
                </div>
                <div className="mt-3 font-display text-4xl tabular"><AnimatedNumber value={v} /></div>
                <div className="mt-1 font-mono text-[10px] text-faint tabular">{((v / b.tdee) * 100).toFixed(1)}% · {s.note}</div>
              </div>
            );
          })}
        </div>
        <div className="mt-3 text-right font-mono text-[10px] text-faint tabular">
          {Math.round(b.resting)} + {Math.round(b.baselineActivity)} + {Math.round(b.walking)} + {Math.round(b.training)} = {b.tdee.toFixed(1)} kcal
        </div>
      </section>

      {/* Simulator */}
      <section className="mt-20">
        <div className="eyebrow mb-2">Energy simulator</div>
        <h3 className="font-hero text-3xl font-semibold leading-[1.05] tracking-[-0.005em] md:text-4xl">Adjust steps and training to see your TDEE change</h3>
        <div className="mt-8 grid gap-10 md:grid-cols-2">
          <div className="space-y-8">
            <div>
              <div className="mb-2 flex justify-between font-mono text-xs"><span className="text-muted-foreground">Daily steps</span><span className="tabular"><AnimatedNumber value={p.steps} duration={0.3} /></span></div>
              <StepsControl steps={p.steps} compact onChange={(steps) => set({ steps })} />
            </div>
            <div>
              <div className="mb-3 flex justify-between font-mono text-xs"><span className="text-muted-foreground">Training days</span><span className="tabular">{p.sessions} / week</span></div>
              <TrainingDays days={days} onToggle={toggleDay} size="sm" />
            </div>
          </div>
          <div className="grid gap-px bg-border">
            <Scenario label="Fat loss" sub={`−${cut}%`} value={b.tdee * (1 - cut / 100)}
              control={<PctControl label="Deficit percent" value={cut} onChange={setCut} max={35} />} />
            <Scenario label="Maintenance" sub="0%" value={b.tdee} highlight />
            <Scenario label="Muscle gain" sub={`+${bulk}%`} value={b.tdee * (1 + bulk / 100)}
              control={<PctControl label="Surplus percent" value={bulk} onChange={setBulk} max={25} />} />
          </div>
        </div>
      </section>

      <div className="mt-20 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-faint">Saved on this device</span>
        <button type="button" onClick={onRestart} className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-lime">
          ↺ Recalibrate from start
        </button>
      </div>
    </div>
  );
}

function Scenario({ label, sub, value, control, highlight }: { label: string; sub: string; value: number; control?: React.ReactNode; highlight?: boolean }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 bg-background p-5">
      <div>
        <div className={`font-mono text-[10px] uppercase tracking-[0.2em] ${highlight ? "text-lime" : "text-muted-foreground"}`}>{label} <span className="text-faint">{sub}</span></div>
        <div className="mt-1 font-display text-5xl tabular"><AnimatedNumber value={value} duration={0.4} /><span className="ml-2 font-mono text-xs text-muted-foreground">kcal</span></div>
      </div>
      {control}
    </div>
  );
}

function PctControl({ label, value, onChange, max }: { label: string; value: number; onChange: (v: number) => void; max: number }) {
  const btn = "h-9 w-9 border border-input font-mono text-muted-foreground hover:border-lime hover:text-lime";
  return (
    <div className="flex items-center gap-2">
      <button type="button" aria-label={`Decrease ${label}`} className={btn} onClick={() => onChange(clamp(value - 1, 1, max))}>−</button>
      <NumField label={label} value={value} min={1} max={max} onChange={(v) => onChange(clamp(Math.round(v), 1, max))} suffix="%" width="w-8" />
      <button type="button" aria-label={`Increase ${label}`} className={btn} onClick={() => onChange(clamp(value + 1, 1, max))}>+</button>
    </div>
  );
}

export { sessionsToDays };
