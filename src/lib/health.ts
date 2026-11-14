export type BmiCategory = 'Underweight' | 'Healthy weight' | 'Overweight' | 'Obesity';

/** BMI from kilograms and centimetres. */
export function bmi(kg: number, cm: number): number {
  const m = cm / 100;
  if (m <= 0 || kg <= 0) return NaN;
  return kg / (m * m);
}

/** WHO adult categories. */
export function bmiCategory(value: number): BmiCategory {
  if (value < 18.5) return 'Underweight';
  if (value < 25) return 'Healthy weight';
  if (value < 30) return 'Overweight';
  return 'Obesity';
}

/** Weight range (kg) that gives a BMI of 18.5–24.9 for a height. */
export function healthyRange(cm: number): [number, number] {
  const m = cm / 100;
  return [18.5 * m * m, 24.9 * m * m];
}

export const lbToKg = (lb: number) => lb * 0.45359237;
export const kgToLb = (kg: number) => kg / 0.45359237;
export const ftInToCm = (ft: number, inch: number) => (ft * 12 + inch) * 2.54;
