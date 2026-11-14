import { describe, expect, it } from 'vitest';
import { evaluate } from './calculator';
import { discount, loanPayment, loanSchedule, tip } from './finance';
import { bmi, bmiCategory, healthyRange } from './health';
import { LETTER_POINTS, weightedGpa } from './gpa';
import { addToDate, businessDaysBetween, weekdayName } from './dates';
import { formatClock, msUntil } from './time';
import { parseIsoDate } from './age';

describe('calculator', () => {
  it('follows operator precedence and parentheses', () => {
    expect(evaluate('2+3×4')).toBe(14);
    expect(evaluate('(2+3)×4')).toBe(20);
    expect(evaluate('10÷4')).toBe(2.5);
    expect(evaluate('-3+5')).toBe(2);
    expect(evaluate('2×-3')).toBe(-6);
  });
  it('removes floating point noise', () => {
    expect(evaluate('0.1+0.2')).toBe(0.3);
    expect(evaluate('1.1×3')).toBe(3.3);
  });
  it('handles percent like a pocket calculator', () => {
    expect(evaluate('200+10%')).toBe(220);
    expect(evaluate('200-10%')).toBe(180);
    expect(evaluate('200×10%')).toBe(20);
    expect(evaluate('50%')).toBe(0.5);
  });
  it('rejects invalid input', () => {
    expect(() => evaluate('5÷0')).toThrow(/divide by zero/);
    expect(() => evaluate('2+')).toThrow();
    expect(() => evaluate('(2+3')).toThrow();
    expect(() => evaluate('1..2')).toThrow();
  });
});

describe('finance', () => {
  it('computes loan payments', () => {
    expect(loanPayment(100000, 6, 360)).toBeCloseTo(599.55, 2);
    expect(loanPayment(1200, 0, 12)).toBe(100);
    const s = loanSchedule(10000, 5, 24);
    expect(s.schedule).toHaveLength(2);
    expect(s.schedule[1].balance).toBeCloseTo(0, 6);
    expect(s.totalInterest).toBeCloseTo(529.13, 1);
  });
  it('computes discounts and tips', () => {
    expect(discount(100, 20).final).toBe(80);
    const d = discount(100, 20, 10, 5);
    expect(d.final).toBeCloseTo(75.6, 6);
    expect(d.effectivePct).toBeCloseTo(28, 6);
    const t = tip(100, 15, 4);
    expect(t.total).toBe(115);
    expect(t.perPerson).toBe(28.75);
    expect(tip(100, 15, 4, true).perPerson).toBe(29);
  });
});

describe('health', () => {
  it('computes BMI and categories', () => {
    expect(bmi(70, 175)).toBeCloseTo(22.86, 2);
    expect(bmiCategory(17)).toBe('Underweight');
    expect(bmiCategory(22.9)).toBe('Healthy weight');
    expect(bmiCategory(27)).toBe('Overweight');
    expect(bmiCategory(31)).toBe('Obesity');
    const [lo, hi] = healthyRange(175);
    expect(lo).toBeCloseTo(56.66, 1);
    expect(hi).toBeCloseTo(76.26, 1);
  });
});

describe('gpa', () => {
  it('weights by credits', () => {
    const r = weightedGpa([{ credits: 3, points: LETTER_POINTS.A }, { credits: 4, points: LETTER_POINTS['B+'] }, { credits: 0, points: 0 }]);
    expect(r.credits).toBe(7);
    expect(r.gpa).toBeCloseTo((12 + 13.2) / 7, 6);
    expect(weightedGpa([{ credits: 3, points: 3 }], { gpa: 4, credits: 3 }).gpa).toBe(3.5);
  });
});

describe('dates', () => {
  const d = (s: string) => parseIsoDate(s)!;
  it('adds durations with month clamping', () => {
    expect(addToDate(d('2026-01-31'), 0, 1, 0)).toEqual({ year: 2026, month: 2, day: 28 });
    expect(addToDate(d('2024-01-31'), 0, 1, 0)).toEqual({ year: 2024, month: 2, day: 29 });
    expect(addToDate(d('2026-12-25'), 0, 0, 10)).toEqual({ year: 2027, month: 1, day: 4 });
    expect(addToDate(d('2026-03-10'), 0, 0, -10)).toEqual({ year: 2026, month: 2, day: 28 });
  });
  it('counts business days', () => {
    // Mon 2026-11-09 to Mon 2026-11-16 = 5 weekdays
    expect(businessDaysBetween(d('2026-11-09'), d('2026-11-16'))).toBe(5);
    expect(businessDaysBetween(d('2026-11-14'), d('2026-11-16'))).toBe(0);
    expect(businessDaysBetween(d('2026-11-16'), d('2026-11-09'))).toBe(-5);
    expect(weekdayName(d('2026-11-14'))).toBe('Saturday');
  });
});

describe('time', () => {
  it('formats clocks', () => {
    expect(formatClock(65_000)).toBe('01:05');
    expect(formatClock(3_725_000)).toBe('01:02:05');
    expect(formatClock(1_234, { centis: true })).toBe('00:01.23');
  });
  it('finds the next alarm time', () => {
    const now = new Date(2026, 10, 14, 7, 0, 0);
    expect(msUntil('07:30', now)).toBe(30 * 60_000);
    expect(msUntil('06:00', now)).toBe(23 * 3600_000);
  });
});
