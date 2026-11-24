import { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { readStorage, writeStorage } from '../lib/storage';
import { useTicker } from '../hooks/useTicker';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const DEFAULTS = ['Asia/Kolkata', 'Asia/Dubai', 'Europe/London', 'America/New_York', 'Asia/Tokyo', 'Australia/Sydney'];
const ALL: string[] = (() => { try { return (Intl as unknown as { supportedValuesOf: (k: string) => string[] }).supportedValuesOf('timeZone'); } catch { return DEFAULTS; } })();
const city = (tz: string) => tz.split('/').pop()!.replace(/_/g, ' ');

export default function WorldClock() {
  const [zones, setZones] = useState<string[]>(() => readStorage('world-clock', DEFAULTS));
  const [add, setAdd] = useState('');
  useEffect(() => writeStorage('world-clock', zones), [zones]);
  const now = new Date(useTicker(true, 1000));
  const local = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const offsetMin = (tz: string) => { const s = now.toLocaleString('en-US', { timeZone: tz }); return Math.round((new Date(s).getTime() - new Date(now.toLocaleString('en-US', { timeZone: local })).getTime()) / 60000); };
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {zones.map((tz) => {
          const h = Number(now.toLocaleString('en-GB', { timeZone: tz, hour: '2-digit', hour12: false }));
          const off = offsetMin(tz);
          return (
            <Card key={tz} className="relative p-5">
              <button type="button" onClick={() => setZones((z) => z.filter((x) => x !== tz))} className="absolute right-3 top-3 rounded-lg p-1 text-fg-subtle hover:bg-surface-3 hover:text-fg" aria-label={`Remove ${city(tz)}`}><X className="h-4 w-4" /></button>
              <p className="text-sm font-medium text-fg-muted">{h >= 6 && h < 18 ? '☀️' : '🌙'} {city(tz)}{tz === local ? ' · you' : ''}</p>
              <p className="mt-1 text-4xl font-bold tabular-nums text-fg">{now.toLocaleTimeString(undefined, { timeZone: tz, hour: '2-digit', minute: '2-digit' })}</p>
              <p className="mt-1 text-xs text-fg-subtle">{now.toLocaleDateString(undefined, { timeZone: tz, weekday: 'short', day: 'numeric', month: 'short' })} · {off === 0 ? 'same time as you' : `${off > 0 ? '+' : '−'}${Math.floor(Math.abs(off) / 60)}h${Math.abs(off) % 60 ? ` ${Math.abs(off) % 60}m` : ''}`}</p>
            </Card>
          );
        })}
      </div>
      <Card className="flex flex-col gap-2 p-4 sm:flex-row sm:items-end">
        <label className="flex-1"><span className="mb-1.5 block text-sm font-medium text-fg">Add a city</span>
          <select value={add} onChange={(e) => setAdd(e.target.value)} className="h-11 w-full rounded-xl border border-line bg-surface px-3 text-fg">
            <option value="">Choose a time zone…</option>
            {ALL.filter((z) => !zones.includes(z)).map((z) => <option key={z} value={z}>{z.replace(/_/g, ' ')}</option>)}
          </select></label>
        <Button className="h-11" disabled={!add} onClick={() => { setZones((z) => [...z, add]); setAdd(''); }} icon={<Plus className="h-4 w-4" aria-hidden />}>Add</Button>
      </Card>
    </div>
  );
}
