# Architecture

## Data flow

```text
routes/index.tsx
  ├─ state: Profile (metric), training days[7], stage
  ├─ effect: hydrate from / persist to localStorage
  └─ renders one stage at a time inside <AnimatePresence mode="wait">
        │
        ├─ BodyStage      ─┐
        ├─ MovementStage   ├─ receive { p, set(patch) }
        ├─ TrainingStage   │
        └─ EnergyStage    ─┘  calls breakdown(p) from lib/tdee.ts
```

- `Profile` is stored in **metric units only**. Imperial values are derived for display and converted back on input.
- `breakdown()` is pure and synchronous, so the results and simulator recompute on every change with no memoisation needed.
- Training days are kept as a `boolean[7]` for the scheduler UI, and `sessions` is derived from them.

## Reusable primitives

| Component        | Responsibility                                                                 |
| ---------------- | ------------------------------------------------------------------------------ |
| `Tape`           | Generic measuring tape: pointer drag with capture, wheel, arrow keys, snapping to `step`, virtualised tick rendering, `role="slider"` |
| `AnimatedNumber` | Animates a motion value and writes `textContent` directly to avoid React re-renders |
| `NumField`       | Numeric input that accepts free typing and clamps on blur                      |
| `Segmented`      | Accessible radio-group toggle used for sex and unit selection                  |
| `EnergyField`    | Canvas 2D line field with eased pointer attraction; paused under reduced motion |

## Styling

All colours, shadows and typography are tokens in `src/styles.css` (`@theme inline`) and custom `@utility` classes (`instrument`, `eyebrow`, `glow-lime`, `grain`). Components never use raw colour values.

## Accessibility

- Keyboard: every instrument is focusable. Arrow keys nudge the value and Shift+Arrow takes larger steps.
- Semantics: `aria-valuenow` on sliders, `aria-pressed` on training days, `aria-checked` on segmented options, `aria-live` on animated numbers.
- Motion: `useReducedMotion()` disables transitions, count-ups and the canvas animation.

## Testing

`src/lib/tdee.test.ts` covers the BMR constants for each sex, each activity term, and the invariant that the four breakdown parts sum to the total.
