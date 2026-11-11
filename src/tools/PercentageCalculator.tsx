import { useState } from 'react';
import { parseNumber, formatNumber } from '../utils/format';
import { percentDecrease, percentDifference, percentIncrease, percentOf, whatPercent } from '../lib/percentage';
import { Card } from '../components/ui/Card';
import { CopyButton } from '../components/ui/CopyButton';

interface CalcDef {
  id: string;
  title: string;
  a: { label: string; prefix?: string; suffix?: string };
  b: { label: string; prefix?: string; suffix?: string };
  sentence: (a: string, b: string) => [string, string, string];
  compute: (a: number, b: number) => number;
  format: (r: number, a: number, b: number) => string;
  formula: (a: number, b: number, r: number) => string;
  divZero: string;
}

const pct = (r: number) => `${formatNumber(r, 8)}%`;

const calcs: CalcDef[] = [
  {
    id: 'of',
    title: 'Percentage of a number',
    a: { label: 'Percent', suffix: '%' },
    b: { label: 'Number' },
    sentence: () => ['What is', '% of', '?'],
    compute: percentOf,
    format: (r) => formatNumber(r, 10),
    formula: (a, b, r) => `${formatNumber(a)} ÷ 100 × ${formatNumber(b)} = ${formatNumber(r, 10)}`,
    divZero: '',
  },
  {
    id: 'what',
    title: 'What percent is X of Y',
    a: { label: 'Part' },
    b: { label: 'Whole' },
    sentence: () => ['', 'is what percent of', '?'],
    compute: whatPercent,
    format: pct,
    formula: (a, b, r) => `${formatNumber(a)} ÷ ${formatNumber(b)} × 100 = ${pct(r)}`,
    divZero: 'The whole cannot be zero.',
  },
  {
    id: 'inc',
    title: 'Percentage increase',
    a: { label: 'Original value' },
    b: { label: 'New value' },
    sentence: () => ['From', 'to', ''],
    compute: percentIncrease,
    format: (r) => (r < 0 ? `${pct(Math.abs(r))} decrease` : `${pct(r)} increase`),
    formula: (a, b, r) => `(${formatNumber(b)} − ${formatNumber(a)}) ÷ |${formatNumber(a)}| × 100 = ${pct(r)}`,
    divZero: 'The original value cannot be zero (any increase from zero is infinite).',
  },
  {
    id: 'dec',
    title: 'Percentage decrease',
    a: { label: 'Original value' },
    b: { label: 'New value' },
    sentence: () => ['From', 'to', ''],
    compute: percentDecrease,
    format: (r) => (r < 0 ? `${pct(Math.abs(r))} increase` : `${pct(r)} decrease`),
    formula: (a, b, r) => `(${formatNumber(a)} − ${formatNumber(b)}) ÷ |${formatNumber(a)}| × 100 = ${pct(r)}`,
    divZero: 'The original value cannot be zero.',
  },
  {
    id: 'diff',
    title: 'Percentage difference',
    a: { label: 'Value A' },
    b: { label: 'Value B' },
    sentence: () => ['Between', 'and', ''],
    compute: percentDifference,
    format: pct,
    formula: (a, b, r) => `|${formatNumber(a)} − ${formatNumber(b)}| ÷ ((${formatNumber(a)} + ${formatNumber(b)}) ÷ 2) × 100 = ${pct(r)}`,
    divZero: 'The average of the two values cannot be zero.',
  },
];

const numCls =
  'h-11 w-full min-w-0 rounded-xl border border-line bg-surface px-3 text-fg tabular-nums placeholder:text-fg-subtle focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/15 aria-[invalid=true]:border-danger';

function Calc({ def }: { def: CalcDef }) {
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const na = parseNumber(a);
  const nb = parseNumber(b);
  const aBad = a.trim() !== '' && Number.isNaN(na);
  const bBad = b.trim() !== '' && Number.isNaN(nb);
  const ready = !Number.isNaN(na) && !Number.isNaN(nb);
  const r = ready ? def.compute(na, nb) : NaN;
  const result = ready && Number.isFinite(r) ? def.format(r, na, nb) : '';
  const [s1, s2, s3] = def.sentence(a, b);

  return (
    <Card className="p-5">
      <h2 className="font-semibold text-fg">{def.title}</h2>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-fg-muted">
        {s1 && <span>{s1}</span>}
        <input aria-label={def.a.label} inputMode="decimal" className={`${numCls} max-w-[9rem]`} value={a} onChange={(e) => setA(e.target.value)} placeholder={def.a.label} aria-invalid={aBad || undefined} />
        <span>{s2}</span>
        <input aria-label={def.b.label} inputMode="decimal" className={`${numCls} max-w-[9rem]`} value={b} onChange={(e) => setB(e.target.value)} placeholder={def.b.label} aria-invalid={bBad || undefined} />
        {s3 && <span>{s3}</span>}
      </div>
      <div className="mt-4 flex min-h-[64px] items-center justify-between gap-3 rounded-xl bg-surface-2 px-4 py-3" aria-live="polite">
        {aBad || bBad ? (
          <p className="text-sm text-danger">Please enter valid numbers.</p>
        ) : ready && !Number.isFinite(r) ? (
          <p className="text-sm text-danger">{def.divZero}</p>
        ) : result ? (
          <>
            <div className="min-w-0">
              <p className="text-xl font-semibold text-accent-text tabular-nums break-words">{result}</p>
              <p className="mt-0.5 text-xs text-fg-subtle break-words">{def.formula(na, nb, r)}</p>
            </div>
            <CopyButton text={result} size="icon" variant="ghost" label="Copy result" />
          </>
        ) : (
          <p className="text-sm text-fg-subtle">Enter both values to see the result.</p>
        )}
      </div>
    </Card>
  );
}

export default function PercentageCalculator() {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {calcs.map((c) => (
        <Calc key={c.id} def={c} />
      ))}
    </div>
  );
}
