import { useEffect, useRef, useState } from 'react';
import { AlarmClock as AlarmIcon, BellOff, BellRing, Plus, Trash2, Volume2 } from 'lucide-react';
import { startAlarm, unlockAudio, type AlarmSound } from '../lib/sound';
import { msUntil } from '../lib/time';
import { readStorage, writeStorage } from '../lib/storage';
import { useDocumentTitle, useTicker } from '../hooks/useTicker';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Form';
import { EmptyState } from '../components/ui/Misc';
import { Notice } from '../components/ui/Notice';
import { SoundPicker } from './timeShared';
import { cn } from '../lib/cn';

interface Alarm { id: number; time: string; label: string; sound: AlarmSound; on: boolean }

const untilText = (ms: number) => {
  const total = Math.max(1, Math.ceil(ms / 60_000));
  const h = Math.floor(total / 60);
  const m = total % 60;
  return h ? `${h} h ${m} min` : `${m} min`;
};

const hhmm = (d: Date) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

export default function AlarmClock() {
  const [alarms, setAlarms] = useState<Alarm[]>(() => readStorage<Alarm[]>('alarms', []));
  const [time, setTime] = useState(() => hhmm(new Date(Date.now() + 10 * 60_000)));
  const [label, setLabel] = useState('');
  const [sound, setSound] = useState<AlarmSound>('digital');
  const [ringing, setRinging] = useState<Alarm | null>(null);
  const [snoozeUntil, setSnoozeUntil] = useState<{ alarm: Alarm; at: number } | null>(null);
  const [soundReady, setSoundReady] = useState(false);
  const firedRef = useRef<string>('');
  const stopRef = useRef<(() => void) | null>(null);
  const now = useTicker(true, 1000);
  const date = new Date(now);

  useEffect(() => writeStorage('alarms', alarms), [alarms]);
  useEffect(() => () => stopRef.current?.(), []);

  // Check alarms once per tick.
  useEffect(() => {
    if (ringing) return;
    const key = hhmm(date);
    const due = alarms.find((a) => a.on && a.time === key);
    if (due && firedRef.current !== `${due.id}@${key}`) {
      firedRef.current = `${due.id}@${key}`;
      setRinging(due);
      stopRef.current = startAlarm(due.sound, 0.7, 300);
    } else if (snoozeUntil && now >= snoozeUntil.at) {
      setRinging(snoozeUntil.alarm);
      setSnoozeUntil(null);
      stopRef.current = startAlarm(snoozeUntil.alarm.sound, 0.7, 300);
    }
  }, [now]); // eslint-disable-line react-hooks/exhaustive-deps

  useDocumentTitle(ringing ? `⏰ ${ringing.label || 'Alarm'}!` : null);

  const add = () => {
    unlockAudio();
    setSoundReady(true);
    setAlarms((a) => [...a, { id: Date.now(), time, label: label.trim(), sound, on: true }].sort((x, y) => x.time.localeCompare(y.time)));
    setLabel('');
  };
  const stop = () => {
    stopRef.current?.();
    setRinging(null);
  };
  const snooze = () => {
    if (ringing) setSnoozeUntil({ alarm: ringing, at: Date.now() + 5 * 60_000 });
    stop();
  };

  const next = alarms.filter((a) => a.on).map((a) => ({ a, ms: msUntil(a.time, date) })).sort((x, y) => x.ms - y.ms)[0];

  return (
    <div className="space-y-5">
      {ringing && (
        <div className="animate-fade-up flex flex-col items-center gap-4 rounded-2xl border border-warning/40 bg-warning-soft p-6 text-center sm:flex-row sm:text-left" role="alert">
          <BellRing className="h-10 w-10 shrink-0 animate-pulse text-warning" aria-hidden />
          <div className="flex-1">
            <p className="text-2xl font-bold text-fg">{ringing.label || 'Alarm'}</p>
            <p className="text-fg-muted">{ringing.time}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="lg" onClick={snooze}>Snooze 5 min</Button>
            <Button size="lg" onClick={stop} icon={<BellOff className="h-5 w-5" aria-hidden />}>Stop</Button>
          </div>
        </div>
      )}
      {alarms.some((a) => a.on) && !soundReady && !ringing && (
        <Notice tone="warning" title="Tap to enable alarm sound">
          Browsers block sound until you interact with the page.{' '}
          <button type="button" className="font-semibold text-accent-text underline" onClick={() => { unlockAudio(); setSoundReady(true); }}>
            Enable sound
          </button>
        </Notice>
      )}
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <Card className="flex flex-col items-center justify-center p-8 text-center">
          <div className="text-6xl font-bold tabular-nums tracking-tight text-fg sm:text-7xl">
            {date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
          <div className="mt-2 text-fg-muted">{date.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}</div>
          {next && (
            <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent-soft px-4 py-2 text-sm font-medium text-accent-text">
              <AlarmIcon className="h-4 w-4" aria-hidden /> Next alarm in {untilText(next.ms)}
            </p>
          )}
          {snoozeUntil && <p className="mt-2 text-sm text-fg-subtle">Snoozed until {hhmm(new Date(snoozeUntil.at))}</p>}
        </Card>
        <Card className="h-fit space-y-4 p-5">
          <h2 className="text-sm font-semibold text-fg">New alarm</h2>
          <div className="grid grid-cols-[8rem_1fr] gap-3">
            <Input label="Time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            <Input label="Label (optional)" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Study break" maxLength={40} />
          </div>
          <SoundPicker value={sound} onChange={setSound} />
          <Button className="w-full" onClick={add} disabled={!/^\d{2}:\d{2}$/.test(time)} icon={<Plus className="h-4 w-4" aria-hidden />}>Add alarm</Button>
        </Card>
      </div>
      <Card className="overflow-hidden">
        <h2 className="border-b border-line px-5 py-3.5 text-sm font-semibold text-fg">Your alarms</h2>
        {alarms.length === 0 ? (
          <div className="p-4"><EmptyState icon={<AlarmIcon className="h-6 w-6" />} title="No alarms yet">Add one above. Alarms ring while this page is open.</EmptyState></div>
        ) : (
          <ul className="divide-y divide-line">
            {alarms.map((a) => (
              <li key={a.id} className="flex items-center gap-4 px-5 py-3">
                <span className={cn('text-2xl font-semibold tabular-nums', a.on ? 'text-fg' : 'text-fg-subtle')}>{a.time}</span>
                <span className="min-w-0 flex-1 truncate text-sm text-fg-muted">
                  {a.label || 'Alarm'} <Volume2 className="ml-1 inline h-3.5 w-3.5 text-fg-subtle" aria-hidden />
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={a.on}
                  aria-label={`${a.on ? 'Turn off' : 'Turn on'} alarm at ${a.time}`}
                  onClick={() => { unlockAudio(); setSoundReady(true); setAlarms((xs) => xs.map((x) => (x.id === a.id ? { ...x, on: !x.on } : x))); }}
                  className={cn('relative h-6 w-11 rounded-full transition-colors', a.on ? 'bg-accent' : 'bg-line-strong')}
                >
                  <span className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all', a.on ? 'left-[22px]' : 'left-0.5')} />
                </button>
                <Button variant="ghost" size="icon" onClick={() => setAlarms((xs) => xs.filter((x) => x.id !== a.id))} aria-label={`Delete alarm at ${a.time}`} icon={<Trash2 className="h-4 w-4" />} />
              </li>
            ))}
          </ul>
        )}
      </Card>
      <p className="text-xs text-fg-subtle">Alarms only ring while this page is open. To wake up, use your phone’s built-in alarm.</p>
    </div>
  );
}
