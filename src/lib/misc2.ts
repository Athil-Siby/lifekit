/** Small helpers: sleep cycles, number bases, WhatsApp links, teams, countdown parts, text repeat. */
export function bedtimesFor(wake: Date, cycles = [6, 5, 4], fallAsleepMin = 15): Date[] {
  return cycles.map((c) => new Date(wake.getTime() - (c * 90 + fallAsleepMin) * 60000));
}
export function wakeTimesFor(sleepAt: Date, cycles = [4, 5, 6], fallAsleepMin = 15): Date[] {
  return cycles.map((c) => new Date(sleepAt.getTime() + (c * 90 + fallAsleepMin) * 60000));
}

export function convertBase(value: string, from: number): { bin: string; oct: string; dec: string; hex: string } {
  const clean = value.trim().toLowerCase().replace(/^0[xbo]/, '').replace(/[\s_]/g, '');
  const digits = '0123456789abcdefghijklmnopqrstuvwxyz'.slice(0, from);
  if (!clean || [...clean].some((c) => !digits.includes(c))) throw new Error(`That isn’t a valid base-${from} number.`);
  let n = 0n;
  for (const c of clean) n = n * BigInt(from) + BigInt(digits.indexOf(c));
  return { bin: n.toString(2), oct: n.toString(8), dec: n.toString(10), hex: n.toString(16).toUpperCase() };
}

export function whatsappLink(phone: string, message: string): string {
  const digits = phone.replace(/[^\d]/g, '');
  const text = message.trim() ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${digits}${text}`;
}

export function makeTeams<T>(items: T[], teams: number, shuffled: T[]): T[][] {
  const out: T[][] = Array.from({ length: Math.max(1, teams) }, () => []);
  shuffled.forEach((x, i) => out[i % out.length].push(x));
  void items;
  return out;
}

export function countdownParts(ms: number) {
  const neg = ms < 0;
  let s = Math.floor(Math.abs(ms) / 1000);
  const days = Math.floor(s / 86400); s %= 86400;
  const hours = Math.floor(s / 3600); s %= 3600;
  const minutes = Math.floor(s / 60);
  return { neg, days, hours, minutes, seconds: s % 60 };
}

export function repeatText(text: string, times: number, sep: 'newline' | 'space' | 'none' | 'comma'): string {
  const n = Math.max(1, Math.min(10000, Math.floor(times)));
  const j = sep === 'newline' ? '\n' : sep === 'space' ? ' ' : sep === 'comma' ? ', ' : '';
  return Array(n).fill(text).join(j);
}
