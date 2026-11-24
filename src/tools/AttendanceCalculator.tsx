import { useState } from 'react';
import { attendancePlan } from '../lib/student';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Form';
import { Chips, num } from './shared';
import { cn } from '../lib/cn';

export default function AttendanceCalculator() {
  const [attended, setAttended] = useState('42');
  const [total, setTotal] = useState('50');
  const [target, setTarget] = useState('75');
  const A = num(attended), T = num(total), P = num(target);
  let r: ReturnType<typeof attendancePlan> | null = null, err: string | null = null;
  try { if (A >= 0 && T > 0 && P > 0 && P <= 100) r = attendancePlan(Math.round(A), Math.round(T), P); } catch (e) { err = e instanceof Error ? e.message : 'Check your numbers.'; }
  const ok = r && r.current >= P;
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="space-y-5 p-5 sm:p-6">
        <Input label="Classes attended" inputMode="numeric" value={attended} onChange={(e) => setAttended(e.target.value)} />
        <Input label="Total classes held" inputMode="numeric" value={total} onChange={(e) => setTotal(e.target.value)} error={err} />
        <div>
          <p className="mb-2 text-sm font-medium text-fg">Required attendance</p>
          <Chips label="Required attendance" options={[60, 65, 70, 75, 80, 85]} value={[60, 65, 70, 75, 80, 85].includes(P) ? P : null} onChange={(v) => setTarget(String(v))} format={(v) => `${v}%`} />
        </div>
        <Input label="Or type any percentage" inputMode="decimal" value={target} onChange={(e) => setTarget(e.target.value)} />
      </Card>
      <Card className={cn('h-fit p-6 text-center', r && (ok ? 'border-success/40' : 'border-danger/40'))} aria-live="polite">
        {r ? (
          <>
            <p className="text-sm text-fg-muted">Your attendance</p>
            <p className={cn('text-6xl font-bold tabular-nums', ok ? 'text-success' : 'text-danger')}>{r.current.toFixed(1)}%</p>
            <div className="mx-auto mt-4 h-3 max-w-sm overflow-hidden rounded-full bg-surface-3" aria-hidden>
              <div className={cn('h-full rounded-full', ok ? 'bg-success' : 'bg-danger')} style={{ width: `${Math.min(100, r.current)}%` }} />
            </div>
            <p className="mt-6 text-xl font-semibold text-fg">
              {ok ? (r.canMiss > 0 ? <>You can skip <span className="text-accent-text">{r.canMiss}</span> more class{r.canMiss === 1 ? '' : 'es'} 😎</> : 'You’re right on the edge – don’t skip the next class!') : Number.isFinite(r.mustAttend) ? <>Attend the next <span className="text-accent-text">{r.mustAttend}</span> class{r.mustAttend === 1 ? '' : 'es'} in a row</> : 'You can’t reach 100% after missing a class.'}
            </p>
            <p className="mt-2 text-sm text-fg-muted">{ok ? `and still stay at or above ${P}%.` : `to get back to ${P}%.`}</p>
          </>
        ) : <p className="text-sm text-fg-subtle">Enter your attendance to see how many classes you can miss.</p>}
      </Card>
    </div>
  );
}
