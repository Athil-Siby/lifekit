import { daysInMonth, type SimpleDate, compareDates, daysBetween } from './age';

/** Add years, months and days to a date. Months clamp to the end of shorter months (31 Jan + 1 month = 28/29 Feb). */
export function addToDate(d: SimpleDate, years: number, months: number, days: number): SimpleDate {
  const totalMonths = d.year * 12 + (d.month - 1) + years * 12 + months;
  const y = Math.floor(totalMonths / 12);
  const m = (totalMonths % 12) + 1;
  const day = Math.min(d.day, daysInMonth(y, m));
  const dt = new Date(Date.UTC(2000, m - 1, day));
  dt.setUTCFullYear(y);
  dt.setUTCDate(dt.getUTCDate() + days);
  return { year: dt.getUTCFullYear(), month: dt.getUTCMonth() + 1, day: dt.getUTCDate() };
}

/** Weekdays (Mon–Fri) from start up to but not including end. Negative if end is before start. */
export function businessDaysBetween(a: SimpleDate, b: SimpleDate): number {
  const sign = compareDates(a, b) <= 0 ? 1 : -1;
  const [start, end] = sign > 0 ? [a, b] : [b, a];
  const total = daysBetween(start, end);
  const startDow = new Date(Date.UTC(start.year, start.month - 1, start.day)).getUTCDay();
  const full = Math.floor(total / 7);
  let count = full * 5;
  for (let i = 0; i < total % 7; i++) {
    const dow = (startDow + i) % 7;
    if (dow !== 0 && dow !== 6) count++;
  }
  return sign * count;
}

export function weekdayName(d: SimpleDate): string {
  return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][
    new Date(Date.UTC(d.year, d.month - 1, d.day)).getUTCDay()
  ];
}
