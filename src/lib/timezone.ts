/**
 * Time-zone conversion built on Intl.DateTimeFormat, which ships the IANA
 * time-zone database with the browser. Handles DST gaps and overlaps.
 */
export interface WallTime {
  year: number;
  month: number; // 1–12
  day: number;
  hour: number;
  minute: number;
}

const formatterCache = new Map<string, Intl.DateTimeFormat>();

function partsFormatter(timeZone: string): Intl.DateTimeFormat {
  let f = formatterCache.get(timeZone);
  if (!f) {
    f = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    formatterCache.set(timeZone, f);
  }
  return f;
}

export function isValidTimeZone(timeZone: string): boolean {
  try {
    partsFormatter(timeZone);
    return true;
  } catch {
    return false;
  }
}

/** The wall-clock time in `timeZone` at the instant `date`. */
export function wallTimeInZone(date: Date, timeZone: string): WallTime & { second: number } {
  const parts = partsFormatter(timeZone).formatToParts(date);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  let year = get('year');
  // Years before 1 AD are shown with an era; not relevant for this tool.
  if (Number.isNaN(year)) year = date.getUTCFullYear();
  return {
    year,
    month: get('month'),
    day: get('day'),
    hour: get('hour') % 24,
    minute: get('minute'),
    second: get('second'),
  };
}

/** UTC offset of `timeZone` at instant `date`, in minutes (east of UTC is positive). */
export function getOffsetMinutes(date: Date, timeZone: string): number {
  const w = wallTimeInZone(date, timeZone);
  const asUtc = Date.UTC(w.year, w.month - 1, w.day, w.hour, w.minute, w.second);
  const actual = Math.floor(date.getTime() / 1000) * 1000;
  return Math.round((asUtc - actual) / 60_000);
}

function wallToNaiveMs(w: WallTime): number {
  return Date.UTC(w.year, w.month - 1, w.day, w.hour, w.minute);
}

function sameWall(a: WallTime, b: WallTime): boolean {
  return a.year === b.year && a.month === b.month && a.day === b.day && a.hour === b.hour && a.minute === b.minute;
}

export interface ZonedResult {
  /** The resolved instant. */
  date: Date;
  /** The local time did not exist (clocks sprang forward); `date` is shifted forward by the gap. */
  nonexistent: boolean;
  /** The local time happened twice (clocks went back); `date` is the first occurrence. */
  ambiguous: boolean;
}

/** Convert a wall-clock time in `timeZone` to an instant. */
export function zonedTimeToUtc(wall: WallTime, timeZone: string): ZonedResult {
  const naive = wallToNaiveMs(wall);
  // Offsets observed a little before and after the target cover any transition nearby.
  const offBefore = getOffsetMinutes(new Date(naive - 36 * 3600_000), timeZone);
  const offAfter = getOffsetMinutes(new Date(naive + 36 * 3600_000), timeZone);
  const candidates = [...new Set([offBefore, offAfter, getOffsetMinutes(new Date(naive), timeZone)])]
    .map((off) => naive - off * 60_000)
    .filter((ms) => sameWall(wallTimeInZone(new Date(ms), timeZone), wall))
    .sort((a, b) => a - b);

  if (candidates.length > 0) {
    return { date: new Date(candidates[0]), nonexistent: false, ambiguous: candidates.length > 1 };
  }
  // Gap: interpret using the offset in effect before the transition, which moves the time forward.
  return { date: new Date(naive - offBefore * 60_000), nonexistent: true, ambiguous: false };
}

export function formatOffset(minutes: number): string {
  const sign = minutes >= 0 ? '+' : '−';
  const abs = Math.abs(minutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return `UTC${sign}${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** Short zone name such as "EST", "GMT+5:30" or "CEST" (depends on browser locale data). */
export function zoneAbbreviation(date: Date, timeZone: string): string {
  try {
    const parts = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'short' }).formatToParts(date);
    return parts.find((p) => p.type === 'timeZoneName')?.value ?? '';
  } catch {
    return '';
  }
}

/** Calendar-day difference between two wall times (e.g. +1 = next day). */
export function dayDifference(a: WallTime, b: WallTime): number {
  const da = Date.UTC(a.year, a.month - 1, a.day);
  const db = Date.UTC(b.year, b.month - 1, b.day);
  return Math.round((db - da) / 86_400_000);
}

export function getLocalTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

const FALLBACK_ZONES = [
  'UTC', 'Europe/London', 'Europe/Dublin', 'Europe/Lisbon', 'Europe/Paris', 'Europe/Berlin', 'Europe/Madrid',
  'Europe/Rome', 'Europe/Amsterdam', 'Europe/Stockholm', 'Europe/Athens', 'Europe/Istanbul', 'Europe/Moscow',
  'Africa/Cairo', 'Africa/Johannesburg', 'Africa/Lagos', 'Africa/Nairobi', 'Asia/Dubai', 'Asia/Karachi',
  'Asia/Kolkata', 'Asia/Kathmandu', 'Asia/Dhaka', 'Asia/Bangkok', 'Asia/Jakarta', 'Asia/Singapore',
  'Asia/Hong_Kong', 'Asia/Shanghai', 'Asia/Taipei', 'Asia/Manila', 'Asia/Seoul', 'Asia/Tokyo',
  'Australia/Perth', 'Australia/Adelaide', 'Australia/Brisbane', 'Australia/Sydney', 'Pacific/Auckland',
  'Pacific/Honolulu', 'America/Anchorage', 'America/Los_Angeles', 'America/Denver', 'America/Phoenix',
  'America/Chicago', 'America/Mexico_City', 'America/New_York', 'America/Toronto', 'America/Halifax',
  'America/Bogota', 'America/Lima', 'America/Santiago', 'America/Sao_Paulo', 'America/Argentina/Buenos_Aires',
  'America/St_Johns',
];

export function listTimeZones(): string[] {
  try {
    const supported = (Intl as unknown as { supportedValuesOf?: (k: string) => string[] }).supportedValuesOf;
    if (supported) {
      const zones = supported('timeZone');
      return zones.includes('UTC') ? zones : ['UTC', ...zones];
    }
  } catch {
    /* fall through */
  }
  return FALLBACK_ZONES;
}

/** "America/Argentina/Buenos_Aires" → "Buenos Aires (America)" */
export function zoneLabel(zone: string): string {
  if (zone === 'UTC') return 'UTC (Coordinated Universal Time)';
  const parts = zone.split('/');
  const city = parts[parts.length - 1].replace(/_/g, ' ');
  return parts.length > 1 ? `${city} (${parts[0].replace(/_/g, ' ')})` : city;
}
