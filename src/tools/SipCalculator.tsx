import { useMemo, useState } from 'react';
import { lumpSum, sip } from '../lib/money2';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Form';
import { Segmented } from '../components/ui/Segmented';
import { ResultRow, SplitBar, money0, num } from './shared';

export default function SipCalculator() {
  const [mode, setMode] = useState<'sip' | 'lump'>('sip');
  const [amount, setAmount] = useState('5000');
  const [rate, setRate] = useState('12');
  const [years, setYears] = useState('10');
  const A = num(amount), R = num(rate), Y = num(years);
  const valid = A > 0 && R >= 0 && R <= 50 && Y > 0 && Y <= 60;
  const r = useMemo(() => (!valid ? null : mode === 'sip' ? sip(A, R, Y) : { ...lumpSum(A, R, Y), yearly: Array.from({ length: Math.ceil(Y) }, (_, i) => ({ year: i + 1, invested: A, value: A * Math.pow(1 + R / 100, Math.min(Y, i + 1)) })) }), [valid, mode, A, R, Y]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-5 p-5 sm:p-6">
          <Segmented label="Investment type" value={mode} onChange={setMode} options={[{ value: 'sip', label: 'Monthly SIP' }, { value: 'lump', label: 'One-time (lump sum)' }]} className="w-full" />
          <Input label={mode === 'sip' ? 'Monthly investment' : 'Total investment'} inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <Input label="Expected return (% per year)" inputMode="decimal" value={rate} onChange={(e) => setRate(e.target.value)} hint="Equity mutual funds have historically returned around 10–14% a year in India, but returns aren’t guaranteed." />
          <Input label="Time period (years)" inputMode="decimal" value={years} onChange={(e) => setYears(e.target.value)} />
        </Card>
        <Card className="h-fit p-5 sm:p-6" aria-live="polite">
          {r ? (
            <>
              <div className="divide-y divide-line">
                <ResultRow label="Total value" value={money0(r.value)} strong />
                <ResultRow label="Amount invested" value={money0(r.invested)} />
                <ResultRow label="Estimated returns" value={money0(r.gains)} />
              </div>
              <SplitBar a={r.invested} b={r.gains} aLabel="Invested" bLabel="Returns" />
            </>
          ) : <p className="text-sm text-fg-subtle">Enter an amount, a return rate (0–50%) and a period (up to 60 years).</p>}
        </Card>
      </div>
      {r && (
        <Card className="overflow-hidden">
          <h2 className="border-b border-line px-5 py-3.5 text-sm font-semibold text-fg">Growth by year</h2>
          <div className="max-h-96 overflow-auto">
            <table className="w-full min-w-[420px] text-sm">
              <thead className="sticky top-0 bg-surface-2 text-xs uppercase text-fg-subtle"><tr><th className="px-5 py-2 text-left">Year</th><th className="px-5 py-2 text-right">Invested</th><th className="px-5 py-2 text-right">Value</th></tr></thead>
              <tbody className="divide-y divide-line tabular-nums">{r.yearly.map((y) => <tr key={y.year}><td className="px-5 py-2">{y.year}</td><td className="px-5 py-2 text-right text-fg-muted">{money0(y.invested)}</td><td className="px-5 py-2 text-right font-medium">{money0(y.value)}</td></tr>)}</tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
