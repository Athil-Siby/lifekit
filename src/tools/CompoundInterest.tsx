import { useMemo, useState } from 'react';
import { compound } from '../lib/money2';
import { Card } from '../components/ui/Card';
import { Input, Select } from '../components/ui/Form';
import { ResultRow, SplitBar, money, num } from './shared';

export default function CompoundInterest() {
  const [principal, setPrincipal] = useState('10000');
  const [monthly, setMonthly] = useState('0');
  const [rate, setRate] = useState('8');
  const [years, setYears] = useState('10');
  const [freq, setFreq] = useState('12');
  const P = num(principal), M = num(monthly) || 0, R = num(rate), Y = num(years);
  const valid = P >= 0 && M >= 0 && P + M > 0 && R >= 0 && R <= 100 && Y > 0 && Y <= 100;
  const r = useMemo(() => (valid ? compound(P, R, Y, Number(freq), M) : null), [valid, P, R, Y, freq, M]);
  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-5 p-5 sm:p-6">
          <Input label="Starting amount" inputMode="decimal" value={principal} onChange={(e) => setPrincipal(e.target.value)} />
          <Input label="Monthly addition (optional)" inputMode="decimal" value={monthly} onChange={(e) => setMonthly(e.target.value)} />
          <Input label="Interest rate (% per year)" inputMode="decimal" value={rate} onChange={(e) => setRate(e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Years" inputMode="decimal" value={years} onChange={(e) => setYears(e.target.value)} />
            <Select label="Compounded" value={freq} onChange={(e) => setFreq(e.target.value)}>
              <option value="1">Yearly</option><option value="2">Half-yearly</option><option value="4">Quarterly</option><option value="12">Monthly</option><option value="365">Daily</option>
            </Select>
          </div>
        </Card>
        <Card className="h-fit p-5 sm:p-6" aria-live="polite">
          {r ? (
            <>
              <div className="divide-y divide-line">
                <ResultRow label="Final balance" value={money(r.balance)} strong />
                <ResultRow label="Total deposited" value={money(r.contributed)} />
                <ResultRow label="Interest earned" value={money(r.interest)} />
              </div>
              <SplitBar a={r.contributed} b={r.interest} aLabel="Deposits" bLabel="Interest" />
            </>
          ) : <p className="text-sm text-fg-subtle">Enter your amounts, a rate and a period.</p>}
        </Card>
      </div>
      {r && (
        <Card className="overflow-hidden">
          <h2 className="border-b border-line px-5 py-3.5 text-sm font-semibold text-fg">Balance by year</h2>
          <div className="max-h-96 overflow-auto">
            <table className="w-full min-w-[480px] text-sm">
              <thead className="sticky top-0 bg-surface-2 text-xs uppercase text-fg-subtle"><tr><th className="px-5 py-2 text-left">Year</th><th className="px-5 py-2 text-right">Deposited</th><th className="px-5 py-2 text-right">Interest</th><th className="px-5 py-2 text-right">Balance</th></tr></thead>
              <tbody className="divide-y divide-line tabular-nums">{r.yearly.map((y) => <tr key={y.year}><td className="px-5 py-2">{y.year}</td><td className="px-5 py-2 text-right text-fg-muted">{money(y.contributed)}</td><td className="px-5 py-2 text-right text-fg-muted">{money(y.interest)}</td><td className="px-5 py-2 text-right font-medium">{money(y.balance)}</td></tr>)}</tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
