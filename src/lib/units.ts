/**
 * Unit conversion definitions. Linear units are defined by their factor to the
 * category's base unit. Temperature uses explicit formulas.
 */
export type UnitCategoryId =
  | 'length'
  | 'weight'
  | 'temperature'
  | 'area'
  | 'volume'
  | 'speed'
  | 'time'
  | 'data';

export interface Unit {
  id: string;
  name: string;
  symbol: string;
  /** Multiply a value in this unit by `factor` to get the base unit. Unused for temperature. */
  factor: number;
}

export interface UnitCategory {
  id: UnitCategoryId;
  name: string;
  units: Unit[];
  defaultFrom: string;
  defaultTo: string;
}

const u = (id: string, name: string, symbol: string, factor: number): Unit => ({ id, name, symbol, factor });

// Exact definitions where they exist.
const INCH = 0.0254;
const FOOT = 12 * INCH;
const YARD = 3 * FOOT;
const MILE = 1760 * YARD;
const POUND = 0.45359237;
const US_GALLON = 3.785411784; // litres
const UK_GALLON = 4.54609; // litres

export const unitCategories: UnitCategory[] = [
  {
    id: 'length',
    name: 'Length',
    defaultFrom: 'cm',
    defaultTo: 'in',
    units: [
      u('mm', 'Millimetre', 'mm', 0.001),
      u('cm', 'Centimetre', 'cm', 0.01),
      u('m', 'Metre', 'm', 1),
      u('km', 'Kilometre', 'km', 1000),
      u('in', 'Inch', 'in', INCH),
      u('ft', 'Foot', 'ft', FOOT),
      u('yd', 'Yard', 'yd', YARD),
      u('mi', 'Mile', 'mi', MILE),
      u('nmi', 'Nautical mile', 'nmi', 1852),
    ],
  },
  {
    id: 'weight',
    name: 'Weight',
    defaultFrom: 'kg',
    defaultTo: 'lb',
    units: [
      u('mg', 'Milligram', 'mg', 1e-6),
      u('g', 'Gram', 'g', 0.001),
      u('kg', 'Kilogram', 'kg', 1),
      u('t', 'Tonne (metric)', 't', 1000),
      u('oz', 'Ounce', 'oz', POUND / 16),
      u('lb', 'Pound', 'lb', POUND),
      u('st', 'Stone', 'st', 14 * POUND),
      u('ton_us', 'Short ton (US)', 'ton', 2000 * POUND),
      u('ton_uk', 'Long ton (UK)', 'LT', 2240 * POUND),
    ],
  },
  {
    id: 'temperature',
    name: 'Temperature',
    defaultFrom: 'c',
    defaultTo: 'f',
    units: [u('c', 'Celsius', '°C', 1), u('f', 'Fahrenheit', '°F', 1), u('k', 'Kelvin', 'K', 1)],
  },
  {
    id: 'area',
    name: 'Area',
    defaultFrom: 'm2',
    defaultTo: 'ft2',
    units: [
      u('mm2', 'Square millimetre', 'mm²', 1e-6),
      u('cm2', 'Square centimetre', 'cm²', 1e-4),
      u('m2', 'Square metre', 'm²', 1),
      u('ha', 'Hectare', 'ha', 10_000),
      u('km2', 'Square kilometre', 'km²', 1e6),
      u('in2', 'Square inch', 'in²', INCH * INCH),
      u('ft2', 'Square foot', 'ft²', FOOT * FOOT),
      u('yd2', 'Square yard', 'yd²', YARD * YARD),
      u('ac', 'Acre', 'ac', 4840 * YARD * YARD),
      u('mi2', 'Square mile', 'mi²', MILE * MILE),
    ],
  },
  {
    id: 'volume',
    name: 'Volume',
    defaultFrom: 'l',
    defaultTo: 'gal_us',
    units: [
      u('ml', 'Millilitre', 'mL', 0.001),
      u('l', 'Litre', 'L', 1),
      u('m3', 'Cubic metre', 'm³', 1000),
      u('tsp_us', 'Teaspoon (US)', 'tsp', US_GALLON / 768),
      u('tbsp_us', 'Tablespoon (US)', 'tbsp', US_GALLON / 256),
      u('floz_us', 'Fluid ounce (US)', 'fl oz', US_GALLON / 128),
      u('cup_us', 'Cup (US)', 'cup', US_GALLON / 16),
      u('pt_us', 'Pint (US)', 'pt', US_GALLON / 8),
      u('gal_us', 'Gallon (US)', 'gal', US_GALLON),
      u('floz_uk', 'Fluid ounce (UK)', 'fl oz (UK)', UK_GALLON / 160),
      u('pt_uk', 'Pint (UK)', 'pt (UK)', UK_GALLON / 8),
      u('gal_uk', 'Gallon (UK)', 'gal (UK)', UK_GALLON),
      u('in3', 'Cubic inch', 'in³', INCH ** 3 * 1000),
      u('ft3', 'Cubic foot', 'ft³', FOOT ** 3 * 1000),
    ],
  },
  {
    id: 'speed',
    name: 'Speed',
    defaultFrom: 'kmh',
    defaultTo: 'mph',
    units: [
      u('ms', 'Metres per second', 'm/s', 1),
      u('kmh', 'Kilometres per hour', 'km/h', 1000 / 3600),
      u('mph', 'Miles per hour', 'mph', MILE / 3600),
      u('fts', 'Feet per second', 'ft/s', FOOT),
      u('kn', 'Knot', 'kn', 1852 / 3600),
    ],
  },
  {
    id: 'time',
    name: 'Time',
    defaultFrom: 'h',
    defaultTo: 'min',
    units: [
      u('ms', 'Millisecond', 'ms', 0.001),
      u('s', 'Second', 's', 1),
      u('min', 'Minute', 'min', 60),
      u('h', 'Hour', 'h', 3600),
      u('d', 'Day', 'd', 86_400),
      u('wk', 'Week', 'wk', 604_800),
      u('mo', 'Month (average)', 'mo', 2_629_746),
      u('yr', 'Year (average, 365.2425 d)', 'yr', 31_556_952),
    ],
  },
  {
    id: 'data',
    name: 'Digital storage',
    defaultFrom: 'GB',
    defaultTo: 'MB',
    units: [
      u('bit', 'Bit', 'bit', 1 / 8),
      u('B', 'Byte', 'B', 1),
      u('KB', 'Kilobyte', 'KB', 1e3),
      u('MB', 'Megabyte', 'MB', 1e6),
      u('GB', 'Gigabyte', 'GB', 1e9),
      u('TB', 'Terabyte', 'TB', 1e12),
      u('KiB', 'Kibibyte', 'KiB', 1024),
      u('MiB', 'Mebibyte', 'MiB', 1024 ** 2),
      u('GiB', 'Gibibyte', 'GiB', 1024 ** 3),
      u('TiB', 'Tebibyte', 'TiB', 1024 ** 4),
    ],
  },
];

