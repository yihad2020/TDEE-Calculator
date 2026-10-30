import { describe, expect, it } from "vitest";
import { bmr, breakdown } from "./tdee";

describe("TDEE model", () => {
  it("male BMR uses +5", () => {
    expect(bmr({ sex: "male", age: 30, heightCm: 180, weightKg: 80 })).toBe(1780);
  });
  it("female BMR uses -161", () => {
    expect(bmr({ sex: "female", age: 30, heightCm: 180, weightKg: 80 })).toBe(1614);
  });
  it("TDEE = BMR*1.2 + steps*kg*0.0005 + 200*sessions/7", () => {
    const b = breakdown({ sex: "male", age: 30, heightCm: 180, weightKg: 80, steps: 10000, sessions: 7 });
    expect(b.walking).toBe(400);
    expect(b.training).toBe(200);
    expect(b.tdee).toBeCloseTo(1780 * 1.2 + 400 + 200, 10);
    expect(b.resting + b.baselineActivity + b.walking + b.training).toBeCloseTo(b.tdee, 10);
  });
});
