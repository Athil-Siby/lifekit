import { useState } from 'react';
import { bmi, bmiCategory, ftInToCm, healthyRange, kgToLb, lbToKg } from '../lib/health';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Form';
import { Segmented } from '../components/ui/Segmented';
import { Notice } from '../components/ui/Notice';
import { num } from './shared';
import { cn } from '../lib/cn';

const BANDS = [
  { label: 'Underweight', from: 15, to: 18.5, cls: 'bg-sky-400' },
  { label: 'Healthy', from: 18.5, to: 25, cls: 'bg-emerald-500' },
  { label: 'Overweight', from: 25, to: 30, cls: 'bg-amber-400' },
  { label: 'Obesity', from: 30, to: 40, cls: 'bg-rose-500' },
];

export default function BmiCalculator() {
  const [units, setUnits] = useState<'metric' | 'imperial'>('metric');
  const [cm, setCm] = useState('175');
  const [kg, setKg] = useState('70');
  const [ft, setFt] = useState('5');
  const [inch, setInch] = useState('9');
  const [lb, setLb] = useState('154');

  const heightCm = units === 'metric' ? num(cm) : ftInToCm(num(ft) || 0, num(inch) || 0);
  const weightKg = units === 'metric' ? num(kg) : lbToKg(num(lb));
  const valid = heightCm >= 50 && heightCm <= 272 && weightKg >= 10 && weightKg <= 500;
  const value = valid ? bmi(weightKg, heightCm) : NaN;
  const cat = valid ? bmiCategory(value) : null;
  const [lo, hi] = valid ? healthyRange(heightCm) : [0, 0];
  const pos = valid ? Math.min(100, Math.max(0, ((value - 15) / 25) * 100)) : 0;
  const fmtW = (k: number) => (units === 'metric' ? `${k.toFixed(1)} kg` : `${kgToLb(k).toFixed(0)} lb`);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="space-y-5 p-5 sm:p-6">
        <Segmented label="Units" value={units} onChange={setUnits} options={[{ value: 'metric', label: 'Metric (cm, kg)' }, { value: 'imperial', label: 'Imperial (ft, lb)' }]} />
        {units === 'metric' ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Height (cm)" inputMode="decimal" value={cm} onChange={(e) => setCm(e.target.value)} />
            <Input label="Weight (kg)" inputMode="decimal" value={kg} onChange={(e) => setKg(e.target.value)} />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            <Input label="Height (ft)" inputMode="numeric" value={ft} onChange={(e) => setFt(e.target.value)} />
            <Input label="(in)" inputMode="decimal" value={inch} onChange={(e) => setInch(e.target.value)} />
            <Input label="Weight (lb)" inputMode="decimal" value={lb} onChange={(e) => setLb(e.target.value)} />
          </div>
        )}
        {!valid && <p className="text-sm text-danger">Enter a realistic height and weight.</p>}
      </Card>
      <Card className="h-fit p-5 sm:p-6" aria-live="polite">
        {valid && cat ? (
          <>
            <p className="text-sm text-fg-muted">Your BMI</p>
            <p className="mt-1 text-5xl font-bold tabular-nums text-fg">{value.toFixed(1)}</p>
            <p className={cn('mt-1 text-lg font-semibold', cat === 'Healthy weight' ? 'text-success' : cat === 'Obesity' ? 'text-danger' : 'text-warning')}>{cat}</p>
            <div className="mt-6">
              <div className="relative flex h-3 overflow-hidden rounded-full">
                {BANDS.map((b) => (
                  <div key={b.label} className={b.cls} style={{ width: `${((b.to - b.from) / 25) * 100}%` }} />
                ))}
              </div>
              <div className="relative h-4">
                <div className="absolute -top-1 h-5 w-1 -translate-x-1/2 rounded bg-fg" style={{ left: `${pos}%` }} aria-hidden />
              </div>
              <div className="mt-1 flex justify-between text-[11px] text-fg-subtle tabular-nums">
                <span>15</span><span>18.5</span><span>25</span><span>30</span><span>40</span>
              </div>
            </div>
            <p className="mt-5 text-sm text-fg-muted">
              Healthy weight for your height: <strong className="text-fg">{fmtW(lo)} – {fmtW(hi)}</strong>
            </p>
          </>
        ) : (
          <p className="text-sm text-fg-subtle">Enter your height and weight to see your BMI.</p>
        )}
        <Notice tone="info" className="mt-5">BMI is a rough guide for adults. It doesn’t account for muscle, age or body shape and isn’t a diagnosis.</Notice>
      </Card>
    </div>
  );
}