export function getUnitCategory(id: UnitCategoryId): UnitCategory {
  const cat = unitCategories.find((c) => c.id === id);
  if (!cat) throw new Error(`Unknown unit category: ${id}`);
  return cat;
}

function toKelvin(value: number, from: string): number {
  if (from === 'c') return value + 273.15;
  if (from === 'f') return ((value - 32) * 5) / 9 + 273.15;
  return value;
}

function fromKelvin(k: number, to: string): number {
  if (to === 'c') return k - 273.15;
  if (to === 'f') return ((k - 273.15) * 9) / 5 + 32;
  return k;
}

export function convertUnit(value: number, categoryId: UnitCategoryId, fromId: string, toId: string): number {
  if (!Number.isFinite(value)) return NaN;
  if (categoryId === 'temperature') return fromKelvin(toKelvin(value, fromId), toId);
  const cat = getUnitCategory(categoryId);
  const from = cat.units.find((x) => x.id === fromId);
  const to = cat.units.find((x) => x.id === toId);
  if (!from || !to) throw new Error('Unknown unit');
  if (from.id === to.id) return value;
  return (value * from.factor) / to.factor;
}

/** Returns an error message when a temperature is below absolute zero. */
export function validateTemperature(value: number, unitId: string): string | null {
  return toKelvin(value, unitId) < -1e-9 ? 'That is below absolute zero (−273.15 °C), which is not physically possible.' : null;
}
