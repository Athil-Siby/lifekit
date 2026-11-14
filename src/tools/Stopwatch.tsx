import { useState } from 'react';
import { Flag, Pause, Play, RotateCcw } from 'lucide-react';
import { formatClock } from '../lib/time';
import { useDocumentTitle, useTicker } from '../hooks/useTicker';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/Misc';
import { cn } from '../lib/cn';

export default function Stopwatch() {
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [base, setBase] = useState(0); // time accumulated before the current run
  const [laps, setLaps] = useState<number[]>([]); // total elapsed at each lap
  const running = startedAt !== null;
  const now = useTicker(running, 33);
  const elapsed = base + (running ? now - startedAt : 0);
  useDocumentTitle(running ? `${formatClock(elapsed)} – Stopwatch` : null);

  const lapTimes = laps.map((t, i) => t - (laps[i - 1] ?? 0));
  const fastest = lapTimes.length >= 2 ? Math.min(...lapTimes) : -1;
  const slowest = lapTimes.length >= 2 ? Math.max(...lapTimes) : -1;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <Card className="flex flex-col items-center p-6 sm:p-10">
        <div className="text-6xl font-bold tabular-nums tracking-tight text-fg sm:text-7xl" role="timer" aria-live="off">
          {formatClock(elapsed, { centis: true })}
        </div>
        {laps.length > 0 && (
          <div className="mt-2 text-lg tabular-nums text-fg-muted">Lap {laps.length + 1}: {formatClock(elapsed - laps[laps.length - 1], { centis: true })}</div>
        )}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {running ? (
            <Button size="lg" variant="secondary" onClick={() => { setBase(elapsed); setStartedAt(null); }} icon={<Pause className="h-5 w-5" aria-hidden />}>Pause</Button>
          ) : (
            <Button size="lg" onClick={() => setStartedAt(Date.now())} icon={<Play className="h-5 w-5" aria-hidden />}>{elapsed > 0 ? 'Resume' : 'Start'}</Button>
          )}
          <Button size="lg" variant="outline" onClick={() => setLaps((l) => [...l, elapsed])} disabled={!running} icon={<Flag className="h-5 w-5" aria-hidden />}>Lap</Button>
          <Button size="lg" variant="outline" onClick={() => { setStartedAt(null); setBase(0); setLaps([]); }} disabled={elapsed === 0} icon={<RotateCcw className="h-5 w-5" aria-hidden />}>Reset</Button>
        </div>
      </Card>
      <Card className="h-fit overflow-hidden">
        <h2 className="border-b border-line px-5 py-3.5 text-sm font-semibold text-fg">Laps</h2>
        {laps.length === 0 ? (
          <div className="p-4"><EmptyState icon={<Flag className="h-6 w-6" />} title="No laps yet">Press Lap while the stopwatch runs.</EmptyState></div>
        ) : (
          <ol className="max-h-96 divide-y divide-line overflow-y-auto">
            {[...lapTimes].map((lt, i) => ({ lt, i })).reverse().map(({ lt, i }) => (
              <li key={i} className={cn('flex items-center justify-between px-5 py-2.5 text-sm tabular-nums', lt === fastest && 'text-success', lt === slowest && 'text-danger')}>
                <span className="text-fg-muted">Lap {i + 1}{lt === fastest ? ' · fastest' : lt === slowest ? ' · slowest' : ''}</span>
                <span className="font-semibold">{formatClock(lt, { centis: true })}</span>
                <span className="text-fg-subtle">{formatClock(laps[i], { centis: true })}</span>
              </li>
            ))}
          </ol>
        )}
      </Card>
    </div>
  );
}
