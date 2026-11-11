import { describe, expect, it } from 'vitest';
import { calculateAge, parseIsoDate } from './age';

const d = (s: string) => parseIsoDate(s)!;

describe('calculateAge', () => {
  it('computes years, months and days', () => {
    const r = calculateAge(d('1990-05-15'), d('2026-11-11'));
    expect([r.years, r.months, r.days]).toEqual([36, 5, 27]);
    expect(r.bornWeekday).toBe('Tuesday');
  });
  it('borrows days from the previous month', () => {
    const r = calculateAge(d('2000-01-31'), d('2000-03-01'));
    expect([r.years, r.months, r.days]).toEqual([0, 1, 1]);
  });
  it('counts total days including leap years', () => {
    expect(calculateAge(d('2000-01-01'), d('2001-01-01')).totalDays).toBe(366);
    expect(calculateAge(d('2001-01-01'), d('2002-01-01')).totalDays).toBe(365);
  });
  it('finds the next birthday', () => {
    const r = calculateAge(d('1990-12-25'), d('2026-11-11'));
    expect(r.nextBirthday).toEqual({ year: 2026, month: 12, day: 25 });
    expect(r.daysUntilNextBirthday).toBe(44);
    expect(r.ageAtNextBirthday).toBe(36);
  });
  it('handles a birthday today', () => {
    const r = calculateAge(d('2000-11-11'), d('2026-11-11'));
    expect(r.years).toBe(26);
    expect(r.daysUntilNextBirthday).toBe(0);
  });
  it('handles 29 February', () => {
    const r = calculateAge(d('2004-02-29'), d('2027-01-10'));
    expect(r.nextBirthday).toEqual({ year: 2027, month: 2, day: 28 });
    const leap = calculateAge(d('2004-02-29'), d('2028-01-10'));
    expect(leap.nextBirthday).toEqual({ year: 2028, month: 2, day: 29 });
  });
  it('rejects future dates of birth and invalid dates', () => {
    expect(() => calculateAge(d('2030-01-01'), d('2026-01-01'))).toThrow();
    expect(parseIsoDate('2023-02-29')).toBeNull();
    expect(parseIsoDate('2024-02-29')).not.toBeNull();
  });
});
