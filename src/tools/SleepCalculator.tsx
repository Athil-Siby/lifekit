import { useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { bedtimesFor, wakeTimesFor } from '../lib/misc2';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Form';
import { Segmented } from '../components/ui/Segmented';

const fmt = (d: Date) => d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

export default function SleepCalculator() {
  const [mode, setMode] = useState<'wake' | 'sleep'>('wake');
  const [time, setTime] = useState('07:00');
  const [h, m] = time.split(':').map(Number);
  const base = new Date(); base.setHours(h || 0, m || 0, 0, 0);
  const times = mode === 'wake' ? bedtimesFor(base) : wakeTimesFor(new Date());
  const cycles = mode === 'wake' ? [6, 5, 4] : [4, 5, 6];
  return (
    <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
      <Card className="h-fit space-y-4 p-5">
        <Segmented label="I want to" value={mode} onChange={setMode} options={[{ value: 'wake', label: 'Wake up at…' }, { value: 'sleep', label: 'Sleep now' }]} className="w-full" />
        {mode === 'wake' ? <Input label="Wake-up time" type="time" value={time} onChange={(e) => setTime(e.target.value)} /> : <Button variant="outline" className="w-full" onClick={() => setTime(time)} icon={<Moon className="h-4 w-4" aria-hidden />}>Going to bed now</Button>}
        <p className="text-xs text-fg-subtle">Sleep happens in cycles of about 90 minutes. Waking at the end of a cycle helps you feel fresh. Includes ~15 minutes to fall asleep.</p>
      </Card>
      <Card className="p-5 sm:p-6" aria-live="polite">
        <p className="mb-4 flex items-center gap-2 text-sm font-medium text-fg-muted">{mode === 'wake' ? <><Moon className="h-4 w-4" aria-hidden /> Go to sleep at one of these times</> : <><Sun className="h-4 w-4" aria-hidden /> Set your alarm for one of these times</>}</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {times.map((t, i) => (
            <div key={i} className={`rounded-2xl p-5 text-center ${i === 0 ? 'bg-accent text-accent-fg' : 'bg-surface-2 text-fg'}`}>
              <p className="text-3xl font-bold tabular-nums">{fmt(t)}</p>
              <p className="mt-1 text-sm opacity-80">{cycles[i]} cycles · {(cycles[i] * 1.5).toFixed(1)} h sleep{i === 0 ? ' · best' : ''}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
