import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { gradeFor, marksPercent } from '../lib/student';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ResultRow, num } from './shared';

interface Row { id: number; name: string; scored: string; max: string }
let nid = 10;

export default function MarksPercentage() {
  const [rows, setRows] = useState<Row[]>([
    { id: 1, name: 'English', scored: '86', max: '100' }, { id: 2, name: 'Maths', scored: '92', max: '100' },
    { id: 3, name: 'Science', scored: '78', max: '100' }, { id: 4, name: 'Social Science', scored: '81', max: '100' }, { id: 5, name: 'Hindi', scored: '88', max: '100' },
  ]);
  const upd = (id: number, k: keyof Row, v: string) => setRows((rs) => rs.map((r) => (r.id === id ? { ...r, [k]: v } : r)));
  const r = marksPercent(rows.map((x) => ({ scored: num(x.scored), max: num(x.max) })));
  const inp = 'h-10 w-full rounded-lg border border-line bg-surface px-2.5 text-sm text-fg focus:border-accent focus:outline-none';
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <Card className="space-y-2 p-4 sm:p-5">
        <div className="grid grid-cols-[1fr_80px_80px_36px] gap-2 px-1 text-xs font-medium text-fg-subtle"><span>Subject</span><span>Marks</span><span>Out of</span><span /></div>
        {rows.map((x) => (
          <div key={x.id} className="grid grid-cols-[1fr_80px_80px_36px] items-center gap-2">
            <input className={inp} value={x.name} onChange={(e) => upd(x.id, 'name', e.target.value)} aria-label="Subject" placeholder="Subject" />
            <input className={inp} inputMode="decimal" value={x.scored} onChange={(e) => upd(x.id, 'scored', e.target.value)} aria-label={`Marks in ${x.name}`} />
            <input className={inp} inputMode="decimal" value={x.max} onChange={(e) => upd(x.id, 'max', e.target.value)} aria-label={`Maximum marks in ${x.name}`} />
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setRows((rs) => rs.filter((y) => y.id !== x.id))} aria-label={`Remove ${x.name}`} icon={<X className="h-4 w-4" />} />
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => setRows((rs) => [...rs, { id: nid++, name: '', scored: '', max: '100' }])} icon={<Plus className="h-4 w-4" aria-hidden />}>Add subject</Button>
      </Card>
      <Card className="h-fit p-5" aria-live="polite">
        <div className="divide-y divide-line">
          <ResultRow label="Percentage" value={`${r.percent.toFixed(2)}%`} strong />
          <ResultRow label="Total marks" value={`${r.scored} / ${r.max}`} />
          <ResultRow label="Grade (CBSE-style)" value={gradeFor(r.percent)} />
          <ResultRow label="Equivalent CGPA (÷ 9.5)" value={(r.percent / 9.5).toFixed(2)} />
        </div>
      </Card>
    </div>
  );
}
