import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { tip } from '../lib/finance';
import { Card } from '../components/ui/Card';
import { Checkbox, Input, Label } from '../components/ui/Form';
import { Button } from '../components/ui/Button';
import { Chips, ResultRow, money, num } from './shared';

export default function TipCalculator() {
  const [bill, setBill] = useState('64.50');
  const [pct, setPct] = useState('15');
  const [people, setPeople] = useState(2);
  const [round, setRound] = useState(false);
  const b = num(bill);
  const p = num(pct);
  const valid = !Number.isNaN(b) && b >= 0 && !Number.isNaN(p) && p >= 0 && p <= 100;
  const r = valid ? tip(b, p, people, round) : null;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="space-y-5 p-5 sm:p-6">
        <Input label="Bill amount" inputMode="decimal" value={bill} onChange={(e) => setBill(e.target.value)} error={bill && (Number.isNaN(b) || b < 0) ? 'Enter a valid amount.' : null} />
        <div>
          <Input label="Tip (%)" inputMode="decimal" value={pct} onChange={(e) => setPct(e.target.value)} error={pct && (Number.isNaN(p) || p < 0 || p > 100) ? 'Enter 0 to 100.' : null} />
          <div className="mt-2.5">
            <Chips label="Common tips" options={[0, 10, 12, 15, 18, 20, 25]} value={Number.isNaN(p) ? null : p} onChange={(v) => setPct(String(v))} format={(v) => `${v}%`} />
          </div>
        </div>
        <div>
          <Label>Split between</Label>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" className="h-11 w-11" onClick={() => setPeople((n) => Math.max(1, n - 1))} aria-label="Fewer people" icon={<Minus className="h-4 w-4" />} />
            <span className="min-w-[5rem] text-center text-xl font-semibold tabular-nums text-fg" aria-live="polite">
              {people} {people === 1 ? 'person' : 'people'}
            </span>
            <Button variant="outline" size="icon" className="h-11 w-11" onClick={() => setPeople((n) => Math.min(100, n + 1))} aria-label="More people" icon={<Plus className="h-4 w-4" />} />
          </div>
        </div>
        <Checkbox checked={round} onChange={setRound} label="Round up each person’s share" description="Easier to pay; the extra goes to the tip" />
      </Card>
      <Card className="h-fit p-5 sm:p-6" aria-live="polite">
        {r ? (
          <div className="divide-y divide-line">
            {people > 1 && <ResultRow label="Each person pays" value={money(r.perPerson)} strong />}
            <ResultRow label="Total with tip" value={money(r.total)} strong={people === 1} />
            <ResultRow label="Tip" value={money(r.tip)} sub={round && b ? `${((r.tip / b) * 100).toFixed(1)}% after rounding` : undefined} />
            {people > 1 && <ResultRow label="Tip per person" value={money(r.tipPerPerson)} />}
          </div>
        ) : (
          <p className="text-sm text-fg-subtle">Enter the bill and tip to see the totals.</p>
        )}
      </Card>
    </div>
  );
}
