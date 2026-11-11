/** Human-readable bytes. Uses decimal (kB = 1000) by default because that matches most browsers and macOS. */
export function formatBytes(bytes: number, opts: { binary?: boolean; decimals?: number } = {}): string {
  const { binary = false, decimals = 1 } = opts;
  if (!Number.isFinite(bytes)) return '—';
  if (bytes === 0) return '0 B';
  const base = binary ? 1024 : 1000;
  const units = binary ? ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB'] : ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const sign = bytes < 0 ? '-' : '';
  let value = Math.abs(bytes);
  let i = 0;
  while (value >= base && i < units.length - 1) {
    value /= base;
    i++;
  }
  const d = i === 0 ? 0 : decimals;
  return `${sign}${value.toFixed(d).replace(/\.0+$/, '')} ${units[i]}`;
}

/**
 * Format a number for display with a sensible number of significant digits,
 * avoiding floating-point noise like 0.30000000000000004.
 */
export function formatNumber(value: number, maxSignificant = 10): string {
  if (!Number.isFinite(value)) return '—';
  if (value === 0) return '0';
  const abs = Math.abs(value);
  if (abs >= 1e15 || abs < 1e-9) {
    return value.toExponential(Math.min(maxSignificant - 1, 6)).replace(/\.?0+e/, 'e');
  }
  const rounded = Number(value.toPrecision(maxSignificant));
  return rounded.toLocaleString('en-US', { maximumFractionDigits: 12 });
}

/** Parse user-entered numbers, accepting commas as thousands separators. Returns NaN when invalid. */
export function parseNumber(input: string): number {
  const cleaned = input.trim().replace(/,/g, '').replace(/\s+/g, '');
  if (cleaned === '' || cleaned === '-' || cleaned === '.') return NaN;
  if (!/^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i.test(cleaned)) return NaN;
  return Number(cleaned);
}

export function pluralize(n: number, singular: string, plural = `${singular}s`): string {
  return `${n.toLocaleString('en-US')} ${n === 1 ? singular : plural}`;
}
