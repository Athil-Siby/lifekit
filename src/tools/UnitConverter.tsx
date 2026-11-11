import { useMemo, useState } from 'react';
import { ArrowLeftRight } from 'lucide-react';
import { convertUnit, getUnitCategory, unitCategories, validateTemperature, type UnitCategoryId } from '../lib/units';
import { formatNumber, parseNumber } from '../utils/format';
import { Card } from '../components/ui/Card';
import { Input, Select } from '../components/ui/Form';
import { Button } from '../components/ui/Button';
import { CopyButton } from '../components/ui/CopyButton';
import { cn } from '../lib/cn';

export default function UnitConverter() {
  const [catId, setCatId] = useState<UnitCategoryId>('length');
  const cat = getUnitCategory(catId);
  const [from, setFrom] = useState(cat.defaultFrom);
  const [to, setTo] = useState(cat.defaultTo);
  const [value, setValue] = useState('1');

  const changeCategory = (id: UnitCategoryId) => {
    const c = getUnitCategory(id);
    setCatId(id);
    setFrom(c.defaultFrom);
    setTo(c.defaultTo);
  };

  const n = parseNumber(value);
  const invalid = value.trim() !== '' && Number.isNaN(n);
  const tempError = catId === 'temperature' && !Number.isNaN(n) ? validateTemperature(n, from) : null;
  const result = !Number.isNaN(n) && !tempError ? convertUnit(n, catId, from, to) : NaN;

  const fromUnit = cat.units.find((u) => u.id === from)!;
  const toUnit = cat.units.find((u) => u.id === to)!;
  const resultText = Number.isNaN(result) ? '' : formatNumber(result);

  const all = useMemo(
    () => (Number.isNaN(n) || tempError ? [] : cat.units.map((u) => ({ unit: u, value: convertUnit(n, catId, from, u.id) }))),
    [n, tempError, cat, catId, from],
  );

  return (
    <div className="space-y-5">
      <div role="tablist" aria-label="Unit category" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {unitCategories.map((c) => (
          <button
            key={c.id}
            role="tab"
            type="button"
            aria-selected={c.id === catId}
            onClick={() => changeCategory(c.id)}
            className={cn(
              'shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-all',
              c.id === catId ? 'border-fg bg-fg text-bg' : 'border-line bg-surface text-fg-muted hover:text-fg hover:border-line-strong',
            )}
          >
            {c.name}
          </button>
        ))}
      </div>

      <Card className="p-5 sm:p-6">
        <div className="grid items-end gap-4 md:grid-cols-[1fr_auto_1fr]">
          <div className="space-y-3">
            <Input label="Value" inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value)} error={invalid ? 'Please enter a number.' : tempError} />
            <Select label="From" value={from} onChange={(e) => setFrom(e.target.value)}>
              {cat.units.map((u) => (
                <option key={u.id} value={u.id}>{u.name} ({u.symbol})</option>
              ))}
            </Select>
          </div>
          <div className="flex justify-center md:pb-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setFrom(to);
                setTo(from);
              }}
              aria-label="Swap units"
              title="Swap units"
              icon={<ArrowLeftRight className="h-4 w-4" aria-hidden />}
            />
          </div>
          <div className="space-y-3">
            <div>
              <p className="mb-1.5 text-sm font-medium text-fg">Result</p>
              <div className="flex h-11 items-center justify-between gap-2 rounded-xl border border-accent/30 bg-accent-soft px-3.5" aria-live="polite">
                <span className="truncate font-semibold tabular-nums text-accent-text">{resultText || '—'}</span>
                {resultText && <CopyButton text={resultText} size="icon" variant="ghost" label="Copy result" className="h-8 w-8" />}
              </div>
            </div>
            <Select label="To" value={to} onChange={(e) => setTo(e.target.value)}>
              {cat.units.map((u) => (
                <option key={u.id} value={u.id}>{u.name} ({u.symbol})</option>
              ))}
            </Select>
          </div>
        </div>
        {resultText && (
          <p className="mt-5 rounded-xl bg-surface-2 px-4 py-3 text-center text-fg">
            <span className="tabular-nums">{formatNumber(n)}</span> {fromUnit.symbol} ={' '}
            <strong className="tabular-nums">{resultText}</strong> {toUnit.symbol}
          </p>
        )}
      </Card>

      {all.length > 0 && (
        <Card className="overflow-hidden">
          <h2 className="border-b border-line px-5 py-3.5 text-sm font-semibold text-fg">
            {formatNumber(n)} {fromUnit.symbol} in every {cat.name.toLowerCase()} unit
          </h2>
          <ul className="grid divide-line sm:grid-cols-2 sm:divide-x">
            {all.map(({ unit, value: v }) => (
              <li key={unit.id} className={cn('flex items-center justify-between gap-3 border-b border-line px-5 py-2.5 text-sm', unit.id === from && 'bg-surface-2')}>
                <span className="text-fg-muted">{unit.name}</span>
                <span className="font-medium tabular-nums text-fg">{formatNumber(v)} <span className="text-fg-subtle">{unit.symbol}</span></span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
