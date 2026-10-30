<div align="center">

# TDEE Calculator

**A step- and training-based Total Daily Energy Expenditure calculator, designed as an interactive instrument instead of a form.**

React 19 · TypeScript · TanStack Start · Tailwind CSS v4 · Motion · Vitest

</div>

---

## Overview

Most TDEE calculators ask you to pick a vague activity level, like "lightly active" or "moderately active", and multiply your BMR by a guess. This one doesn't.

It models energy from two things you can actually measure: **average daily steps** and **strength sessions per week**. You get a transparent, four-part breakdown of where every calorie goes.

The interface follows the same idea. Height is set on a scaled, draggable ruler and weight on a precision digital scale. Steps drive a live walking track, and training days light up like a sports-watch scheduler. The result is revealed as an animated, interactive breakdown with a real-time simulator.

## Features

- **Five-stage guided flow:** intro → body → movement → training → results, with animated stage transitions.
- **Physical-instrument inputs**
  - Height ruler with real scale ticks, drag, wheel and keyboard control (cm / ft-in)
  - Digital scale with 0.1 precision readout, analog needle and fine-tune dial (kg / lb)
  - Every measurement also supports direct numeric entry
- **Movement visualisation:** footprint track whose speed and intensity follow your step count, with interpolated live counters.
- **Training scheduler:** seven toggleable days; the session count follows the days you select.
- **Results breakdown:** resting metabolism, baseline activity, walking and training, shown as proportions that always sum exactly to the total.
- **Energy simulator:** adjust steps and training days and watch the TDEE update instantly, alongside maintenance, fat-loss and muscle-gain targets with adjustable percentages.
- **Persistence:** progress and inputs are saved to `localStorage`.
- **Accessibility:** ARIA sliders, radio groups and pressed states, full keyboard support (arrow keys, Shift for coarse steps), visible focus, and `prefers-reduced-motion` support.
- **Mobile-first:** touch-friendly pointer handling (`touch-action: none` on instruments, pointer capture on drag).

## The model

All maths lives in [`src/lib/tdee.ts`](src/lib/tdee.ts) as pure functions. Values are kept unrounded internally and only formatted for display.

| Component          | Formula                                              |
| ------------------ | ---------------------------------------------------- |
| BMR (male)         | `10 × kg + 6.25 × cm − 5 × age + 5`                  |
| BMR (female)       | `10 × kg + 6.25 × cm − 5 × age − 161`                |
| Baseline           | `BMR × 1.2`                                          |
| Walking            | `steps × kg × 0.0005`                                |
| Training           | `(200 × sessionsPerWeek) / 7`                        |
| **TDEE**           | **`Baseline + Walking + Training`**                  |

No extra activity multiplier is applied: activity is accounted for explicitly by the walking and training terms. See [`docs/CALCULATION.md`](docs/CALCULATION.md) for the reasoning and a worked example.

> Results are estimates from a predictive equation (Mifflin–St Jeor), not a direct measurement.

## Tech stack

| Area        | Choice                                   | Why                                                        |
| ----------- | ---------------------------------------- | ---------------------------------------------------------- |
| Framework   | React 19 + TanStack Start / Router       | Type-safe file routing, SSR-ready                          |
| Language    | TypeScript (strict)                      | Safe refactors across stage components                     |
| Styling     | Tailwind CSS v4 with CSS-first tokens    | A single design system in `src/styles.css`                 |
| Animation   | Motion (`motion/react`)                  | Springs, layout and presence transitions, reduced motion   |
| Rendering   | Canvas 2D                                | Pointer-reactive intro field at 60 fps with no dependency  |
| Testing     | Vitest                                   | Fast unit tests for the calculation model                  |
| Tooling     | Vite 7, Bun, ESLint, Prettier            |                                                            |

## Getting started

```bash
bun install
bun run dev        # http://localhost:8080
bunx vitest run    # unit tests
bun run build      # production build
```

npm or pnpm work too.

## Project structure

```text
src/
├── lib/
│   ├── tdee.ts                 # Pure calculation model and unit conversions
│   └── tdee.test.ts            # Model tests
├── components/motion-ui/
│   ├── Tape.tsx                # Reusable draggable measuring tape (a11y slider)
│   ├── AnimatedNumber.tsx      # Spring-interpolated number display
│   ├── EnergyField.tsx         # Canvas intro visualisation
│   ├── Stage.tsx               # Shared stage header, numeric field, segmented control
│   ├── BodyStage.tsx           # Sex, age, height ruler, weight scale
│   ├── MovementStage.tsx       # Step counter and walking track
│   ├── TrainingStage.tsx       # Weekly training scheduler
│   └── EnergyStage.tsx         # Reveal, breakdown, simulator, goal scenarios
├── routes/index.tsx            # Stage orchestration and persistence
└── styles.css                  # Design tokens and utilities
```

More detail in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Engineering highlights

- **Separation of concerns:** the model is framework-free and fully unit-tested. UI components receive a `Profile` and a `set(patch)` updater, nothing more.
- **Single source of truth in metric units:** imperial values are derived at render time, so switching units never causes rounding drift.
- **Virtualised ruler:** `Tape` renders only the ticks inside the visible window, so a 0.1 kg-resolution dial stays cheap.
- **Animation without re-renders:** `AnimatedNumber` writes to the DOM from a motion value subscription instead of React state.
- **Design tokens only:** components use semantic tokens (`bg-lime`, `text-muted-foreground`, `instrument`), never raw colours.

## Roadmap

- [ ] Shareable result card (OG image)
- [ ] Wearable step import (Apple Health / Google Fit export)
- [ ] Optional body-fat input with the Katch–McArdle BMR
- [ ] i18n and locale-aware number formatting

## License

[MIT](LICENSE) © Yihad Salek Villalba
