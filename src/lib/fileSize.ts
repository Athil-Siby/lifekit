export type SizeUnitId = 'B' | 'KB' | 'MB' | 'GB' | 'TB' | 'PB' | 'KiB' | 'MiB' | 'GiB' | 'TiB' | 'PiB' | 'bit';

export interface SizeUnit {
  id: SizeUnitId;
  name: string;
  bytes: number;
  system: 'decimal' | 'binary' | 'base';
}

export const sizeUnits: SizeUnit[] = [
  { id: 'bit', name: 'Bits', bytes: 1 / 8, system: 'base' },
  { id: 'B', name: 'Bytes', bytes: 1, system: 'base' },
  { id: 'KB', name: 'Kilobytes', bytes: 1e3, system: 'decimal' },
  { id: 'MB', name: 'Megabytes', bytes: 1e6, system: 'decimal' },
  { id: 'GB', name: 'Gigabytes', bytes: 1e9, system: 'decimal' },
  { id: 'TB', name: 'Terabytes', bytes: 1e12, system: 'decimal' },
  { id: 'PB', name: 'Petabytes', bytes: 1e15, system: 'decimal' },
  { id: 'KiB', name: 'Kibibytes', bytes: 1024, system: 'binary' },
  { id: 'MiB', name: 'Mebibytes', bytes: 1024 ** 2, system: 'binary' },
  { id: 'GiB', name: 'Gibibytes', bytes: 1024 ** 3, system: 'binary' },
  { id: 'TiB', name: 'Tebibytes', bytes: 1024 ** 4, system: 'binary' },
  { id: 'PiB', name: 'Pebibytes', bytes: 1024 ** 5, system: 'binary' },
];

export function unitById(id: SizeUnitId): SizeUnit {
  const unit = sizeUnits.find((x) => x.id === id);
  if (!unit) throw new Error(`Unknown unit ${id}`);
  return unit;
}

export function toBytes(value: number, unit: SizeUnitId): number {
  return value * unitById(unit).bytes;
}

export function convertSize(value: number, from: SizeUnitId, to: SizeUnitId): number {
  return toBytes(value, from) / unitById(to).bytes;
}

/** How Windows labels a size: binary maths with decimal unit names. */
export function windowsStyle(bytes: number): string {
  const labels = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  let v = bytes;
  let i = 0;
  while (v >= 1024 && i < labels.length - 1) {
    v /= 1024;
    i++;
  }
  return `${i === 0 ? Math.round(v) : v.toFixed(2)} ${labels[i]}`;
}
