import { useState } from 'react';
import { ACTIVITY, bmr, calorieTargets, type Sex } from '../lib/health2';
import { ftInToCm, lbToKg } from '../lib/health';
import { Card } from '../components/ui/Card';
import { Input, Select } from '../components/ui/Form';
import { Segmented } from '../components/ui/Segmented';
import { ResultRow, num } from './shared';

export default function CalorieCalculator() {
  const [units, setUnits] = useState<'metric' | 'us'>('metric');
  const [sex, setSex] = useState<Sex>('male');
  const [age, setAge] = useState('25');
  const [weight, setWeight] = useState('70');
  const [height, setHeight] = useState('175');
  const [ft, setFt] = useState('5');
  const [inch, setInch] = useState('9');
  const [act, setAct] = useState<string>('light');
  const kg = units === 'metric' ? num(weight) : lbToKg(num(weight));
  const cm = units === 'metric' ? num(height) : ftInToCm(num(ft), num(inch) || 0);
  const A = num(age);
  const valid = kg > 20 && kg < 400 && cm > 100 && cm < 250 && A >= 15 && A <= 100;
  const b = valid ? bmr(sex, kg, cm, A) : 0;
  const t = valid ? calorieTargets(b, ACTIVITY.find((a) => a.id === act)!.factor) : null;
  const k = (n: number) => `${Math.round(n).toLocaleString()} kcal`;
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="space-y-5 p-5 sm:p-6">
        <div className="grid grid-cols-2 gap-3">
          <Segmented label="Units" value={units} onChange={setUnits} options={[{ value: 'metric', label: 'kg / cm' }, { value: 'us', label: 'lb / ft' }]} className="w-full" />
          <Segmented label="Sex" value={sex} onChange={setSex} options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }]} className="w-full" />
        </div>
        <Input label="Age (15–100)" inputMode="numeric" value={age} onChange={(e) => setAge(e.target.value)} />
        <Input label={`Weight (${units === 'metric' ? 'kg' : 'lb'})`} inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value)} />
        {units === 'metric' ? <Input label="Height (cm)" inputMode="decimal" value={height} onChange={(e) => setHeight(e.target.value)} /> : (
          <div className="grid grid-cols-2 gap-3"><Input label="Height (ft)" inputMode="numeric" value={ft} onChange={(e) => setFt(e.target.value)} /><Input label="(in)" inputMode="numeric" value={inch} onChange={(e) => setInch(e.target.value)} /></div>
        )}
        <Select label="Activity level" value={act} onChange={(e) => setAct(e.target.value)}>
          {ACTIVITY.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
        </Select>
      </Card>
      <Card className="h-fit p-5 sm:p-6" aria-live="polite">
        {t ? (
          <>
            <div className="divide-y divide-line">
              <ResultRow label="To maintain your weight" value={k(t.maintain)} strong sub="per day" />
              <ResultRow label="Mild weight loss (≈0.25 kg/week)" value={k(t.mildLoss)} />
              <ResultRow label="Weight loss (≈0.5 kg/week)" value={k(t.loss)} />
              <ResultRow label="Weight gain" value={k(t.gain)} />
              <ResultRow label="Basal metabolic rate (BMR)" value={k(b)} sub="Calories burned at complete rest" />
            </div>
            <p className="mt-4 text-xs text-fg-subtle">Estimates use the Mifflin–St Jeor equation. Everyone is different – talk to a doctor or dietitian before big changes, and don’t eat below about 1,200 kcal a day without medical advice.</p>
          </>
        ) : <p className="text-sm text-fg-subtle">Fill in your details to see your daily calories.</p>}
      </Card>
    </div>
  );
}
