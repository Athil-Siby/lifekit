import { useState } from 'react';
import { convertSize, sizeUnits, toBytes, windowsStyle, type SizeUnitId } from '../lib/fileSize';
import { formatNumber, parseNumber } from '../utils/format';
import { Card } from '../components/ui/Card';
import { Input, Select } from '../components/ui/Form';
import { CopyButton } from '../components/ui/CopyButton';
import { Notice } from '../components/ui/Notice';
import { cn } from '../lib/cn';

export default function FileSizeCalculator() {
  const [value, setValue] = useState('1');
  const [unit, setUnit] = useState<SizeUnitId>('GB');
  const n = parseNumber(value);
  const invalid = value.trim() !== '' && (Number.isNaN(n) || n < 0);
  const valid = !Number.isNaN(n) && n >= 0;
  const bytes = valid ? toBytes(n, unit) : NaN;

  const group = (system: 'decimal' | 'binary') => sizeUnits.filter((u) => u.system === system || u.id === 'B');

  const Table = ({ system, title, note }: { system: 'decimal' | 'binary'; title: string; note: string }) => (
    <Card className="overflow-hidden">
      <div className="border-b border-line px-5 py-3.5">
        <h2 className="text-sm font-semibold text-fg">{title}</h2>
        <p className="text-xs text-fg-subtle">{note}</p>
      </div>
      <ul>
        {group(system).map((u) => {
          const v = valid ? convertSize(n, unit, u.id) : NaN;
          const text = formatNumber(v, 12);
          return (
            <li key={u.id} className={cn('flex items-center justify-between gap-3 border-b border-line px-5 py-2.5 text-sm last:border-0', u.id === unit && 'bg-accent-soft')}>
              <span className="text-fg-muted">
                {u.name} <span className="text-fg-subtle">({u.id})</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="font-medium tabular-nums text-fg">{valid ? text : '—'}</span>
                {valid && <CopyButton text={text} size="icon" variant="ghost" label={`Copy ${u.name}`} className="h-7 w-7" />}
              </span>
            </li>
          );
        })}
      </ul>
    </Card>
  );

  return (
    <div className="space-y-5">
      <Card className="p-5 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-[1fr_220px]">
          <Input label="File size" inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value)} error={invalid ? 'Please enter a positive number.' : null} />
          <Select label="Unit" value={unit} onChange={(e) => setUnit(e.target.value as SizeUnitId)}>
            <optgroup label="Base">
              <option value="bit">Bits (bit)</option>
              <option value="B">Bytes (B)</option>
            </optgroup>
            <optgroup label="Decimal (SI, ×1000)">
              {sizeUnits.filter((u) => u.system === 'decimal').map((u) => <option key={u.id} value={u.id}>{u.name} ({u.id})</option>)}
            </optgroup>
            <optgroup label="Binary (IEC, ×1024)">
              {sizeUnits.filter((u) => u.system === 'binary').map((u) => <option key={u.id} value={u.id}>{u.name} ({u.id})</option>)}
            </optgroup>
          </Select>
        </div>
        {valid && (
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-surface-2 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-fg-subtle">Exact bytes</p>
              <p className="mt-1 font-semibold tabular-nums text-fg break-all">{Number.isInteger(bytes) ? bytes.toLocaleString('en-US') : formatNumber(bytes, 15)}</p>
            </div>
            <div className="rounded-xl bg-surface-2 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-fg-subtle">Bits</p>
              <p className="mt-1 font-semibold tabular-nums text-fg break-all">{formatNumber(bytes * 8, 15)}</p>
            </div>
            <div className="rounded-xl bg-surface-2 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-fg-subtle">Windows would show</p>
              <p className="mt-1 font-semibold tabular-nums text-fg">{windowsStyle(bytes)}</p>
            </div>
          </div>
        )}
      </Card>
      <div className="grid gap-5 lg:grid-cols-2">
        <Table system="decimal" title="Decimal units (SI)" note="1 KB = 1,000 bytes. Used by drive makers, macOS and network speeds." />
        <Table system="binary" title="Binary units (IEC)" note="1 KiB = 1,024 bytes. Used by RAM sizes and many technical tools." />
      </div>
      <Notice tone="info" title="KB vs KiB in one sentence">
        A kilobyte (KB) is 1,000 bytes and a kibibyte (KiB) is 1,024 bytes. The difference grows with each step:
        a gibibyte is about 7.4% bigger than a gigabyte, which is why a “500 GB” drive shows as about 465 GB in Windows.
      </Notice>
    </div>
  );
}
