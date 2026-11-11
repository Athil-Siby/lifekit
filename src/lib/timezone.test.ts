import { describe, expect, it } from 'vitest';
import { dayDifference, formatOffset, getOffsetMinutes, wallTimeInZone, zonedTimeToUtc } from './timezone';

describe('timezone', () => {
  it('computes offsets with DST', () => {
    expect(getOffsetMinutes(new Date('2026-01-15T12:00:00Z'), 'America/New_York')).toBe(-300);
    expect(getOffsetMinutes(new Date('2026-07-15T12:00:00Z'), 'America/New_York')).toBe(-240);
    expect(getOffsetMinutes(new Date('2026-07-15T12:00:00Z'), 'Asia/Kolkata')).toBe(330);
    expect(getOffsetMinutes(new Date('2026-07-15T12:00:00Z'), 'UTC')).toBe(0);
  });
  it('converts wall time to UTC', () => {
    const r = zonedTimeToUtc({ year: 2026, month: 7, day: 1, hour: 9, minute: 0 }, 'Europe/London');
    expect(r.date.toISOString()).toBe('2026-07-01T08:00:00.000Z');
    expect(r.nonexistent).toBe(false);
    const tokyo = wallTimeInZone(r.date, 'Asia/Tokyo');
    expect([tokyo.hour, tokyo.minute, tokyo.day]).toEqual([17, 0, 1]);
  });
  it('detects nonexistent times in a DST gap', () => {
    // 8 March 2026: New York clocks jump from 02:00 to 03:00.
    const r = zonedTimeToUtc({ year: 2026, month: 3, day: 8, hour: 2, minute: 30 }, 'America/New_York');
    expect(r.nonexistent).toBe(true);
    const w = wallTimeInZone(r.date, 'America/New_York');
    expect([w.hour, w.minute]).toEqual([3, 30]);
  });
  it('detects ambiguous times and picks the first occurrence', () => {
    // 1 November 2026: New York clocks go back from 02:00 to 01:00.
    const r = zonedTimeToUtc({ year: 2026, month: 11, day: 1, hour: 1, minute: 30 }, 'America/New_York');
    expect(r.ambiguous).toBe(true);
    expect(r.date.toISOString()).toBe('2026-11-01T05:30:00.000Z');
  });
  it('formats offsets and day differences', () => {
    expect(formatOffset(330)).toBe('UTC+05:30');
    expect(formatOffset(-300)).toBe('UTC−05:00');
    expect(dayDifference({ year: 2026, month: 12, day: 31, hour: 0, minute: 0 }, { year: 2027, month: 1, day: 1, hour: 0, minute: 0 })).toBe(1);
  });
});
