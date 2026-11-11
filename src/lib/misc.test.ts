import { describe, expect, it } from 'vitest';
import { convertSize, windowsStyle } from './fileSize';
import { compactPages, parsePageRanges, rangeToIndices } from './pageRanges';
import { entropyBits, generatePassword, getCharsets, randomInt, strengthFromEntropy, AMBIGUOUS } from './password';
import { buildQrPayload, contrastRatio, emptyQrFields } from './qrContent';
import { searchTools } from './search';
import { formatBytes, formatNumber, parseNumber } from '../utils/format';

describe('fileSize', () => {
  it('converts between decimal and binary', () => {
    expect(convertSize(1, 'TB', 'GiB')).toBeCloseTo(931.3225746, 6);
    expect(convertSize(1, 'GiB', 'MB')).toBeCloseTo(1073.741824, 6);
    expect(convertSize(1, 'KiB', 'B')).toBe(1024);
    expect(windowsStyle(1e12)).toBe('931.32 GB');
  });
});

describe('pageRanges', () => {
  it('parses ranges', () => {
    const r = parsePageRanges('1-3, 5, 8-', 10);
    expect(r).toEqual({ ok: true, ranges: [{ start: 1, end: 3 }, { start: 5, end: 5 }, { start: 8, end: 10 }] });
  });
  it('rejects invalid input', () => {
    expect(parsePageRanges('0', 5).ok).toBe(false);
    expect(parsePageRanges('6', 5).ok).toBe(false);
    expect(parsePageRanges('a-b', 5).ok).toBe(false);
    expect(parsePageRanges('', 5).ok).toBe(false);
  });
  it('expands and compacts', () => {
    expect(rangeToIndices({ start: 3, end: 1 })).toEqual([2, 1, 0]);
    expect(compactPages([5, 1, 2, 3, 9, 10])).toBe('1-3, 5, 9-10');
  });
});

describe('password', () => {
  const base = { length: 20, upper: true, lower: true, numbers: true, symbols: true, excludeAmbiguous: false };
  it('generates passwords of the requested length with every selected set', () => {
    for (let i = 0; i < 200; i++) {
      const p = generatePassword(base);
      expect(p).toHaveLength(20);
      expect(p).toMatch(/[A-Z]/);
      expect(p).toMatch(/[a-z]/);
      expect(p).toMatch(/\d/);
      expect(p).toMatch(/[^A-Za-z0-9]/);
    }
  });
  it('excludes ambiguous characters', () => {
    const opts = { ...base, length: 128, excludeAmbiguous: true };
    for (let i = 0; i < 50; i++) for (const c of generatePassword(opts)) expect(AMBIGUOUS.includes(c)).toBe(false);
  });
  it('requires a character set', () => {
    expect(() => generatePassword({ ...base, upper: false, lower: false, numbers: false, symbols: false })).toThrow();
  });
  it('randomInt has no obvious bias', () => {
    const counts = [0, 0, 0];
    for (let i = 0; i < 30000; i++) counts[randomInt(3)]++;
    for (const c of counts) expect(Math.abs(c - 10000)).toBeLessThan(600);
  });
  it('estimates entropy', () => {
    expect(getCharsets({ ...base, symbols: false, numbers: false, upper: false }).join('')).toHaveLength(26);
    expect(entropyBits({ ...base, length: 10, upper: false, numbers: false, symbols: false })).toBeCloseTo(47.0, 1);
    expect(strengthFromEntropy(130).label).toBe('Very strong');
  });
});

describe('qrContent', () => {
  it('builds payloads', () => {
    expect(buildQrPayload('url', { ...emptyQrFields, url: 'example.com' })).toEqual({ ok: true, payload: 'https://example.com' });
    expect(buildQrPayload('url', { ...emptyQrFields, url: 'not a url' }).ok).toBe(false);
    expect(buildQrPayload('wifi', { ...emptyQrFields, wifiSsid: 'My;Net', wifiPassword: 'p:ss' })).toEqual({
      ok: true,
      payload: 'WIFI:T:WPA;S:My\\;Net;P:p\\:ss;;',
    });
    expect(buildQrPayload('email', { ...emptyQrFields, email: 'a@b.co', emailSubject: 'Hi there' })).toEqual({
      ok: true,
      payload: 'mailto:a@b.co?subject=Hi%20there',
    });
    expect(buildQrPayload('phone', { ...emptyQrFields, phone: '+1 (555) 010-0000' })).toEqual({ ok: true, payload: 'tel:+15550100000' });
    expect(buildQrPayload('text', emptyQrFields)).toEqual({ ok: false, error: null });
  });
  it('computes contrast', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 1);
    expect(contrastRatio('#777777', '#888888')).toBeLessThan(1.5);
  });
});

describe('search', () => {
  it('finds tools by name and keyword', () => {
    expect(searchTools('merge')[0].slug).toBe('pdf-merger');
    expect(searchTools('kg to lbs')[0].slug).toBe('unit-converter');
    expect(searchTools('wifi')[0].slug).toBe('qr-code-generator');
    expect(searchTools('png to jpg')[0].slug).toBe('image-converter');
    expect(searchTools('zzzz')).toHaveLength(0);
  });
});

describe('format', () => {
  it('formats bytes and numbers', () => {
    expect(formatBytes(1500)).toBe('1.5 KB');
    expect(formatBytes(1024, { binary: true })).toBe('1 KiB');
    expect(formatNumber(0.1 + 0.2)).toBe('0.3');
    expect(formatNumber(1234567.891)).toBe('1,234,567.891');
    expect(parseNumber('1,234.5')).toBe(1234.5);
    expect(Number.isNaN(parseNumber('12abc'))).toBe(true);
  });
});

import { validateContact } from './contact';
describe('validateContact', () => {
  it('validates fields', () => {
    const ok = { name: 'Sam', email: 'sam@example.com', topic: 'bug' as const, message: 'Something broke here.', website: '' };
    expect(validateContact(ok)).toEqual({});
    expect(Object.keys(validateContact({ ...ok, name: ' ', email: 'x', message: 'short' })).sort()).toEqual(['email', 'message', 'name']);
  });
});
