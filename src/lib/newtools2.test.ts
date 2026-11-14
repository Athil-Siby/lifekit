import { describe, expect, it } from 'vitest';
import { compound, gst, lumpSum, sip } from './money2';
import { bmr, cgpaToPercent, percentToCgpa } from './health2';
import { evaluateSci, SciError } from './scicalc';
import { parseColor, rgbToCmyk, rgbToHsl, toHex, hslToRgb, readableText } from './color';
import { diffLines } from './diff';
import { md5 } from './md5';
import { base64ToText, formatJson, textToBase64, urlDecode } from './encode';
import { randomInts } from './random';
import { lorem } from './lorem';
import { scoreTyping } from './typing';

describe('money2', () => {
  it('SIP future value (5000/month, 12%, 10y ≈ 11.6 lakh)', () => {
    const r = sip(5000, 12, 10);
    expect(r.invested).toBe(600000);
    expect(Math.round(r.value)).toBe(1161695);
  });
  it('lump sum', () => expect(Math.round(lumpSum(1000, 10, 2).value)).toBe(1210));
  it('compound interest annual & monthly', () => {
    expect(compound(1000, 10, 2, 1).balance).toBeCloseTo(1210, 6);
    expect(compound(1000, 12, 1, 12).balance).toBeCloseTo(1126.825, 2);
    expect(compound(0, 0, 1, 12, 100).balance).toBeCloseTo(1200, 6);
  });
  it('GST add and remove', () => {
    expect(gst(1000, 18, 'add')).toEqual({ net: 1000, tax: 180, gross: 1180 });
    const r = gst(1180, 18, 'remove');
    expect(r.net).toBeCloseTo(1000, 9);
    expect(r.tax).toBeCloseTo(180, 9);
  });
});

describe('health2', () => {
  it('BMR Mifflin–St Jeor', () => {
    expect(bmr('male', 70, 175, 25)).toBeCloseTo(1673.75, 2);
    expect(bmr('female', 60, 165, 30)).toBeCloseTo(1320.25, 2);
  });
  it('CGPA conversions', () => {
    expect(cgpaToPercent(8.2)).toBeCloseTo(77.9, 6);
    expect(percentToCgpa(95)).toBeCloseTo(10, 6);
    expect(cgpaToPercent(8, 10, 7.5)).toBeCloseTo(72.5, 6);
  });
});

describe('scientific calculator', () => {
  const ev = (s: string, a: 'deg' | 'rad' = 'deg') => evaluateSci(s, a);
  it('precedence and power', () => {
    expect(ev('2+3*4')).toBe(14);
    expect(ev('2^3^2')).toBe(512);
    expect(ev('-2^2')).toBe(-4);
    expect(ev('(1+2)(3+4)')).toBe(21);
  });
  it('functions and constants', () => {
    expect(ev('sin(30)')).toBe(0.5);
    expect(ev('sin(180)')).toBe(0);
    expect(ev('cos(pi)', 'rad')).toBe(-1);
    expect(ev('sqrt(16)+log(1000)')).toBe(7);
    expect(ev('ln(e)')).toBe(1);
    expect(ev('2π')).toBeCloseTo(6.28318530718, 9);
    expect(ev('5!')).toBe(120);
    expect(ev('asin(1)')).toBe(90);
    expect(ev('50%')).toBe(0.5);
  });
  it('errors', () => {
    expect(() => ev('1/0')).toThrow(SciError);
    expect(() => ev('sqrt(-1)')).toThrow(/real/);
    expect(() => ev('(2+3')).toThrow(/Missing/);
    expect(() => ev('tan(90)')).toThrow(/Undefined/);
    expect(() => ev('foo(2)')).toThrow(/Unknown/);
  });
});

describe('color', () => {
  it('parses formats', () => {
    expect(parseColor('#fff')).toEqual({ r: 255, g: 255, b: 255 });
    expect(parseColor('rgb(16, 32, 48)')).toEqual({ r: 16, g: 32, b: 48 });
    expect(toHex(parseColor('hsl(0, 100%, 50%)')!)).toBe('#FF0000');
    expect(parseColor('nope')).toBeNull();
  });
  it('round trips', () => {
    const c = { r: 79, g: 70, b: 229 };
    const h = rgbToHsl(c);
    const back = hslToRgb(h.h, h.s, h.l);
    expect(Math.abs(back.r - c.r)).toBeLessThan(4);
    expect(rgbToCmyk({ r: 255, g: 0, b: 0 })).toEqual({ c: 0, m: 100, y: 100, k: 0 });
    expect(readableText({ r: 255, g: 255, b: 0 })).toBe('#000000');
  });
});

describe('diff', () => {
  it('finds added and removed lines', () => {
    const d = diffLines('a\nb\nc', 'a\nc\nd');
    expect(d.map((x) => x.type + x.text)).toEqual(['samea', 'delb', 'samec', 'addd']);
  });
  it('ignore case/space', () => {
    expect(diffLines('Hello  World', 'hello world', { ignoreCase: true, ignoreSpace: true }).every((x) => x.type === 'same')).toBe(true);
  });
});

describe('encoding', () => {
  it('md5 test vectors', () => {
    const e = new TextEncoder();
    expect(md5(e.encode(''))).toBe('d41d8cd98f00b204e9800998ecf8427e');
    expect(md5(e.encode('The quick brown fox jumps over the lazy dog'))).toBe('9e107d9d372bb6826bd81d3542a419d6');
    expect(md5(e.encode('a'.repeat(1000)))).toBe('cabe45dcc9ae5b66ba86600cca6b8ba8');
  });
  it('base64 utf-8 round trip', () => {
    expect(textToBase64('héllo ✓')).toBe('aMOpbGxvIOKckw==');
    expect(base64ToText('aMOpbGxvIOKckw')).toBe('héllo ✓');
    expect(() => base64ToText('###')).toThrow();
  });
  it('url decode', () => expect(urlDecode('a%20b+c')).toBe('a b c'));
  it('json format and errors', () => {
    expect(formatJson('{"a":[1,2]}', 2)).toBe('{\n  "a": [\n    1,\n    2\n  ]\n}');
    expect(formatJson('{ "a" : 1 }', 'min')).toBe('{"a":1}');
    expect(() => formatJson('{"a":}', 2)).toThrow(/Invalid JSON/);
  });
});

describe('random, lorem, typing', () => {
  it('unique ints', () => {
    const r = randomInts(1, 10, 10, true);
    expect(new Set(r).size).toBe(10);
    expect(Math.min(...r)).toBe(1);
    expect(() => randomInts(1, 5, 6, true)).toThrow();
  });
  it('lorem', () => {
    expect(lorem('words', 5)).toBe('Lorem ipsum dolor sit amet.');
    expect(lorem('paragraphs', 3).split('\n\n')).toHaveLength(3);
  });
  it('typing score', () => {
    const s = scoreTyping(['hello', 'world', 'foo'], ['hello', 'wrld', 'fo'], 60);
    expect(s.correctWords).toBe(1);
    expect(s.wrongWords).toBe(1);
    expect(s.wpm).toBe(2);
  });
});
