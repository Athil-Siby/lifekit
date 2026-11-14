/** Cryptographically strong random helpers (crypto.getRandomValues, rejection sampling for no bias). */
export function randomInt(min: number, max: number): number {
  if (max < min) [min, max] = [max, min];
  const range = max - min + 1;
  if (range <= 1) return min;
  if (range > 2 ** 32) return min + Math.floor(Math.random() * range); // beyond 32-bit: fall back
  const limit = Math.floor(2 ** 32 / range) * range;
  const buf = new Uint32Array(1);
  do crypto.getRandomValues(buf);
  while (buf[0] >= limit);
  return min + (buf[0] % range);
}

/** `count` numbers between min and max; `unique` draws without repeats. */
export function randomInts(min: number, max: number, count: number, unique: boolean): number[] {
  if (max < min) [min, max] = [max, min];
  const range = max - min + 1;
  if (unique && count > range) throw new Error(`There are only ${range} different numbers between ${min} and ${max}.`);
  if (!unique) return Array.from({ length: count }, () => randomInt(min, max));
  if (count > range / 2 && range <= 1_000_000) {
    const all = Array.from({ length: range }, (_, i) => min + i);
    shuffle(all);
    return all.slice(0, count);
  }
  const set = new Set<number>();
  while (set.size < count) set.add(randomInt(min, max));
  return [...set];
}

export function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
