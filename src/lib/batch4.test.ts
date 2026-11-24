import { describe, expect, it } from 'vitest';
import { attendancePlan, marksPercent, gradeFor } from './student';
import { FANCY_STYLES } from './fancyText';
import { amountInWords, intToWords } from './numberWords';
import { newRegime, oldRegime, slabTax } from './incomeTax';
import { fixedDeposit, recurringDeposit, fuelCost } from './money3';
import { bedtimesFor, convertBase, whatsappLink, countdownParts, repeatText } from './misc2';

const base = { salaried: true, age: 'below60' as const, deductions80C: 0, otherDeductions: 0 };

describe('attendance', () => {
  it('can miss when above target', () => {
    expect(attendancePlan(40, 50, 75)).toMatchObject({ canMiss: 3, mustAttend: 0 }); // 40/53 = 75.47%, 40/54 = 74.07%
  });
  it('must attend when below', () => {
    expect(attendancePlan(30, 50, 75).mustAttend).toBe(30); // 60/80 = 75%
    expect(attendancePlan(74, 100, 75).mustAttend).toBe(4); // 78/104 = 75%
  });
  it('validates', () => expect(() => attendancePlan(60, 50, 75)).toThrow());
});

describe('marks', () => {
  it('percent and grade', () => {
    expect(marksPercent([{ scored: 90, max: 100 }, { scored: 40, max: 50 }]).percent).toBeCloseTo(86.6667, 3);
    expect(gradeFor(92)).toBe('A1');
  });
});

describe('fancy text', () => {
  it('bold and script exceptions', () => {
    expect(FANCY_STYLES[0].fn('Ab1')).toBe('𝐀𝐛𝟏');
    expect(FANCY_STYLES.find((s) => s.name === 'Script')!.fn('He')).toBe('ℋℯ');
    expect(FANCY_STYLES.find((s) => s.name === 'Upside down')!.fn('hi!')).toBe('¡ᴉɥ');
  });
});

describe('number words', () => {
  it('indian system', () => {
    expect(intToWords(125000, 'indian')).toBe('one lakh twenty-five thousand');
    expect(intToWords(10000000, 'indian')).toBe('one crore');
    expect(intToWords(123456789, 'indian')).toBe('twelve crore thirty-four lakh fifty-six thousand seven hundred eighty-nine');
  });
  it('international', () => expect(intToWords(1234567, 'international')).toBe('one million two hundred thirty-four thousand five hundred sixty-seven'));
  it('cheque format', () => expect(amountInWords(1500.5, 'indian', { major: 'rupees', minor: 'paise' })).toBe('Rupees One Thousand Five Hundred And Fifty Paise Only'.replace(' And ', ' and ')));
});

describe('income tax FY 2025-26', () => {
  it('zero tax up to 12.75L salaried (new regime)', () => {
    expect(newRegime({ ...base, grossIncome: 1275000 }).total).toBe(0);
  });
  it('marginal relief just above 12L taxable', () => {
    // taxable 12,10,000: slab tax 61,500, but tax limited to 10,000 (+4% cess)
    expect(newRegime({ ...base, grossIncome: 1285000 }).total).toBe(10400);
  });
  it('new regime 20L salaried', () => {
    // taxable 19,25,000: 20k + 40k + 60k + 65k = 1,85,000 → +4% = 1,92,400
    expect(newRegime({ ...base, grossIncome: 2000000 }).total).toBe(192400);
  });
  it('old regime 10L with 1.5L 80C', () => {
    // taxable 10L - 50k - 1.5L = 8L: 12,500 + 60,000 = 72,500 → 75,400
    expect(oldRegime({ ...base, grossIncome: 1000000, deductions80C: 150000 }).total).toBe(75400);
  });
  it('old regime rebate under 5L', () => expect(oldRegime({ ...base, grossIncome: 550000 }).total).toBe(0));
  it('slab helper', () => expect(slabTax(2400000, [[4e5, 0], [8e5, 0.05], [12e5, 0.1], [16e5, 0.15], [20e5, 0.2], [24e5, 0.25], [Infinity, 0.3]])).toBe(300000));
});

describe('deposits & fuel', () => {
  it('FD quarterly', () => expect(Math.round(fixedDeposit(100000, 7, 1).maturity)).toBe(107186));
  it('RD', () => {
    const r = recurringDeposit(1000, 7, 12);
    expect(r.invested).toBe(12000);
    expect(Math.round(r.maturity)).toBeGreaterThan(12400);
    expect(Math.round(r.maturity)).toBeLessThan(12500);
  });
  it('fuel', () => expect(fuelCost(300, 15, 100, 2)).toMatchObject({ litres: 20, cost: 2000, perPerson: 1000 }));
});

describe('misc', () => {
  it('bedtimes', () => {
    const w = new Date(2026, 0, 1, 7, 0);
    expect(bedtimesFor(w)[0].getHours()).toBe(21); // 9 cycles? 6×90+15 = 555 min before 7:00 = 21:45
    expect(bedtimesFor(w)[0].getMinutes()).toBe(45);
  });
  it('bases', () => expect(convertBase('ff', 16)).toEqual({ bin: '11111111', oct: '377', dec: '255', hex: 'FF' }));
  it('bad base', () => expect(() => convertBase('102', 2)).toThrow());
  it('whatsapp', () => expect(whatsappLink('+91 98765-43210', 'Hi there')).toBe('https://wa.me/919876543210?text=Hi%20there'));
  it('countdown', () => expect(countdownParts(90061000)).toMatchObject({ days: 1, hours: 1, minutes: 1, seconds: 1 }));
  it('repeat', () => expect(repeatText('a', 3, 'comma')).toBe('a, a, a'));
});
