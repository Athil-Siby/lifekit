import { useState } from 'react';
import { gst } from '../lib/money2';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Form';
import { Segmented } from '../components/ui/Segmented';
import { Chips, ResultRow, money, num } from './shared';

const RATES = [3, 5, 12, 18, 28];

export default function GstCalculator() {
  const [amount, setAmount] = useState('1000');
  const [rate, setRate] = useState('18');
  const [mode, setMode] = useState<'add' | 'remove'>('add');
  const A = num(amount), R = num(rate);
  const r = A > 0 && R >= 0 && R <= 100 ? gst(A, R, mode) : null;
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="space-y-5 p-5 sm:p-6">
        <Segmented label="Calculation" value={mode} onChange={setMode} options={[{ value: 'add', label: 'Add GST' }, { value: 'remove', label: 'Remove GST' }]} className="w-full" />
        <Input label={mode === 'add' ? 'Amount before GST' : 'Amount including GST'} inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <div>
          <p className="mb-2 text-sm font-medium text-fg">GST rate</p>
          <Chips label="GST rate" options={RATES} value={RATES.includes(R) ? R : null} onChange={(v) => setRate(String(v))} format={(v) => `${v}%`} />
        </div>
        <Input label="Or enter any rate (%)" inputMode="decimal" value={rate} onChange={(e) => setRate(e.target.value)} hint="Works for VAT and sales tax too." />
      </Card>
      <Card className="h-fit p-5 sm:p-6" aria-live="polite">
        {r ? (
          <div className="divide-y divide-line">
            <ResultRow label={mode === 'add' ? 'Total with GST' : 'Amount before GST'} value={money(mode === 'add' ? r.gross : r.net)} strong />
            <ResultRow label={`GST (${R}%)`} value={money(r.tax)} />
            <ResultRow label="CGST (half)" value={money(r.tax / 2)} sub="Within the same state" />
            <ResultRow label="SGST (half)" value={money(r.tax / 2)} sub="Within the same state" />
            <ResultRow label="IGST (full)" value={money(r.tax)} sub="Between states" />
            <ResultRow label={mode === 'add' ? 'Amount before GST' : 'Total with GST'} value={money(mode === 'add' ? r.net : r.gross)} />
          </div>
        ) : <p className="text-sm text-fg-subtle">Enter an amount and a rate.</p>}
      </Card>
    </div>
  );
}
