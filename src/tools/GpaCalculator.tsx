import { useRef, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { LETTER_POINTS, weightedGpa } from '../lib/gpa';
import { Card } from '../components/ui/Card';
import { Input, Select } from '../components/ui/Form';
import { Button } from '../components/ui/Button';
import { Segmented } from '../components/ui/Segmented';
import { num } from './shared';

interface Row { id: number; name: string; credits: string; grade: string }

export default function GpaCalculator() {
  const id = useRef(4);
  const [mode, setMode] = useState<'letter' | 'points'>('letter');
  const [rows, setRows] = useState<Row[]>([
    { id: 1, name: 'Mathematics', credits: '4', grade: 'A-' },
    { id: 2, name: 'English', credits: '3', grade: 'B+' },
    { id: 3, name: 'Biology', credits: '3', grade: 'A' },
  ]);
  const [prevGpa, setPrevGpa] = useState('');
  const [prevCredits, setPrevCredits] = useState('');

  const update = (rid: number, patch: Partial<Row>) => setRows((rs) => rs.map((r) => (r.id === rid ? { ...r, ...patch } : r)));
  const courses = rows.map((r) => ({ credits: num(r.credits), points: mode === 'letter' ? LETTER_POINTS[r.grade] : num(r.grade) }));
  const sem = weightedGpa(courses);
  const pg = num(prevGpa);
  const pc = num(prevCredits);
  const cum = pg >= 0 && pc > 0 ? weightedGpa(courses, { gpa: pg, credits: pc }) : null;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <Card className="p-4 sm:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-fg">Courses</h2>
          <Segmented
            size="sm"
            label="Grade type"
            value={mode}
            onChange={(m) => {
              setMode(m);
              setRows((rs) => rs.map((r) => ({ ...r, grade: m === 'letter' ? 'A' : String(LETTER_POINTS[r.grade] ?? 4) })));
            }}
            options={[{ value: 'letter', label: 'Letter grades' }, { value: 'points', label: 'Grade points' }]}
          />
        </div>
        <div className="space-y-3">
          {rows.map((r, i) => (
            <div key={r.id} className="grid grid-cols-[1fr_5rem_6.5rem_auto] items-end gap-2 sm:gap-3">
              <Input label={i === 0 ? 'Course (optional)' : undefined} aria-label="Course name" value={r.name} onChange={(e) => update(r.id, { name: e.target.value })} placeholder={`Course ${i + 1}`} />
              <Input label={i === 0 ? 'Credits' : undefined} aria-label="Credits" inputMode="decimal" value={r.credits} onChange={(e) => update(r.id, { credits: e.target.value })} />
              {mode === 'letter' ? (
                <Select label={i === 0 ? 'Grade' : undefined} aria-label="Grade" value={r.grade} onChange={(e) => update(r.id, { grade: e.target.value })}>
                  {Object.keys(LETTER_POINTS).map((g) => <option key={g} value={g}>{g}</option>)}
                </Select>
              ) : (
                <Input label={i === 0 ? 'Points' : undefined} aria-label="Grade points" inputMode="decimal" value={r.grade} onChange={(e) => update(r.id, { grade: e.target.value })} />
              )}
              <Button variant="ghost" size="icon" className="mb-1" onClick={() => setRows((rs) => rs.filter((x) => x.id !== r.id))} disabled={rows.length === 1} aria-label={`Remove ${r.name || `course ${i + 1}`}`} icon={<X className="h-4 w-4" />} />
            </div>
          ))}
        </div>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => setRows((rs) => [...rs, { id: id.current++, name: '', credits: '3', grade: mode === 'letter' ? 'A' : '4' }])} icon={<Plus className="h-4 w-4" aria-hidden />}>
          Add course
        </Button>
        <div className="mt-6 grid gap-3 border-t border-line pt-5 sm:grid-cols-2">
          <Input label="Previous GPA (optional)" inputMode="decimal" value={prevGpa} onChange={(e) => setPrevGpa(e.target.value)} placeholder="e.g. 3.4" />
          <Input label="Previous credits (optional)" inputMode="decimal" value={prevCredits} onChange={(e) => setPrevCredits(e.target.value)} placeholder="e.g. 30" />
        </div>
      </Card>
      <div className="space-y-3 lg:sticky lg:top-24 lg:h-fit" aria-live="polite">
        <Card className="p-5">
          <p className="text-sm text-fg-muted">Semester GPA</p>
          <p className="mt-1 text-5xl font-bold tabular-nums text-accent-text">{Number.isFinite(sem.gpa) ? sem.gpa.toFixed(2) : '—'}</p>
          <p className="mt-1 text-sm text-fg-subtle">{sem.credits} credits</p>
        </Card>
        {cum && (
          <Card className="p-5">
            <p className="text-sm text-fg-muted">Cumulative GPA</p>
            <p className="mt-1 text-4xl font-bold tabular-nums text-fg">{cum.gpa.toFixed(2)}</p>
            <p className="mt-1 text-sm text-fg-subtle">{cum.credits} total credits</p>
          </Card>
        )}
        <p className="px-1 text-xs text-fg-subtle">Letter grades use the common US 4.0 scale. Check your school’s scale if it differs.</p>
      </div>
    </div>
  );
}
