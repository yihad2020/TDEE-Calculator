import { motion } from "motion/react";
import type { Profile } from "@/lib/tdee";
import { StageHeader } from "./Stage";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function TrainingDays({ days, onToggle, size = "lg" }: { days: boolean[]; onToggle: (i: number) => void; size?: "lg" | "sm" }) {
  return (
    <div role="group" aria-label="Training days" className="grid grid-cols-7 gap-1.5 md:gap-3">
      {DAYS.map((d, i) => {
        const on = days[i];
        return (
          <motion.button
            key={d}
            type="button"
            aria-pressed={on}
            aria-label={`${d} strength session`}
            onClick={() => onToggle(i)}
            whileTap={{ scale: 0.94 }}
            className={`group relative flex flex-col items-center justify-between overflow-hidden border transition-colors duration-300 ${
              size === "lg" ? "h-36 py-4 md:h-52" : "h-16 py-2"
            } ${on ? "border-lime bg-lime-dim" : "border-border bg-surface hover:border-input"}`}
          >
            <span className={`font-mono text-[10px] uppercase tracking-[0.2em] ${on ? "text-lime" : "text-muted-foreground"}`}>{d}</span>
            {size === "lg" && (
              <div className="flex flex-col-reverse gap-1">
                {Array.from({ length: 5 }).map((_, k) => (
                  <motion.span key={k} className="block h-1 w-5 md:w-8"
                    animate={{ opacity: on ? 1 : 0.15, scaleX: on ? 1 : 0.6 }}
                    transition={{ delay: on ? k * 0.05 : 0, duration: 0.3 }}
                    style={{ background: "var(--lime)" }} />
                ))}
              </div>
            )}
            <span className={`h-1.5 w-1.5 rounded-full ${on ? "bg-lime glow-lime" : "bg-faint"}`} />
          </motion.button>
        );
      })}
    </div>
  );
}

export function sessionsToDays(n: number, prev?: boolean[]) {
  if (prev && prev.filter(Boolean).length === n) return prev;
  const order = [0, 2, 4, 6, 1, 3, 5];
  const d = Array(7).fill(false) as boolean[];
  order.slice(0, n).forEach((i) => (d[i] = true));
  return d;
}

export function TrainingStage({ p, set, days, setDays }: {
  p: Profile; set: (patch: Partial<Profile>) => void; days: boolean[]; setDays: (d: boolean[]) => void;
}) {
  const toggle = (i: number) => {
    const next = days.map((v, k) => (k === i ? !v : v));
    setDays(next);
    set({ sessions: next.filter(Boolean).length });
  };
  return (
    <div>
      <StageHeader index="03" eyebrow="Your training" title="Select your strength training days"
        sub="Tap the days you lift in a typical week." />
      <div className="mb-8 flex items-end gap-4">
        <motion.span key={p.sessions} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="font-display text-8xl leading-none tabular md:text-9xl">{p.sessions}</motion.span>
        <span className="eyebrow pb-3">sessions / week</span>
      </div>
      <TrainingDays days={days} onToggle={toggle} />
      <div className="mt-6 flex justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-faint">
        <span>≈ 200 kcal / session</span>
        <button type="button" className="hover:text-foreground" onClick={() => { setDays(Array(7).fill(false)); set({ sessions: 0 }); }}>Clear week</button>
      </div>
    </div>
  );
}
