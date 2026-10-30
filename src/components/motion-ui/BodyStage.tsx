import { motion } from "motion/react";
import { useState } from "react";
import { clamp, cmToFtIn, kgToLb, lbToKg, type Profile } from "@/lib/tdee";
import { NumField, Segmented, StageHeader } from "./Stage";
import { Tape } from "./Tape";

type Props = { p: Profile; set: (patch: Partial<Profile>) => void };

export function BodyStage({ p, set }: Props) {
  return (
    <div>
      <StageHeader index="01" eyebrow="Your body" title="Enter your sex, age, height and weight" />
      <div className="grid gap-10 md:grid-cols-[1fr_1fr] md:gap-16">
        <div className="space-y-10">
          <div>
            <div className="eyebrow mb-3">Biological sex</div>
            <Segmented label="Biological sex" value={p.sex} onChange={(sex) => set({ sex })}
              options={[{ value: "male", label: "Male" }, { value: "female", label: "Female" }]} />
          </div>
          <AgeControl age={p.age} onChange={(age) => set({ age })} />
        </div>
        <div />
      </div>
      <div className="mt-12 space-y-12">
        <HeightInstrument cm={p.heightCm} onChange={(heightCm) => set({ heightCm })} />
        <WeightScale kg={p.weightKg} onChange={(weightKg) => set({ weightKg })} />
      </div>
    </div>
  );
}

function AgeControl({ age, onChange }: { age: number; onChange: (v: number) => void }) {
  const btn = "h-10 w-10 border border-input font-mono text-lg text-muted-foreground transition-colors hover:border-lime hover:text-lime active:scale-95";
  return (
    <div>
      <div className="eyebrow mb-3">Age</div>
      <div className="flex items-center gap-5">
        <button type="button" aria-label="Decrease age" className={btn} onClick={() => onChange(clamp(age - 1, 15, 90))}>−</button>
        <motion.span key={age} initial={{ y: -6, opacity: 0.4 }} animate={{ y: 0, opacity: 1 }}
          className="w-20 text-center font-display text-6xl tabular">{age}</motion.span>
        <button type="button" aria-label="Increase age" className={btn} onClick={() => onChange(clamp(age + 1, 15, 90))}>+</button>
        <NumField label="Age in years" value={age} min={15} max={90} onChange={(v) => onChange(clamp(Math.round(v), 15, 90))} suffix="yrs" width="w-10" />
      </div>
    </div>
  );
}

function HeightInstrument({ cm, onChange }: { cm: number; onChange: (v: number) => void }) {
  const [unit, setUnit] = useState<"cm" | "ft">("cm");
  const { ft, inch } = cmToFtIn(cm);
  const inches = cm / 2.54;
  return (
    <section className="instrument p-5 md:p-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="eyebrow mb-2">Height</div>
          <div className="font-display text-6xl tabular md:text-7xl">
            {unit === "cm" ? <>{Math.round(cm)}<span className="ml-2 font-mono text-base text-muted-foreground">cm</span></>
              : <>{ft}<span className="mx-1 font-mono text-base text-muted-foreground">ft</span>{inch}<span className="ml-1 font-mono text-base text-muted-foreground">in</span></>}
          </div>
        </div>
        <div className="flex items-center gap-4">
          {unit === "cm" ? (
            <NumField label="Height in centimetres" value={cm} min={120} max={230} onChange={(v) => onChange(clamp(v, 120, 230))} suffix="cm" width="w-14" />
          ) : (
            <span className="flex gap-3">
              <NumField label="Feet" value={ft} min={3} max={7} onChange={(f) => onChange(clamp((f * 12 + inch) * 2.54, 120, 230))} suffix="ft" width="w-8" />
              <NumField label="Inches" value={inch} min={0} max={11} onChange={(i) => onChange(clamp((ft * 12 + i) * 2.54, 120, 230))} suffix="in" width="w-8" />
            </span>
          )}
          <Segmented label="Height unit" value={unit} onChange={setUnit} options={[{ value: "cm", label: "cm" }, { value: "ft", label: "ft" }]} />
        </div>
      </div>
      {unit === "cm" ? (
        <Tape label="Height ruler, centimetres" value={cm} min={120} max={230} step={1} majorEvery={10} midEvery={5} pxPerUnit={11} onChange={onChange} />
      ) : (
        <Tape label="Height ruler, inches" value={inches} min={47} max={90} step={1} majorEvery={12} midEvery={6} pxPerUnit={22}
          formatMajor={(v) => `${v / 12}′`} onChange={(v) => onChange(v * 2.54)} />
      )}
      <p className="mt-2 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-faint">Drag the tape · arrow keys to nudge</p>
    </section>
  );
}

