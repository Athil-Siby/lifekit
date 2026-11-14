import { useEffect, useRef, useState } from 'react';
import { Pause, Play, RotateCcw, SkipForward } from 'lucide-react';
import { startAlarm, unlockAudio, type AlarmSound } from '../lib/sound';
import { formatClock } from '../lib/time';
import { useDocumentTitle, useTicker } from '../hooks/useTicker';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Checkbox, Input } from '../components/ui/Form';
import { Ring, SoundPicker } from './timeShared';
import { cn } from '../lib/cn';

type Phase = 'focus' | 'short' | 'long';
const PHASE_LABEL: Record<Phase, string> = { focus: 'Focus', short: 'Short break', long: 'Long break' };

export default function PomodoroTimer() {
  const [mins, setMins] = useState({ focus: '25', short: '5', long: '15' });
  const [every, setEvery] = useState('4');
  const [auto, setAuto] = useState(true);
  const [sound, setSound] = useState<AlarmSound>('chime');
  const [phase, setPhase] = useState<Phase>('focus');
  const [done, setDone] = useState(0);
  const [endAt, setEndAt] = useState<number | null>(null);
  const [pausedLeft, setPausedLeft] = useState<number | null>(null);
  const stopRef = useRef<(() => void) | null>(null);
  const running = endAt !== null;
  const now = useTicker(running, 250);
  const len = (p: Phase) => Math.max(1, Math.min(180, Number(mins[p]) || 1)) * 60_000;
  const duration = len(phase);
  const remaining = running ? Math.max(0, endAt - now) : pausedLeft ?? duration;

  const nextPhase = (completedFocus: boolean): Phase => {
    if (phase !== 'focus') return 'focus';
    const n = done + (completedFocus ? 1 : 0);
    return n > 0 && n % Math.max(1, Number(every) || 4) === 0 ? 'long' : 'short';
  };

  const goTo = (p: Phase, startNow: boolean) => {
    setPhase(p);
    setPausedLeft(null);
    setEndAt(startNow ? Date.now() + len(p) : null);
  };

  useEffect(() => {
    if (running && remaining <= 0) {
      stopRef.current = startAlarm(sound, 0.7, 5);
      const wasFocus = phase === 'focus';
      if (wasFocus) setDone((d) => d + 1);
      goTo(nextPhase(wasFocus), auto);
    }
  }, [running, remaining]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => stopRef.current?.(), []);
  useDocumentTitle(running ? `${formatClock(remaining)} · ${PHASE_LABEL[phase]}` : null);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <Card className="p-6 sm:p-8">
        <div className="mb-6 flex justify-center gap-2" role="tablist" aria-label="Session type">
          {(['focus', 'short', 'long'] as Phase[]).map((p) => (
            <button key={p} role="tab" aria-selected={phase === p} type="button" onClick={() => goTo(p, false)} className={cn('rounded-full px-4 py-1.5 text-sm font-medium', phase === p ? 'bg-fg text-bg' : 'text-fg-muted hover:text-fg')}>
              {PHASE_LABEL[p]}
            </button>
          ))}
        </div>
        <Ring progress={remaining / duration} tone={phase === 'focus' ? 'accent' : 'success'}>
          <div className="text-6xl font-bold tabular-nums tracking-tight text-fg" role="timer">{formatClock(remaining)}</div>
          <div className="mt-2 text-sm text-fg-subtle">{PHASE_LABEL[phase]}</div>
        </Ring>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {running ? (
            <Button size="lg" variant="secondary" onClick={() => { setPausedLeft(remaining); setEndAt(null); }} icon={<Pause className="h-5 w-5" aria-hidden />}>Pause</Button>
          ) : (
            <Button size="lg" onClick={() => { unlockAudio(); stopRef.current?.(); setEndAt(Date.now() + remaining); setPausedLeft(null); }} icon={<Play className="h-5 w-5" aria-hidden />}>{pausedLeft !== null ? 'Resume' : 'Start'}</Button>
          )}
          <Button size="lg" variant="outline" onClick={() => goTo(nextPhase(false), running)} icon={<SkipForward className="h-5 w-5" aria-hidden />}>Skip</Button>
          <Button size="lg" variant="outline" onClick={() => { stopRef.current?.(); setDone(0); goTo('focus', false); }} icon={<RotateCcw className="h-5 w-5" aria-hidden />}>Reset</Button>
        </div>
        <p className="mt-6 text-center text-sm text-fg-muted" aria-live="polite">
          {done === 0 ? 'No focus sessions completed yet' : `${done} focus session${done === 1 ? '' : 's'} completed 🎉`}
        </p>
      </Card>
      <Card className="h-fit space-y-4 p-5">
        <h2 className="text-sm font-semibold text-fg">Settings (minutes)</h2>
        <div className="grid grid-cols-3 gap-2">
          <Input label="Focus" inputMode="numeric" value={mins.focus} onChange={(e) => setMins((m) => ({ ...m, focus: e.target.value }))} disabled={running} />
          <Input label="Short" inputMode="numeric" value={mins.short} onChange={(e) => setMins((m) => ({ ...m, short: e.target.value }))} disabled={running} />
          <Input label="Long" inputMode="numeric" value={mins.long} onChange={(e) => setMins((m) => ({ ...m, long: e.target.value }))} disabled={running} />
        </div>
        <Input label="Long break after every … focus sessions" inputMode="numeric" value={every} onChange={(e) => setEvery(e.target.value)} />
        <Checkbox checked={auto} onChange={setAuto} label="Start the next session automatically" />
        <SoundPicker value={sound} onChange={setSound} />
      </Card>
    </div>
  );
}
