import type { ReactNode } from 'react';
import { parseNumber } from '../utils/format';
import { cn } from '../lib/cn';

/** Parses a number field; returns NaN for empty or invalid values. */
export const num = (s: string) => parseNumber(s);

export function money(n: number): string {
  if (!Number.isFinite(n)) return '—';
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function ResultRow({ label, value, strong, sub }: { label: ReactNode; value: ReactNode; strong?: boolean; sub?: ReactNode }) {
  return (
    <div className={cn('flex items-baseline justify-between gap-4 py-2.5', strong && 'py-3')}>
      <span className={cn('text-sm', strong ? 'font-semibold text-fg' : 'text-fg-muted')}>
        {label}
        {sub && <span className="block text-xs font-normal text-fg-subtle">{sub}</span>}
      </span>
      <span className={cn('text-right tabular-nums', strong ? 'text-2xl font-bold text-accent-text' : 'font-semibold text-fg')}>{value}</span>
    </div>
  );
}

export function Chips<T extends string | number>({ options, value, onChange, label, format }: { options: T[]; value: T | null; onChange: (v: T) => void; label: string; format?: (v: T) => string }) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={String(o)}
          type="button"
          aria-pressed={value === o}
          onClick={() => onChange(o)}
          className={cn(
            'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
            value === o ? 'border-accent bg-accent text-accent-fg' : 'border-line bg-surface text-fg-muted hover:border-line-strong hover:text-fg',
          )}
        >
          {format ? format(o) : String(o)}
        </button>
      ))}
    </div>
  );
}

/** Two-part horizontal bar (e.g. invested vs returns). */
export function SplitBar({ a, b, aLabel, bLabel }: { a: number; b: number; aLabel: string; bLabel: string }) {
  const total = a + b || 1;
  const pa = Math.max(0, Math.min(100, (a / total) * 100));
  return (
    <div className="mt-4">
      <div className="flex h-3 overflow-hidden rounded-full bg-surface-3" aria-hidden>
        <div className="bg-accent" style={{ width: `${pa}%` }} />
        <div className="bg-emerald-500" style={{ width: `${100 - pa}%` }} />
      </div>
      <div className="mt-2 flex justify-between text-xs text-fg-subtle">
        <span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-accent" />{aLabel} {pa.toFixed(0)}%</span>
        <span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-emerald-500" />{bLabel} {(100 - pa).toFixed(0)}%</span>
      </div>
    </div>
  );
}

/** Rounded whole-number money (for big investment figures). */
export const money0 = (n: number) => (Number.isFinite(n) ? Math.round(n).toLocaleString() : '—');
