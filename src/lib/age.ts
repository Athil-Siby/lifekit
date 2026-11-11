/**
 * Age maths using calendar dates only (no time of day), computed in UTC so
 * daylight-saving transitions never shift a day.
 */
export interface SimpleDate {
  year: number;
  month: number; // 1–12
  day: number;
}

export interface AgeResult {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  totalWeeks: number;
  totalMonths: number;
  nextBirthday: SimpleDate;
  daysUntilNextBirthday: number;
  ageAtNextBirthday: number;
  bornWeekday: string;
}

const DAY_MS = 86_400_000;
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function parseIsoDate(value: string): SimpleDate | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return null;
  const d = { year: +m[1], month: +m[2], day: +m[3] };
  if (d.month < 1 || d.month > 12 || d.day < 1 || d.day > daysInMonth(d.year, d.month)) return null;
  return d;
}

export function toIsoDate(d: SimpleDate): string {
  return `${String(d.year).padStart(4, '0')}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`;
}

export function todayLocal(now = new Date()): SimpleDate {
  return { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
}

export function isLeapYear(y: number): boolean {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function utc(d: SimpleDate): number {
  const t = new Date(Date.UTC(2000, d.month - 1, d.day));
  t.setUTCFullYear(d.year);
  return t.getTime();
}

export function compareDates(a: SimpleDate, b: SimpleDate): number {
  return utc(a) - utc(b);
}

export function daysBetween(a: SimpleDate, b: SimpleDate): number {
  return Math.round((utc(b) - utc(a)) / DAY_MS);
}

/** Birthday in a given year; 29 February maps to 28 February in common years. */
export function birthdayInYear(birth: SimpleDate, year: number): SimpleDate {
  if (birth.month === 2 && birth.day === 29 && !isLeapYear(year)) return { year, month: 2, day: 28 };
  return { year, month: birth.month, day: birth.day };
}

export function calculateAge(birth: SimpleDate, on: SimpleDate): AgeResult {
  if (compareDates(birth, on) > 0) throw new Error('Date of birth is after the comparison date.');

  // Whole months elapsed, then the remaining days counted from the anniversary
  // date (clamped to the end of shorter months, e.g. 31 Jan + 1 month = 29 Feb).
  let totalMonths = (on.year - birth.year) * 12 + (on.month - birth.month);
  if (on.day < birth.day) totalMonths -= 1;
  const anchorMonthIndex = birth.month - 1 + totalMonths;
  const anchorYear = birth.year + Math.floor(anchorMonthIndex / 12);
  const anchorMonth = (anchorMonthIndex % 12) + 1;
  const anchor = { year: anchorYear, month: anchorMonth, day: Math.min(birth.day, daysInMonth(anchorYear, anchorMonth)) };
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  const days = daysBetween(anchor, on);

  let next = birthdayInYear(birth, on.year);
  if (compareDates(next, on) <= 0) next = birthdayInYear(birth, on.year + 1);
  // If today is the birthday, the "next" birthday is today.
  const todayBirthday = birthdayInYear(birth, on.year);
  if (compareDates(todayBirthday, on) === 0) next = todayBirthday;

  const totalDays = daysBetween(birth, on);
  const birthWeekday = new Date(utc(birth)).getUTCDay();

  return {
    years,
    months,
    days,
    totalDays,
    totalWeeks: Math.floor(totalDays / 7),
    totalMonths,
    nextBirthday: next,
    daysUntilNextBirthday: daysBetween(on, next),
    ageAtNextBirthday: next.year - birth.year,
    bornWeekday: WEEKDAYS[birthWeekday],
  };
}
