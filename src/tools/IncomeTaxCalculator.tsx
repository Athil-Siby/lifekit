import { useState } from 'react';
import { TAX_YEAR, newRegime, oldRegime, type TaxInput, type TaxResult } from '../lib/incomeTax';
import { Card } from '../components/ui/Card';
import { Checkbox, Input, Select } from '../components/ui/Form';
import { Notice } from '../components/ui/Notice';
import { ResultRow, num } from './shared';
import { cn } from '../lib/cn';

const inr = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');

function Col({ title, r, best }: { title: string; r: TaxResult; best: boolean }) {
  return (
    <Card className={cn('p-5', best && 'border-accent ring-2 ring-accent/30')}>
      <div className="mb-2 flex items-center justify-between"><h3 className="font-semibold text-fg">{title}</h3>{best && <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-accent-fg">Saves you more</span>}</div>
      <div className="divide-y divide-line">
        <ResultRow label="Total tax" value={inr(r.total)} strong />
        <ResultRow label="Taxable income" value={inr(r.taxable)} />
        <ResultRow label="Tax on slabs" value={inr(r.slabTax)} />
        <ResultRow label="Rebate (87A)" value={`− ${inr(r.rebate)}`} />
        {r.surcharge > 0 && <ResultRow label="Surcharge" value={inr(r.surcharge)} />}
        <ResultRow label="Health & education cess (4%)" value={inr(r.cess)} />
        <ResultRow label="Monthly tax (÷ 12)" value={inr(r.total / 12)} />
      </div>
    </Card>
  );
}

export default function IncomeTaxCalculator() {
  const [gross, setGross] = useState('1500000');
  const [salaried, setSalaried] = useState(true);
  const [age, setAge] = useState<TaxInput['age']>('below60');
  const [c80, setC80] = useState('150000');
  const [other, setOther] = useState('25000');
  const G = num(gross);
  const input: TaxInput = { grossIncome: G > 0 ? G : 0, salaried, age, deductions80C: num(c80) || 0, otherDeductions: num(other) || 0 };
  const n = newRegime(input), o = oldRegime(input);
  return (
    <div className="space-y-6">
      <Notice tone="info" title={`Rules for ${TAX_YEAR}`}>Based on the slabs from Budget 2025. Tax rules change in every Budget, so always confirm on incometax.gov.in or with a tax professional before filing.</Notice>
      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <Card className="h-fit space-y-4 p-5">
          <Input label="Total yearly income (₹)" inputMode="numeric" value={gross} onChange={(e) => setGross(e.target.value)} hint={G > 0 ? inr(G) : undefined} />
          <Checkbox checked={salaried} onChange={setSalaried} label="I’m salaried or a pensioner" description="Adds the standard deduction (₹75,000 new / ₹50,000 old)." />
          <Select label="Age" value={age} onChange={(e) => setAge(e.target.value as TaxInput['age'])}>
            <option value="below60">Below 60</option><option value="60to80">60 to 79</option><option value="above80">80 or above</option>
          </Select>
          <p className="pt-2 text-sm font-semibold text-fg">Old regime deductions</p>
          <Input label="80C (PPF, ELSS, LIC, EPF…) – max ₹1.5 lakh" inputMode="numeric" value={c80} onChange={(e) => setC80(e.target.value)} />
          <Input label="Other deductions (80D, HRA, home-loan interest…)" inputMode="numeric" value={other} onChange={(e) => setOther(e.target.value)} />
        </Card>
        <div className="grid gap-4 md:grid-cols-2">
          <Col title="New regime" r={n} best={n.total < o.total} />
          <Col title="Old regime" r={o} best={o.total < n.total} />
          <p className="text-sm text-fg-muted md:col-span-2">{n.total === o.total ? 'Both regimes cost the same.' : `The ${n.total < o.total ? 'new' : 'old'} regime saves you ${inr(Math.abs(n.total - o.total))} this year.`}</p>
        </div>
      </div>
    </div>
  );
}