function WeightScale({ kg, onChange }: { kg: number; onChange: (v: number) => void }) {
  const [unit, setUnit] = useState<"kg" | "lb">("kg");
  const shown = unit === "kg" ? kg : kgToLb(kg);
  const min = unit === "kg" ? 30 : 66;
  const max = unit === "kg" ? 250 : 551;
  const toKg = (v: number) => clamp(unit === "kg" ? v : lbToKg(v), 30, 250);
  // needle sweep: 30–250kg mapped to -120°..120°
  const angle = ((kg - 30) / 220) * 240 - 120;
  return (
    <section className="instrument overflow-hidden p-5 md:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="eyebrow">Weight</div>
        <div className="flex items-center gap-4">
          <NumField label={`Weight in ${unit}`} value={shown} min={min} max={max} step={0.1} onChange={(v) => onChange(toKg(v))} suffix={unit} width="w-14" />
          <Segmented label="Weight unit" value={unit} onChange={setUnit} options={[{ value: "kg", label: "kg" }, { value: "lb", label: "lb" }]} />
        </div>
      </div>
      <div className="grid items-center gap-8 md:grid-cols-[220px_1fr]">
        <div className="relative mx-auto aspect-square w-48 md:w-full" aria-hidden>
          <svg viewBox="-100 -100 200 200" className="h-full w-full">
            {Array.from({ length: 49 }).map((_, i) => {
              const a = (-120 + i * 5) * (Math.PI / 180);
              const r1 = i % 4 === 0 ? 72 : 78;
              return <line key={i} x1={Math.sin(a) * r1} y1={-Math.cos(a) * r1} x2={Math.sin(a) * 84} y2={-Math.cos(a) * 84}
                stroke="currentColor" className={i % 4 === 0 ? "text-foreground" : "text-faint"} strokeWidth={i % 4 === 0 ? 1.4 : 0.8} />;
            })}
            <motion.g animate={{ rotate: angle }} transition={{ type: "spring", stiffness: 120, damping: 14 }}>
              <line x1="0" y1="10" x2="0" y2="-80" stroke="currentColor" className="text-lime" strokeWidth="1.6" />
            </motion.g>
            <circle r="5" className="fill-foreground" />
          </svg>
        </div>
        <div>
          <div className="relative border border-border bg-background px-5 py-6 shadow-inner">
            <div className="flex items-baseline justify-end gap-3">
              <span className="font-mono text-6xl tabular tracking-tight text-lime text-glow md:text-8xl">{shown.toFixed(1)}</span>
              <span className="font-mono text-sm uppercase text-muted-foreground">{unit}</span>
            </div>
            <div className="mt-2 flex justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-faint">
              <span>Precision 0.1</span><span>Stable ●</span>
            </div>
          </div>
          <div className="mt-6">
            <Tape label={`Weight dial, ${unit}`} value={shown} min={min} max={max} step={0.1} majorEvery={unit === "kg" ? 5 : 10} midEvery={1}
              pxPerUnit={unit === "kg" ? 28 : 14} height={72} formatMajor={(v) => String(Math.round(v))} onChange={(v) => onChange(toKg(v))} />
          </div>
        </div>
      </div>
    </section>
  );
}
