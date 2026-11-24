import { useState } from 'react';
import { amountInWords, groupDigits, intToWords } from '../lib/numberWords';
import { Card } from '../components/ui/Card';
import { CopyButton } from '../components/ui/CopyButton';
import { Input, Select } from '../components/ui/Form';
import { Segmented } from '../components/ui/Segmented';
import { Notice } from '../components/ui/Notice';

const CURRENCIES = { INR: ['rupees', 'paise'], USD: ['dollars', 'cents'], AED: ['dirhams', 'fils'], GBP: ['pounds', 'pence'], EUR: ['euros', 'cents'] } as const;

export default function NumberToWords() {
  const [value, setValue] = useState('125050.50');
  const [system, setSystem] = useState<'indian' | 'international'>('indian');
  const [cur, setCur] = useState<keyof typeof CURRENCIES>('INR');
  const n = Number(value.replace(/[, ]/g, ''));
  let words = '', cheque = '', err: string | null = null;
  try {
    if (value.trim()) {
      if (!Number.isFinite(n) || n < 0) throw new Error('Enter a positive number.');
      words = intToWords(Math.floor(n), system) + (n % 1 ? ` point ${String(value.split('.')[1] ?? '').replace(/\D/g, '').split('').map((d) => intToWords(Number(d), system)).join(' ')}` : '');
      cheque = amountInWords(n, system, { major: CURRENCIES[cur][0], minor: CURRENCIES[cur][1] });
    }
  } catch (e) { err = e instanceof Error ? e.message : 'Invalid number'; }
  return (
    <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
      <Card className="h-fit space-y-4 p-5">
        <Input label="Number or amount" inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value)} hint={Number.isFinite(n) && value ? groupDigits(n, system) : undefined} />
        <Segmented label="Number system" value={system} onChange={setSystem} options={[{ value: 'indian', label: 'Lakh / crore' }, { value: 'international', label: 'Million / billion' }]} className="w-full" />
        <Select label="Currency (for cheques)" value={cur} onChange={(e) => setCur(e.target.value as keyof typeof CURRENCIES)}>
          {Object.keys(CURRENCIES).map((c) => <option key={c}>{c}</option>)}
        </Select>
      </Card>
      <div className="space-y-4">
        {err && <Notice tone="error">{err}</Notice>}
        {[['In words', words.charAt(0).toUpperCase() + words.slice(1)], ['For cheques & invoices', cheque]].map(([label, text]) => text && (
          <Card key={label} className="p-5">
            <div className="mb-2 flex items-center justify-between"><span className="text-sm font-medium text-fg-muted">{label}</span><CopyButton text={text} /></div>
            <p className="text-xl font-semibold leading-relaxed text-fg">{text}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
