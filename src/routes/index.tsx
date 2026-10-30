import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { DEFAULT_PROFILE, type Profile } from "@/lib/tdee";
import { EnergyField } from "@/components/motion-ui/EnergyField";
import { BodyStage } from "@/components/motion-ui/BodyStage";
import { MovementStage } from "@/components/motion-ui/MovementStage";
import { TrainingStage, sessionsToDays } from "@/components/motion-ui/TrainingStage";
import { EnergyStage } from "@/components/motion-ui/EnergyStage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TDEE Calculator — Steps & Training Based" },
      { name: "description", content: "An immersive TDEE calculator. Measure your body, movement and training to decode your daily energy." },
      { property: "og:title", content: "TDEE Calculator — Steps & Training Based" },
      { property: "og:description", content: "Your body. Your energy. Decoded. An immersive daily energy calculator." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const KEY = "tdee-calculator-v1";
const STAGES = ["Intro", "Body", "Movement", "Training", "Energy"];

function Index() {
  const [stage, setStage] = useState(0);
  const [p, setP] = useState<Profile>(DEFAULT_PROFILE);
  const [days, setDays] = useState<boolean[]>(sessionsToDays(DEFAULT_PROFILE.sessions));
  const [loaded, setLoaded] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const s = JSON.parse(raw);
        if (s.p) setP({ ...DEFAULT_PROFILE, ...s.p });
        if (Array.isArray(s.days) && s.days.length === 7) setDays(s.days);
        if (typeof s.stage === "number") setStage(Math.min(4, Math.max(0, s.stage)));
      }
    } catch { /* ignore */ }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(KEY, JSON.stringify({ p, days, stage }));
  }, [p, days, stage, loaded]);

  useEffect(() => { window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }); }, [stage, reduce]);

  const set = (patch: Partial<Profile>) => setP((prev) => ({ ...prev, ...patch }));
  const go = (n: number) => setStage(Math.max(0, Math.min(4, n)));

  return (
    <main className="grain relative min-h-screen bg-background text-foreground">
      <AnimatePresence mode="wait">
        {stage === 0 ? (
          <Intro key="intro" onBegin={() => go(1)} />
        ) : (
          <motion.div key={`s${stage}`}
            initial={{ opacity: 0, y: reduce ? 0 : 40, filter: reduce ? "none" : "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: reduce ? 0 : -30, filter: reduce ? "none" : "blur(8px)" }}
            transition={{ duration: reduce ? 0.01 : 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto max-w-5xl px-5 pb-36 pt-24 md:px-10 md:pt-28"
          >
            {stage === 1 && <BodyStage p={p} set={set} />}
            {stage === 2 && <MovementStage p={p} set={set} />}
            {stage === 3 && <TrainingStage p={p} set={set} days={days} setDays={setDays} />}
            {stage === 4 && <EnergyStage p={p} set={set} days={days} setDays={setDays} onRestart={() => go(1)} />}
          </motion.div>
        )}
      </AnimatePresence>

      {stage > 0 && (
        <>
          <nav className="fixed inset-x-0 top-0 z-40 flex items-center justify-between bg-background/80 px-5 py-4 backdrop-blur md:px-10">
            <button type="button" onClick={() => go(0)} className="font-mono text-xs tracking-[0.35em] text-foreground">TDEE</button>
            <ol className="flex items-center gap-1.5" aria-label="Progress">
              {STAGES.slice(1).map((s, i) => (
                <li key={s}>
                  <button type="button" onClick={() => go(i + 1)} aria-label={`Go to ${s}`} aria-current={stage === i + 1 ? "step" : undefined}
                    className="flex h-6 items-center">
                    <span className={`block h-[2px] transition-all duration-500 ${stage === i + 1 ? "w-10 bg-lime" : stage > i + 1 ? "w-5 bg-foreground" : "w-5 bg-input"}`} />
                  </button>
                </li>
              ))}
            </ol>
          </nav>
          {stage < 4 && (
            <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/85 backdrop-blur">
              <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4 md:px-10">
                <button type="button" onClick={() => go(stage - 1)} className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground">← Back</button>
                <span className="hidden font-mono text-[10px] uppercase tracking-[0.2em] text-faint md:block">{stage} / 4 · {STAGES[stage]}</span>
                <motion.button type="button" whileTap={{ scale: 0.97 }} onClick={() => go(stage + 1)}
                  className="bg-lime px-6 py-3 font-mono text-xs uppercase tracking-[0.2em] text-primary-foreground transition-shadow hover:glow-lime">
                  {stage === 3 ? "Decode energy →" : "Continue →"}
                </motion.button>
              </div>
            </div>
          )}
        </>
      )}
    </main>
  );
}

function Intro({ onBegin }: { onBegin: () => void }) {
  const reduce = useReducedMotion();
  const line = (delay: number) => ({
    initial: { opacity: 0, y: reduce ? 0 : 30 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: reduce ? 0 : delay, duration: 1, ease: [0.22, 1, 0.36, 1] as const },
  });
  return (
    <motion.section exit={{ opacity: 0, scale: reduce ? 1 : 1.04 }} transition={{ duration: 0.7 }}
      className="relative flex h-[100svh] flex-col overflow-hidden">
      <motion.div className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }}>
        <EnergyField />
      </motion.div>
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,var(--background)_8%,transparent_55%)]" />
      <div className="relative z-10 mt-auto px-5 pb-12 md:px-10 md:pb-16">
        <h1 className="font-hero text-[12vw] font-semibold leading-[0.95] tracking-[-0.01em] md:text-[4.25rem]">
          <motion.span className="block" {...line(0.3)}>TDEE Calculator</motion.span>
          <motion.span className="block italic font-semibold text-muted-foreground" {...line(0.5)}>with Steps &amp;</motion.span>
          <motion.span className="block text-lime text-glow" {...line(0.7)}>Training frequency.</motion.span>
        </h1>
        <motion.div {...line(1.1)} className="mt-10 flex flex-wrap items-center gap-6">
          <motion.button type="button" onClick={onBegin} autoFocus whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            className="group flex items-center gap-4 bg-foreground px-8 py-4 font-mono text-xs uppercase tracking-[0.3em] text-background">
            Begin <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
          </motion.button>
          <span className="max-w-[16rem] text-xs text-muted-foreground">Four measurements. Two minutes. One number that explains your day.</span>
        </motion.div>
      </div>
    </motion.section>
  );
}
