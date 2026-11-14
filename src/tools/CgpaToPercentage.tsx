import { useState } from 'react';
import { cgpaToPercent, percentToCgpa } from '../lib/health2';
import { Card } from '../components/ui/Card';
import { Input, Select } from '../components/ui/Form';
import { Segmented } from '../components/ui/Segmented';
import { ResultRow, num } from './shared';

const FORMULAS = [
  { id: 'cbse', label: 'CBSE / most universities: CGPA × 9.5', m: 9.5, s: 0, max: 10 },
  { id: 'x10', label: 'CGPA × 10', m: 10, s: 0, max: 10 },
  { id: 'vtu', label: 'VTU / AICTE: (CGPA − 0.75) × 10', m: 10, s: 7.5, max: 10 },
  { id: 'mu', label: 'Mumbai University: CGPA × 7.1 + 11', m: 7.1, s: -11, max: 10 },
  { id: 'us', label: '4-point GPA: GPA × 25', m: 25, s: 0, max: 4 },
];

export default function CgpaToPercentage() {
  const [dir, setDir] = useState<'to' | 'from'>('to');
  const [value, setValue] = useState('8.2');
  const [fid, setFid] = useState('cbse');
  const f = FORMULAS.find((x) => x.id === fid)!;
  const v = num(value);
  const validTo = v >= 0 && v <= f.max;
  const validFrom = v >= 0 && v <= 100;
  const result = dir === 'to' ? (validTo ? Math.min(100, Math.max(0, cgpaToPercent(v, f.m, f.s))) : null) : validFrom ? Math.min(f.max, Math.max(0, percentToCgpa(v, f.m, f.s))) : null;
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="space-y-5 p-5 sm:p-6">
        <Segmented label="Convert" value={dir} onChange={(d) => { setDir(d); setValue(d === 'to' ? '8.2' : '78'); }} options={[{ value: 'to', label: 'CGPA → %' }, { value: 'from', label: '% → CGPA' }]} className="w-full" />
        <Input label={dir === 'to' ? `Your CGPA (out of ${f.max})` : 'Your percentage'} inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value)} error={value && !(dir === 'to' ? validTo : validFrom) ? `Enter 0 to ${dir === 'to' ? f.max : 100}.` : null} />
        <Select label="Formula" value={fid} onChange={(e) => setFid(e.target.value)} hint="Check your university’s official formula, it can differ.">
          {FORMULAS.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}
        </Select>
      </Card>
      <Card className="h-fit p-5 sm:p-6" aria-live="polite">
        {result !== null ? (
          <div className="divide-y divide-line">
            <ResultRow label={dir === 'to' ? 'Percentage' : 'CGPA'} value={dir === 'to' ? `${result.toFixed(2)}%` : result.toFixed(2)} strong />
            <ResultRow label="Formula used" value={<span className="text-sm font-normal">{f.label.split(': ')[1] ?? f.label}</span>} />
          </div>
        ) : <p className="text-sm text-fg-subtle">Enter a value to convert.</p>}
      </Card>
    </div>
  );
}
