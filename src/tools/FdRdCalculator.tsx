import { useState } from 'react';
import { fixedDeposit, recurringDeposit } from '../lib/money3';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Form';
import { Segmented } from '../components/ui/Segmented';
import { ResultRow, SplitBar, money0, num } from './shared';

export default function FdRdCalculator() {
  const [mode, setMode] = useState<'fd' | 'rd'>('fd');
  const [amount, setAmount] = useState('100000');
  const [rate, setRate] = useState('7');
  const [years, setYears] = useState('3');
  const A = num(amount), R = num(rate), Y = num(years);
  const valid = A > 0 && R >= 0 && R <= 30 && Y > 0 && Y <= 30;
  const r = !valid ? null : mode === 'fd' ? { ...fixedDeposit(A, R, Y), invested: A } : recurringDeposit(A, R, Math.round(Y * 12));
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="space-y-5 p-5 sm:p-6">
        <Segmented label="Deposit type" value={mode} onChange={(m) => { setMode(m); setAmount(m === 'fd' ? '100000' : '5000'); }} options={[{ value: 'fd', label: 'Fixed deposit (FD)' }, { value: 'rd', label: 'Recurring deposit (RD)' }]} className="w-full" />
        <Input label={mode === 'fd' ? 'Deposit amount' : 'Monthly deposit'} inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <Input label="Interest rate (% per year)" inputMode="decimal" value={rate} onChange={(e) => setRate(e.target.value)} />
        <Input label="Period (years)" inputMode="decimal" value={years} onChange={(e) => setYears(e.target.value)} />
        <p className="text-xs text-fg-subtle">Uses quarterly compounding, the method most Indian banks use. TDS and taxes aren’t included.</p>
      </Card>
      <Card className="h-fit p-5 sm:p-6" aria-live="polite">
        {r ? (
          <>
            <div className="divide-y divide-line">
              <ResultRow label="Maturity amount" value={money0(r.maturity)} strong />
              <ResultRow label="Total deposited" value={money0(r.invested)} />
              <ResultRow label="Interest earned" value={money0(r.interest)} />
            </div>
            <SplitBar a={r.invested} b={r.interest} aLabel="Deposited" bLabel="Interest" />
          </>
        ) : <p className="text-sm text-fg-subtle">Enter an amount, a rate and a period.</p>}
      </Card>
    </div>
  );
}
