import { useMemo, useState } from 'react';
import { ArrowLeftRight, Clock, Plus, X } from 'lucide-react';
import {
  dayDifference, formatOffset, getLocalTimeZone, getOffsetMinutes, listTimeZones, wallTimeInZone, zoneAbbreviation, zoneLabel,
  zonedTimeToUtc, type WallTime,
} from '../lib/timezone';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Form';
import { Notice } from '../components/ui/Notice';
import { Badge } from '../components/ui/Misc';

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function nowInputs(zone: string) {
  const w = wallTimeInZone(new Date(), zone);
  return { date: `${w.year}-${pad(w.month)}-${pad(w.day)}`, time: `${pad(w.hour)}:${pad(w.minute)}` };
}

function parseInputs(date: string, time: string): WallTime | null {
  const d = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  const t = /^(\d{2}):(\d{2})/.exec(time);
  if (!d || !t) return null;
  return { year: +d[1], month: +d[2], day: +d[3], hour: +t[1], minute: +t[2] };
}

function formatWall(date: Date, zone: string) {
  return {
    time: date.toLocaleTimeString(undefined, { timeZone: zone, hour: '2-digit', minute: '2-digit' }),
    date: date.toLocaleDateString(undefined, { timeZone: zone, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
  };
}

function ZoneSelect({ label, value, onChange, zones }: { label: string; value: string; onChange: (z: string) => void; zones: string[] }) {
  return (
    <Select label={label} value={value} onChange={(e) => onChange(e.target.value)}>
      {zones.map((z) => (
        <option key={z} value={z}>
          {zoneLabel(z)}
        </option>
      ))}
    </Select>
  );
}

export default function TimeZoneConverter() {
  const zones = useMemo(() => {
    const list = listTimeZones();
    return [...list].sort((a, b) => zoneLabel(a).localeCompare(zoneLabel(b)));
  }, []);
  const local = getLocalTimeZone();
  const [from, setFrom] = useState(zones.includes(local) ? local : 'UTC');
  const [targets, setTargets] = useState<string[]>(() => {
    const preferred = ['America/New_York', 'Europe/London', 'Asia/Tokyo'].filter((z) => z !== local && zones.includes(z));
    return [preferred[0] ?? 'UTC'];
  });
  const initial = nowInputs(from);
  const [date, setDate] = useState(initial.date);
  const [time, setTime] = useState(initial.time);

  const wall = parseInputs(date, time);
  const resolved = wall ? zonedTimeToUtc(wall, from) : null;

  const setNow = () => {
    const n = nowInputs(from);
    setDate(n.date);
    setTime(n.time);
  };

  const swap = () => {
    if (!resolved) return;
    const to = targets[0];
    const w = wallTimeInZone(resolved.date, to);
    setTargets((t) => [from, ...t.slice(1)]);
    setFrom(to);
    setDate(`${w.year}-${pad(w.month)}-${pad(w.day)}`);
    setTime(`${pad(w.hour)}:${pad(w.minute)}`);
  };

  const source = resolved ? formatWall(resolved.date, from) : null;
  const sourceWall = resolved ? wallTimeInZone(resolved.date, from) : null;

  return (
    <div className="space-y-5">
      <Card className="p-5 sm:p-6">
        <div className="grid gap-4 md:grid-cols-[1fr_1fr_1.4fr_auto]">
          <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} error={!wall && date ? 'Enter a valid date.' : null} />
          <Input label="Time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          <ZoneSelect label="From time zone" value={from} onChange={setFrom} zones={zones} />
          <div className="flex items-end">
            <Button variant="outline" onClick={setNow} icon={<Clock className="h-4 w-4" aria-hidden />} className="h-11 w-full">Now</Button>
          </div>
        </div>
        {resolved?.nonexistent && (
          <Notice tone="warning" className="mt-4" title="This time doesn’t exist in the selected zone">
            Clocks jump forward for daylight saving on this date, so {time} never happens. Showing the equivalent time
            after the change: {source?.time}.
          </Notice>
        )}
        {resolved?.ambiguous && (
          <Notice tone="info" className="mt-4" title="This time happens twice">
            Clocks go back on this date, so {time} occurs twice. The first occurrence (before the change) is used.
          </Notice>
        )}
        {resolved && source && (
          <p className="mt-4 text-sm text-fg-muted">
            {source.date}, {source.time} in {zoneLabel(from)} · {formatOffset(getOffsetMinutes(resolved.date, from))}{' '}
            {zoneAbbreviation(resolved.date, from) && `(${zoneAbbreviation(resolved.date, from)})`}
          </p>
        )}
      </Card>

      <div className="space-y-3" aria-live="polite">
        {targets.map((zone, i) => {
          if (!resolved || !sourceWall) return null;
          const out = formatWall(resolved.date, zone);
          const w = wallTimeInZone(resolved.date, zone);
          const diffDays = dayDifference(sourceWall, w);
          const offsetDiff = (getOffsetMinutes(resolved.date, zone) - getOffsetMinutes(resolved.date, from)) / 60;
          return (
            <Card key={`${zone}-${i}`} className="p-5 sm:p-6">
              <div className="grid gap-4 md:grid-cols-[1.4fr_2fr] md:items-center">
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <ZoneSelect label={i === 0 ? 'To time zone' : 'Also show'} value={zone} onChange={(z) => setTargets((t) => t.map((x, j) => (j === i ? z : x)))} zones={zones} />
                  </div>
                  {i === 0 ? (
                    <Button variant="outline" size="icon" className="h-11 w-11" onClick={swap} aria-label="Swap time zones" title="Swap" icon={<ArrowLeftRight className="h-4 w-4" aria-hidden />} />
                  ) : (
                    <Button variant="ghost" size="icon" className="h-11 w-11" onClick={() => setTargets((t) => t.filter((_, j) => j !== i))} aria-label={`Remove ${zoneLabel(zone)}`} icon={<X className="h-4 w-4" aria-hidden />} />
                  )}
                </div>
                <div className="rounded-xl bg-surface-2 px-5 py-4">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <p className="text-3xl font-bold tabular-nums tracking-tight text-fg">{out.time}</p>
                    {diffDays !== 0 && (
                      <Badge tone="warning">{diffDays > 0 ? `+${diffDays} day${diffDays > 1 ? 's' : ''}` : `${diffDays} day${diffDays < -1 ? 's' : ''}`}</Badge>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-fg-muted">{out.date}</p>
                  <p className="mt-1 text-xs text-fg-subtle">
                    {formatOffset(getOffsetMinutes(resolved.date, zone))} {zoneAbbreviation(resolved.date, zone) && `· ${zoneAbbreviation(resolved.date, zone)}`} ·{' '}
                    {offsetDiff === 0 ? 'same time as source' : `${offsetDiff > 0 ? '+' : '−'}${Math.abs(offsetDiff)} h from source`}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
        {targets.length < 6 && (
          <Button variant="ghost" onClick={() => setTargets((t) => [...t, 'UTC'])} icon={<Plus className="h-4 w-4" aria-hidden />}>
            Add another time zone
          </Button>
        )}
      </div>
    </div>
  );
}
