import { useState } from 'react';
import { discount } from '../lib/finance';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Form';
import { Chips, ResultRow, money, num } from './shared';

export default function DiscountCalculator() {
  const [price, setPrice] = useState('80');
  const [pct, setPct] = useState('25');
  const [extra, setExtra] = useState('');
  const [tax, setTax] = useState('');
  const p = num(price);
  const d = num(pct);
  const e = extra.trim() ? num(extra) : 0;
  const t = tax.trim() ? num(tax) : 0;
  const bad = (v: number, max = 100) => Number.isNaN(v) || v < 0 || v > max;
  const valid = !Number.isNaN(p) && p >= 0 && !bad(d) && !bad(e) && !bad(t, 1000);
  const r = valid ? discount(p, d, e, t) : null;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="space-y-5 p-5 sm:p-6">
        <Input label="Original price" inputMode="decimal" value={price} onChange={(ev) => setPrice(ev.target.value)} error={price && (Number.isNaN(p) || p < 0) ? 'Enter a valid price.' : null} />
        <div>
          <Input label="Discount (%)" inputMode="decimal" value={pct} onChange={(ev) => setPct(ev.target.value)} error={pct && bad(d) ? 'Enter a percentage from 0 to 100.' : null} />
          <div className="mt-2.5">
            <Chips label="Common discounts" options={[10, 15, 20, 25, 30, 40, 50, 70]} value={Number.isNaN(d) ? null : d} onChange={(v) => setPct(String(v))} format={(v) => `${v}%`} />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Extra discount (%)" inputMode="decimal" placeholder="Optional" value={extra} onChange={(ev) => setExtra(ev.target.value)} error={extra && bad(e) ? '0 to 100' : null} hint="Applied after the first discount" />
          <Input label="Sales tax (%)" inputMode="decimal" placeholder="Optional" value={tax} onChange={(ev) => setTax(ev.target.value)} error={tax && bad(t, 1000) ? 'Enter a valid rate' : null} />
        </div>
      </Card>
      <Card className="h-fit p-5 sm:p-6" aria-live="polite">
        {r ? (
          <div className="divide-y divide-line">
            <ResultRow label="You pay" value={money(r.final)} strong />
            <ResultRow label="You save" value={<span className="text-success">{money(r.saved)}</span>} />
            <ResultRow label="Total discount" value={`${r.effectivePct.toFixed(r.effectivePct % 1 ? 1 : 0)}%`} sub={e ? 'Both discounts combined' : undefined} />
            {t > 0 && <ResultRow label="Tax" value={money(r.tax)} />}
            <ResultRow label="Original price" value={money(p)} />
          </div>
        ) : (
          <p className="text-sm text-fg-subtle">Enter a price and discount to see the sale price.</p>
        )}
      </Card>
    </div>
  );
}
