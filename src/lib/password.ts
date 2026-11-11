export interface PasswordOptions {
  length: number;
  upper: boolean;
  lower: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
}

export const CHARSETS = {
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lower: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{};:,.<>?/~',
} as const;

/** Characters easily confused with one another. */
export const AMBIGUOUS = 'O0oIl1|`\'"';

export const MIN_LENGTH = 4;
export const MAX_LENGTH = 128;

type RandomSource = (array: Uint32Array<ArrayBuffer>) => unknown;

const defaultRandom: RandomSource = (arr) => crypto.getRandomValues(arr);

/** Uniform random integer in [0, max) using rejection sampling to avoid modulo bias. */
export function randomInt(max: number, random: RandomSource = defaultRandom): number {
  if (max <= 0 || max > 2 ** 32) throw new RangeError('max out of range');
  const limit = Math.floor(2 ** 32 / max) * max;
  const buf = new Uint32Array(1);
  for (;;) {
    random(buf);
    if (buf[0] < limit) return buf[0] % max;
  }
}

export function getCharsets(opts: PasswordOptions): string[] {
  const sets: string[] = [];
  for (const key of ['upper', 'lower', 'numbers', 'symbols'] as const) {
    if (!opts[key]) continue;
    let chars: string = CHARSETS[key];
    if (opts.excludeAmbiguous) chars = [...chars].filter((c) => !AMBIGUOUS.includes(c)).join('');
    if (chars) sets.push(chars);
  }
  return sets;
}

/**
 * Generates a password containing at least one character from every selected
 * set (when the length allows), then shuffles with Fisher–Yates.
 */
export function generatePassword(opts: PasswordOptions, random: RandomSource = defaultRandom): string {
  const sets = getCharsets(opts);
  if (sets.length === 0) throw new Error('Select at least one character type.');
  const length = Math.min(MAX_LENGTH, Math.max(MIN_LENGTH, Math.floor(opts.length)));
  const pool = sets.join('');
  const chars: string[] = [];
  for (const set of sets.slice(0, length)) chars.push(set[randomInt(set.length, random)]);
  while (chars.length < length) chars.push(pool[randomInt(pool.length, random)]);
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1, random);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}

export function entropyBits(opts: PasswordOptions): number {
  const poolSize = getCharsets(opts).join('').length;
  if (poolSize === 0) return 0;
  return opts.length * Math.log2(poolSize);
}

export type StrengthLevel = 0 | 1 | 2 | 3 | 4;

export function strengthFromEntropy(bits: number): { level: StrengthLevel; label: string } {
  if (bits < 28) return { level: 0, label: 'Very weak' };
  if (bits < 36) return { level: 1, label: 'Weak' };
  if (bits < 60) return { level: 2, label: 'Fair' };
  if (bits < 100) return { level: 3, label: 'Strong' };
  return { level: 4, label: 'Very strong' };
}

/** Rough offline brute-force time at 10 billion guesses per second (average case: half the space). */
export function crackTimeEstimate(bits: number): string {
  const seconds = 2 ** bits / 2 / 1e10;
  if (seconds < 1) return 'less than a second';
  const units: [number, string][] = [
    [31_556_952 * 1e9, 'billion years'],
    [31_556_952 * 1e6, 'million years'],
    [31_556_952 * 1000, 'thousand years'],
    [31_556_952, 'years'],
    [86_400, 'days'],
    [3600, 'hours'],
    [60, 'minutes'],
    [1, 'seconds'],
  ];
  if (seconds > 31_556_952 * 1e12) return 'longer than the age of the universe';
  for (const [size, label] of units) {
    if (seconds >= size) {
      const v = seconds / size;
      return `about ${v >= 100 ? Math.round(v).toLocaleString('en-US') : v.toFixed(v < 10 ? 1 : 0)} ${label}`;
    }
  }
  return 'less than a second';
}
