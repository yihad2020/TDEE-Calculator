# Calculation model

## Why steps and sessions instead of an activity level?

Classic calculators multiply BMR by a factor between 1.2 and 1.9 chosen from a vague description. Two people who both pick "moderately active" can differ by hundreds of calories.

This model keeps the sedentary factor (`× 1.2`) for baseline living. It then adds activity **explicitly** from measurable inputs:

- **Walking:** `steps × weightKg × 0.0005` kcal. Heavier bodies spend more per step.
- **Training:** `200 kcal × sessions / 7`, a strength session averaged across the week.

Because activity is already counted, **no second multiplier is applied**.

## Formulas

```text
BMR (male)   = 10·kg + 6.25·cm − 5·age + 5
BMR (female) = 10·kg + 6.25·cm − 5·age − 161
Baseline     = BMR × 1.2
Walking      = steps × kg × 0.0005
Training     = 200 × sessions / 7
TDEE         = Baseline + Walking + Training
```

The results screen splits Baseline into **Resting metabolism** (BMR) and **Baseline activity** (`0.2 × BMR`). The four displayed parts therefore always sum to the total.

## Worked example

Male, 30 years, 175 cm, 72 kg, 8,000 steps/day, 3 sessions/week:

| Part              | kcal     |
| ----------------- | -------- |
| BMR               | 1,668.75 |
| Baseline activity | 333.75   |
| Walking           | 288.00   |
| Training          | 85.71    |
| **TDEE**          | **2,376.21** |

## Goal scenarios

- Fat loss: `TDEE × (1 − deficit%)`, adjustable from 1 to 35%
- Maintenance: `TDEE`
- Muscle gain: `TDEE × (1 + surplus%)`, adjustable from 1 to 25%

## Limitations

These are population-level predictive equations. Body composition, NEAT beyond steps, training intensity and adaptive thermogenesis are not modelled. Treat the result as a starting point and adjust it based on real weight trends.
