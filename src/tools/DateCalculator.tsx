import { useMemo, useState } from 'react';
import { calculateAge, compareDates, daysBetween, parseIsoDate, toIsoDate, todayLocal } from '../lib/age';
import { addToDate, businessDaysBetween, weekdayName } from '../lib/dates';
import { Card } from '../components/ui/Card';
import { Checkbox, Input } from '../components/ui/Form';
import { Segmented } from '../components/ui/Segmented';
import { Stat } from '../components/ui/Misc';
import { num } from './shared';

const longDate = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

export default function DateCalculator() {
  const today = toIsoDate(todayLocal());
  const t = todayLocal();
  const newYear = toIsoDate({ year: t.year + 1, month: 1, day: 1 });
  const [mode, setMode] = useState<'between' | 'add'>('between');
  const [start, setStart] = useState(today);
  const [end, setEnd] = useState(newYear);
  const [inclusive, setInclusive] = useState(false);
  const [base, setBase] = useState(today);
  const [op, setOp] = useState<'add' | 'subtract'>('add');
  const [years, setYears] = useState('0');
  const [months, setMonths] = useState('0');
  const [weeks, setWeeks] = useState('0');
  const [days, setDays] = useState('90');

  const between = useMemo(() => {
    const a = parseIsoDate(start);
    const b = parseIsoDate(end);
    if (!a || !b) return null;
    const forward = compareDates(a, b) <= 0;
    const [x, y] = forward ? [a, b] : [b, a];
    const total = daysBetween(x, y) + (inclusive ? 1 : 0);
    const ymd = calculateAge(x, y);
    return { total, forward, ymd, business: Math.abs(businessDaysBetween(x, y)) };
  }, [start, end, inclusive]);

  const added = useMemo(() => {
    const d = parseIsoDate(base);
    if (!d) return null;
    const s = op === 'add' ? 1 : -1;
    const v = (x: string) => (Number.isNaN(num(x)) ? 0 : Math.trunc(num(x)));
    const r = addToDate(d, s * v(years), s * v(months), s * (v(weeks) * 7 + v(days)));
    return toIsoDate(r);
  }, [base, op, years, months, weeks, days]);

  return (
    <div className="space-y-5">
      <Segmented label="Mode" value={mode} onChange={setMode} options={[{ value: 'between', label: 'Days between dates' }, { value: 'add', label: 'Add or subtract time' }]} />
      {mode === 'between' ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="space-y-4 p-5 sm:p-6">
            <Input label="Start date" type="date" value={start} onChange={(e) => setStart(e.target.value)} />
            <Input label="End date" type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
            <Checkbox checked={inclusive} onChange={setInclusive} label="Include end date" description="Count both the first and last day" />
          </Card>
          <div aria-live="polite">
            {between ? (
              <div className="space-y-3">
                <Card className="p-6">
                  <p className="text-sm text-fg-muted">{between.forward ? 'Time between the dates' : 'The end date is before the start date'}</p>
                  <p className="mt-1 text-4xl font-bold tabular-nums text-fg">
                    {between.total.toLocaleString()} <span className="text-2xl font-semibold text-fg-muted">day{between.total === 1 ? '' : 's'}</span>
                  </p>
                  <p className="mt-2 text-sm text-fg-muted">
                    {between.ymd.years > 0 && `${between.ymd.years} year${between.ymd.years === 1 ? '' : 's'}, `}
                    {between.ymd.months} month{between.ymd.months === 1 ? '' : 's'}, {between.ymd.days} day{between.ymd.days === 1 ? '' : 's'}
                  </p>
                </Card>
                <div className="grid grid-cols-2 gap-3">
                  <Stat label="Weeks" value={`${Math.floor(between.total / 7)} w ${between.total % 7} d`} />
                  <Stat label="Working days" value={between.business.toLocaleString()} sub="Mon–Fri" />
                  <Stat label="Hours" value={(between.total * 24).toLocaleString()} />
                  <Stat label="Minutes" value={(between.total * 1440).toLocaleString()} />
                </div>
              </div>
            ) : (
              <p className="text-sm text-fg-subtle">Pick two valid dates.</p>
            )}
          </div>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="space-y-4 p-5 sm:p-6">
            <Input label="Start date" type="date" value={base} onChange={(e) => setBase(e.target.value)} />
            <Segmented label="Add or subtract" value={op} onChange={setOp} options={[{ value: 'add', label: '+ Add' }, { value: 'subtract', label: '− Subtract' }]} />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Input label="Years" inputMode="numeric" value={years} onChange={(e) => setYears(e.target.value)} />
              <Input label="Months" inputMode="numeric" value={months} onChange={(e) => setMonths(e.target.value)} />
              <Input label="Weeks" inputMode="numeric" value={weeks} onChange={(e) => setWeeks(e.target.value)} />
              <Input label="Days" inputMode="numeric" value={days} onChange={(e) => setDays(e.target.value)} />
            </div>
          </Card>
          <Card className="h-fit p-6" aria-live="polite">
            {added ? (
              <>
                <p className="text-sm text-fg-muted">Result</p>
                <p className="mt-1 text-3xl font-bold text-fg">{longDate(added)}</p>
                <p className="mt-2 text-sm text-fg-muted">
                  {weekdayName(parseIsoDate(added)!)} · {Math.abs(daysBetween(parseIsoDate(base)!, parseIsoDate(added)!)).toLocaleString()} days {op === 'add' ? 'after' : 'before'} {longDate(base)}
                </p>
              </>
            ) : (
              <p className="text-sm text-fg-subtle">Pick a valid start date.</p>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
