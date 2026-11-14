import { useEffect, useRef, useState } from 'react';
import { BellOff, Pause, Play, RotateCcw } from 'lucide-react';
import { startAlarm, unlockAudio, type AlarmSound } from '../lib/sound';
import { formatClock } from '../lib/time';
import { useDocumentTitle, useTicker } from '../hooks/useTicker';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Form';
import { Chips } from './shared';
import { Ring, SoundPicker } from './timeShared';

const PRESETS = [1, 3, 5, 10, 15, 20, 30, 45, 60];

export default function Timer() {
  const [h, setH] = useState('0');
  const [m, setM] = useState('5');
  const [s, setS] = useState('0');
  const [sound, setSound] = useState<AlarmSound>('beep');
  const [duration, setDuration] = useState(5 * 60_000);
  const [endAt, setEndAt] = useState<number | null>(null);
  const [pausedLeft, setPausedLeft] = useState<number | null>(null);
  const [ringing, setRinging] = useState(false);
  const stopRef = useRef<(() => void) | null>(null);
  const now = useTicker(endAt !== null, 200);

  const remaining = endAt !== null ? Math.max(0, endAt - now) : pausedLeft ?? duration;
  const running = endAt !== null;

  const inputMs = () => {
    const v = (x: string) => Math.max(0, Math.floor(Number(x) || 0));
    return (v(h) * 3600 + v(m) * 60 + v(s)) * 1000;
  };

  useEffect(() => {
    if (running && remaining <= 0) {
      setEndAt(null);
      setPausedLeft(0);
      setRinging(true);
      stopRef.current = startAlarm(sound);
    }
  }, [running, remaining, sound]);

  useEffect(() => () => stopRef.current?.(), []);
  useDocumentTitle(ringing ? '⏰ Time’s up! – Timer' : running ? `${formatClock(remaining)} – Timer` : null);

  const start = () => {
    unlockAudio();
    const left = pausedLeft && pausedLeft > 0 ? pausedLeft : inputMs();
    if (left <= 0) return;
    if (!pausedLeft) setDuration(left);
    setEndAt(Date.now() + left);
    setPausedLeft(null);
  };
  const pause = () => {
    setPausedLeft(remaining);
    setEndAt(null);
  };
  const reset = () => {
    stopRef.current?.();
    setRinging(false);
    setEndAt(null);
    setPausedLeft(null);
    setDuration(inputMs());
  };
  const stopAlarm = () => {
    stopRef.current?.();
    setRinging(false);
    setPausedLeft(null);
  };
  const preset = (min: number) => {
    stopRef.current?.();
    setRinging(false);
    setH(String(Math.floor(min / 60)));
    setM(String(min % 60));
    setS('0');
    setDuration(min * 60_000);
    setPausedLeft(null);
    setEndAt(null);
  };

  const editing = !running && pausedLeft === null && !ringing;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <Card className="p-6 sm:p-8">
        <Ring progress={duration ? remaining / duration : 0} tone={ringing ? 'warning' : 'accent'}>
          <div className={`text-5xl font-bold tabular-nums tracking-tight text-fg sm:text-6xl ${ringing ? 'animate-pulse text-warning' : ''}`} aria-live="polite" role="timer">
            {ringing ? 'Time’s up!' : formatClock(editing ? inputMs() : remaining)}
          </div>
          {!ringing && <div className="mt-2 text-sm text-fg-subtle">{running ? 'Running' : pausedLeft !== null ? 'Paused' : 'Ready'}</div>}
        </Ring>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {ringing ? (
            <Button size="lg" onClick={stopAlarm} icon={<BellOff className="h-5 w-5" aria-hidden />}>Stop alarm</Button>
          ) : running ? (
            <Button size="lg" variant="secondary" onClick={pause} icon={<Pause className="h-5 w-5" aria-hidden />}>Pause</Button>
          ) : (
            <Button size="lg" onClick={start} disabled={editing && inputMs() <= 0} icon={<Play className="h-5 w-5" aria-hidden />}>{pausedLeft ? 'Resume' : 'Start'}</Button>
          )}
          <Button size="lg" variant="outline" onClick={reset} icon={<RotateCcw className="h-5 w-5" aria-hidden />}>Reset</Button>
        </div>
      </Card>
      <Card className="h-fit space-y-5 p-5">
        <div>
          <p className="mb-2 text-sm font-medium text-fg">Quick timers</p>
          <Chips label="Preset minutes" options={PRESETS} value={null} onChange={preset} format={(v) => (v >= 60 ? `${v / 60} h` : `${v} min`)} />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Input label="Hours" inputMode="numeric" value={h} onChange={(e) => setH(e.target.value)} disabled={!editing} />
          <Input label="Minutes" inputMode="numeric" value={m} onChange={(e) => setM(e.target.value)} disabled={!editing} />
          <Input label="Seconds" inputMode="numeric" value={s} onChange={(e) => setS(e.target.value)} disabled={!editing} />
        </div>
        <SoundPicker value={sound} onChange={setSound} />
        <p className="text-xs text-fg-subtle">Keep this tab open. Some phones pause web pages when the screen locks.</p>
      </Card>
    </div>
  );
}
