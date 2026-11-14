/** 3725123 ms → "01:02:05" (hours shown only when needed unless forced). */
export function formatClock(ms: number, opts: { centis?: boolean; forceHours?: boolean } = {}): string {
  const neg = ms < 0;
  const t = Math.abs(ms);
  const totalSec = Math.floor(t / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const p = (n: number) => String(n).padStart(2, '0');
  let out = h > 0 || opts.forceHours ? `${p(h)}:${p(m)}:${p(s)}` : `${p(m)}:${p(s)}`;
  if (opts.centis) out += `.${p(Math.floor((t % 1000) / 10))}`;
  return (neg ? '−' : '') + out;
}

/** Milliseconds until the next occurrence of HH:MM (today if still ahead, otherwise tomorrow). */
export function msUntil(hhmm: string, now = new Date()): number {
  const [h, m] = hhmm.split(':').map(Number);
  const target = new Date(now);
  target.setHours(h, m, 0, 0);
  if (target.getTime() <= now.getTime()) target.setDate(target.getDate() + 1);
  return target.getTime() - now.getTime();
}
