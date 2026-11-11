import { describe, expect, it } from 'vitest';
import { convertUnit, validateTemperature } from './units';

const close = (a: number, b: number, digits = 9) => expect(a).toBeCloseTo(b, digits);

describe('convertUnit', () => {
  it('converts length with exact factors', () => {
    close(convertUnit(1, 'length', 'in', 'cm'), 2.54);
    close(convertUnit(1, 'length', 'mi', 'km'), 1.609344);
    close(convertUnit(100, 'length', 'cm', 'm'), 1);
    close(convertUnit(3, 'length', 'ft', 'yd'), 1);
  });
  it('converts weight', () => {
    close(convertUnit(1, 'weight', 'lb', 'kg'), 0.45359237);
    close(convertUnit(1, 'weight', 'st', 'lb'), 14);
    close(convertUnit(16, 'weight', 'oz', 'lb'), 1);
  });
  it('converts temperature', () => {
    close(convertUnit(0, 'temperature', 'c', 'f'), 32);
    close(convertUnit(100, 'temperature', 'c', 'f'), 212);
    close(convertUnit(-40, 'temperature', 'f', 'c'), -40);
    close(convertUnit(0, 'temperature', 'k', 'c'), -273.15);
    close(convertUnit(98.6, 'temperature', 'f', 'c'), 37);
  });
  it('converts area, volume, speed, time and data', () => {
    close(convertUnit(1, 'area', 'ha', 'm2'), 10000);
    close(convertUnit(1, 'area', 'ac', 'm2'), 4046.8564224);
    close(convertUnit(1, 'volume', 'gal_us', 'l'), 3.785411784);
    close(convertUnit(1, 'volume', 'gal_uk', 'l'), 4.54609);
    close(convertUnit(1, 'volume', 'cup_us', 'floz_us'), 8);
    close(convertUnit(100, 'speed', 'kmh', 'mph'), 62.13711922, 6);
    close(convertUnit(1, 'speed', 'kn', 'kmh'), 1.852);
    close(convertUnit(1, 'time', 'd', 'h'), 24);
    close(convertUnit(1, 'time', 'wk', 'min'), 10080);
    close(convertUnit(1, 'data', 'GiB', 'MiB'), 1024);
    close(convertUnit(1, 'data', 'GB', 'MB'), 1000);
    close(convertUnit(1, 'data', 'B', 'bit'), 8);
  });
  it('flags temperatures below absolute zero', () => {
    expect(validateTemperature(-300, 'c')).not.toBeNull();
    expect(validateTemperature(-273.15, 'c')).toBeNull();
    expect(validateTemperature(-1, 'k')).not.toBeNull();
  });
});
