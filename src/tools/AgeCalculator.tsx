import { useMemo, useState } from 'react';
import { Cake, PartyPopper } from 'lucide-react';
import { calculateAge, compareDates, parseIsoDate, toIsoDate, todayLocal } from '../lib/age';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Form';
import { Stat, EmptyState } from '../components/ui/Misc';
import { Button } from '../components/ui/Button';

const fmtDate = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

export default function AgeCalculator() {
  const today = toIsoDate(todayLocal());
  const [dob, setDob] = useState('');
  const [on, setOn] = useState(today);

  const { result, error } = useMemo(() => {
    if (!dob) return { result: null, error: null };
    const b = parseIsoDate(dob);
    const o = parseIsoDate(on);
    if (!b) return { result: null, error: 'Please enter a valid date of birth.' };
    if (!o) return { result: null, error: 'Please enter a valid “age on” date.' };
    if (b.year < 1800) return { result: null, error: 'Please enter a date of birth after 1800.' };
    if (compareDates(b, todayLocal()) > 0) return { result: null, error: 'The date of birth can’t be in the future.' };
    if (compareDates(b, o) > 0) return { result: null, error: 'The “age on” date must be on or after the date of birth.' };
    return { result: calculateAge(b, o), error: null };
  }, [dob, on]);

  const isToday = on === today;

  return (
    <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
      <Card className="h-fit space-y-5 p-5">
        <Input label="Date of birth" type="date" value={dob} max={today} min="1800-01-01" onChange={(e) => setDob(e.target.value)} error={error && error.includes('birth') ? error : null} />
        <div>
          <Input
            label="Age on"
            type="date"
            value={on}
            min={dob || undefined}
            onChange={(e) => setOn(e.target.value)}
            error={error && error.includes('“age on”') ? error : null}
            hint="Defaults to today. Change it to find an age at another date."
          />
          {!isToday && (
            <Button variant="ghost" size="sm" className="mt-2" onClick={() => setOn(today)}>Reset to today</Button>
          )}
        </div>
      </Card>

      <div aria-live="polite">
        {!result ? (
          <EmptyState icon={<Cake className="h-6 w-6" />} title={error ?? 'Enter a date of birth'}>
            {!error && 'Your exact age, totals and next birthday will appear here.'}
          </EmptyState>
        ) : (
          <div className="space-y-4">
            <Card className="p-6">
              <p className="text-sm text-fg-muted">{isToday ? 'Age today' : `Age on ${fmtDate(on)}`}</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
                <span className="text-accent-text">{result.years}</span> year{result.years === 1 ? '' : 's'},{' '}
                <span className="text-accent-text">{result.months}</span> month{result.months === 1 ? '' : 's'},{' '}
                <span className="text-accent-text">{result.days}</span> day{result.days === 1 ? '' : 's'}
              </p>
              <p className="mt-2 text-sm text-fg-muted">Born on a {result.bornWeekday}.</p>
            </Card>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="Total months" value={result.totalMonths.toLocaleString()} />
              <Stat label="Total weeks" value={result.totalWeeks.toLocaleString()} />
              <Stat label="Total days" value={result.totalDays.toLocaleString()} />
              <Stat label="Total hours" value={(result.totalDays * 24).toLocaleString()} sub="Approximate" />
            </div>
            <Card className="flex items-center gap-4 p-5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent-soft text-accent-text">
                <PartyPopper className="h-6 w-6" aria-hidden />
              </span>
              <div>
                {result.daysUntilNextBirthday === 0 ? (
                  <p className="font-semibold text-fg">Happy birthday! 🎉 Turning {result.ageAtNextBirthday} {isToday ? 'today' : 'on this date'}.</p>
                ) : (
                  <>
                    <p className="font-semibold text-fg">
                      Next birthday in {result.daysUntilNextBirthday.toLocaleString()} day{result.daysUntilNextBirthday === 1 ? '' : 's'}
                    </p>
                    <p className="text-sm text-fg-muted">
                      Turning {result.ageAtNextBirthday} on {fmtDate(toIsoDate(result.nextBirthday))}
                    </p>
                  </>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
