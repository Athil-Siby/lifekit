/** Each function returns NaN when the result is undefined (e.g. division by zero). */

/** What is `percent`% of `value`? */
export function percentOf(percent: number, value: number): number {
  return (percent / 100) * value;
}

/** `part` is what percent of `whole`? */
export function whatPercent(part: number, whole: number): number {
  if (whole === 0) return NaN;
  return (part / whole) * 100;
}

/** Percentage change from `from` to `to`. Positive = increase, negative = decrease. */
export function percentChange(from: number, to: number): number {
  if (from === 0) return NaN;
  return ((to - from) / Math.abs(from)) * 100;
}

/** Percentage increase from `from` to `to` (negative when it is actually a decrease). */
export function percentIncrease(from: number, to: number): number {
  return percentChange(from, to);
}

/** Percentage decrease from `from` to `to` (negative when it is actually an increase). */
export function percentDecrease(from: number, to: number): number {
  const c = percentChange(from, to);
  return Number.isNaN(c) ? NaN : -c;
}

/** Symmetric percentage difference: |a − b| divided by their mean. */
export function percentDifference(a: number, b: number): number {
  const mean = (a + b) / 2;
  if (mean === 0) return a === b ? 0 : NaN;
  return (Math.abs(a - b) / Math.abs(mean)) * 100;
}
