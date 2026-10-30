import { motion, useReducedMotion } from "motion/react";
import { clamp, type Profile } from "@/lib/tdee";
import { AnimatedNumber } from "./AnimatedNumber";
import { NumField, StageHeader } from "./Stage";

export function stepsLabel(s: number) {
  if (s < 3000) return "Mostly still";
  if (s < 7000) return "Lightly active";
  if (s < 12000) return "Active";
  if (s < 20000) return "Very active";
  return "Relentless";
}

export function MovementTrack({ steps }: { steps: number }) {
  const reduce = useReducedMotion();
  const ratio = steps / 40000;
  const dur = steps === 0 ? 0 : 6 - ratio * 5.2; // faster as steps rise
  const prints = 14;
  return (
    <div className="relative h-40 overflow-hidden border-y border-border md:h-48" aria-hidden>
      {/* lanes */}
      <div className="absolute inset-x-0 top-1/2 h-px bg-border" />
      <div className="absolute inset-x-0 top-[30%] h-px bg-border opacity-50" />
      <div className="absolute inset-x-0 top-[70%] h-px bg-border opacity-50" />
      {/* footprints flow */}
      <motion.div
        className="absolute inset-y-0 left-0 flex w-[200%] items-center"
        animate={reduce || dur === 0 ? { x: 0 } : { x: ["0%", "-50%"] }}
        transition={dur === 0 ? { duration: 0 } : { duration: dur, repeat: Infinity, ease: "linear" }}
      >
        {Array.from({ length: prints * 2 }).map((_, i) => {
          const lit = (i % prints) / prints < Math.max(0.08, ratio * 1.4);
          return (
            <div key={i} className="flex flex-1 justify-center" style={{ transform: `translateY(${i % 2 ? 18 : -18}px)` }}>
              <div className={`h-6 w-3 rounded-full transition-colors duration-500 ${lit ? "bg-lime glow-lime" : "bg-faint"}`}
                style={{ opacity: steps === 0 ? 0.2 : 1 }} />
            </div>
          );
        })}
      </motion.div>
      {/* intensity bar */}
      <motion.div className="absolute bottom-0 left-0 h-[2px] bg-lime" animate={{ width: `${ratio * 100}%` }}
        transition={{ type: "spring", stiffness: 90, damping: 20 }} />
    </div>
  );
}

export function StepsControl({ steps, onChange, compact }: { steps: number; onChange: (v: number) => void; compact?: boolean }) {
  const btn = "h-11 min-w-11 border border-input px-3 font-mono text-xs text-muted-foreground transition-colors hover:border-lime hover:text-lime active:scale-95";
  return (
    <div>
      <input type="range" min={0} max={40000} step={250} value={steps} aria-label="Average daily steps"
        onChange={(e) => onChange(+e.target.value)} className="track-input" />
      <div className="mt-1 flex justify-between font-mono text-[10px] text-faint tabular">
        <span>0</span><span>10k</span><span>20k</span><span>30k</span><span>40k</span>
      </div>
      {!compact && (
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <button type="button" className={btn} onClick={() => onChange(clamp(steps - 1000, 0, 40000))}>−1k</button>
          <button type="button" className={btn} onClick={() => onChange(clamp(steps - 100, 0, 40000))}>−100</button>
          <button type="button" className={btn} onClick={() => onChange(clamp(steps + 100, 0, 40000))}>+100</button>
          <button type="button" className={btn} onClick={() => onChange(clamp(steps + 1000, 0, 40000))}>+1k</button>
          <span className="ml-auto"><NumField label="Daily steps" value={steps} min={0} max={40000} onChange={(v) => onChange(clamp(Math.round(v), 0, 40000))} suffix="steps" /></span>
        </div>
      )}
    </div>
  );
}

export function MovementStage({ p, set }: { p: Profile; set: (patch: Partial<Profile>) => void }) {
  const km = (p.steps * 0.762) / 1000;
  return (
    <div>
      <StageHeader index="02" eyebrow="Your movement" title="Enter your daily step count"
        sub="Your average daily steps across a normal week." />
      <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
        <div>
          <div className="font-display text-7xl leading-none tabular md:text-9xl">
            <AnimatedNumber value={p.steps} duration={0.5} />
          </div>
          <div className="eyebrow mt-3">steps / day</div>
        </div>
        <div className="text-right">
          <motion.div key={stepsLabel(p.steps)} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="font-mono text-xs uppercase tracking-[0.2em] text-lime">
            {stepsLabel(p.steps)}
          </motion.div>
          <div className="mt-1 font-mono text-xs text-muted-foreground tabular">≈ <AnimatedNumber value={km} decimals={1} /> km</div>
        </div>
      </div>
      <MovementTrack steps={p.steps} />
      <div className="mt-8"><StepsControl steps={p.steps} onChange={(steps) => set({ steps })} /></div>
    </div>
  );
}
