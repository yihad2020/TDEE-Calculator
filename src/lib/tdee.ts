export type Sex = "male" | "female";

export interface Profile {
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  steps: number;
  sessions: number;
}

export const DEFAULT_PROFILE: Profile = {
  sex: "male",
  age: 30,
  heightCm: 175,
  weightKg: 72,
  steps: 8000,
  sessions: 3,
};

export function bmr(p: Pick<Profile, "sex" | "age" | "heightCm" | "weightKg">) {
  const base = 10 * p.weightKg + 6.25 * p.heightCm - 5 * p.age;
  return p.sex === "male" ? base + 5 : base - 161;
}

export function breakdown(p: Profile) {
  const resting = bmr(p);
  const baseline = resting * 1.2;
  const walking = p.steps * p.weightKg * 0.0005;
  const training = (200 * p.sessions) / 7;
  return {
    resting,
    baselineActivity: baseline - resting,
    baseline,
    walking,
    training,
    tdee: baseline + walking + training,
  };
}

export const cmToFtIn = (cm: number) => {
  const totalIn = cm / 2.54;
  let ft = Math.floor(totalIn / 12);
  let inch = Math.round(totalIn - ft * 12);
  if (inch === 12) { ft += 1; inch = 0; }
  return { ft, inch };
};
export const kgToLb = (kg: number) => kg * 2.2046226218;
export const lbToKg = (lb: number) => lb / 2.2046226218;
export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
