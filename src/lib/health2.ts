/** Calorie needs using the Mifflin–St Jeor equation. */
export type Sex = 'male' | 'female';

export const ACTIVITY = [
  { id: 'sedentary', label: 'Little or no exercise', factor: 1.2 },
  { id: 'light', label: 'Light exercise 1–3 days/week', factor: 1.375 },
  { id: 'moderate', label: 'Moderate exercise 3–5 days/week', factor: 1.55 },
  { id: 'active', label: 'Hard exercise 6–7 days/week', factor: 1.725 },
  { id: 'very', label: 'Very hard exercise or physical job', factor: 1.9 },
] as const;

export function bmr(sex: Sex, kg: number, cm: number, age: number): number {
  return 10 * kg + 6.25 * cm - 5 * age + (sex === 'male' ? 5 : -161);
}

export function calorieTargets(bmrValue: number, factor: number) {
  const maintain = bmrValue * factor;
  return {
    maintain,
    mildLoss: maintain - 250,
    loss: maintain - 500,
    gain: maintain + 300,
  };
}

/** CGPA ↔ percentage. CBSE uses 9.5 × CGPA; many universities use other formulas. */
export function cgpaToPercent(cgpa: number, multiplier = 9.5, subtract = 0): number {
  return cgpa * multiplier - subtract;
}
export function percentToCgpa(pct: number, multiplier = 9.5, subtract = 0): number {
  return (pct + subtract) / multiplier;
}
