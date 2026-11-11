import { describe, expect, it } from 'vitest';
import { percentDecrease, percentDifference, percentIncrease, percentOf, whatPercent } from './percentage';

describe('percentage', () => {
  it('percentOf', () => {
    expect(percentOf(20, 150)).toBe(30);
    expect(percentOf(12.5, 80)).toBe(10);
  });
  it('whatPercent', () => {
    expect(whatPercent(25, 200)).toBe(12.5);
    expect(whatPercent(1, 0)).toBeNaN();
  });
  it('increase and decrease', () => {
    expect(percentIncrease(100, 150)).toBe(50);
    expect(percentIncrease(-50, -25)).toBe(50);
    expect(percentDecrease(200, 150)).toBe(25);
    expect(percentDecrease(100, 120)).toBe(-20);
    expect(percentIncrease(0, 10)).toBeNaN();
  });
  it('difference', () => {
    expect(percentDifference(10, 20)).toBeCloseTo(66.6667, 3);
    expect(percentDifference(20, 10)).toBeCloseTo(66.6667, 3);
    expect(percentDifference(0, 0)).toBe(0);
  });
});
