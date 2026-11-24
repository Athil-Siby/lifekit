import { useEffect, useMemo, useState } from 'react';
import { Share2 } from 'lucide-react';
import { countdownParts } from '../lib/misc2';
import { useTicker, useDocumentTitle } from '../hooks/useTicker';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Form';
import { CopyButton } from '../components/ui/CopyButton';

const defaultDate = () => { const d = new Date(); d.setMonth(d.getMonth() + 1); return d.toISOString().slice(0, 10); };

export default function CountdownTimer() {
  const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const [title, setTitle] = useState(params.get('t') ?? 'Exams start');
  const [date, setDate] = useState(params.get('d') ?? defaultDate());
  const [time, setTime] = useState(params.get('h') ?? '09:00');
  const target = useMemo(() => new Date(`${date}T${time || '00:00'}`), [date, time]);
  const now = useTicker(true, 1000);
  const p = countdownParts(target.getTime() - now);
  const valid = !Number.isNaN(target.getTime());
  useDocumentTitle(valid && !p.neg ? `${p.days}d ${p.hours}h – ${title || 'Countdown'}` : null);
  const share = typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}?${new URLSearchParams({ t: title, d: date, h: time })}` : '';
  useEffect(() => { if (valid) window.history.replaceState(null, '', `?${new URLSearchParams({ t: title, d: date, h: time })}`); }, [title, date, time, valid]);
  return (
    <div className="space-y-6">
      <Card className="min-w-0 p-4 text-center sm:p-10">
        <p className="text-lg font-semibold text-fg-muted">{title || 'Countdown'}</p>
        {valid ? (p.neg ? <p className="mt-4 text-4xl font-bold text-accent-text">🎉 It’s here!</p> : (
          <div className="mx-auto mt-6 grid max-w-2xl grid-cols-4 gap-1.5 sm:gap-4" role="timer" aria-live="off">
            {[['days', p.days], ['hours', p.hours], ['minutes', p.minutes], ['seconds', p.seconds]].map(([l, v]) => (
              <div key={l} className="rounded-2xl bg-surface-2 py-4 sm:py-6"><p className="text-3xl font-bold tabular-nums text-fg sm:text-6xl">{String(v).padStart(2, '0')}</p><p className="mt-1 text-[10px] uppercase tracking-wide text-fg-subtle sm:text-sm">{l}</p></div>
            ))}
          </div>
        )) : <p className="mt-4 text-fg-muted">Pick a date.</p>}
        {valid && <p className="mt-6 text-sm text-fg-muted">{target.toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short' })}</p>}
      </Card>
      <Card className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-4 p-5 sm:grid-cols-[minmax(0,1fr)_180px_140px]">
        <Input label="Event name" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={60} />
        <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <Input label="Time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        <div className="flex items-center gap-3 sm:col-span-3"><Share2 className="h-4 w-4 text-fg-subtle" aria-hidden /><span className="min-w-0 flex-1 truncate text-sm text-fg-muted">Share this countdown with friends</span><CopyButton text={share} label="Copy link" /></div>
      </Card>
    </div>
  );
}
