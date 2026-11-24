import { useState } from 'react';
import { convertBase } from '../lib/misc2';
import { Card } from '../components/ui/Card';
import { CopyButton } from '../components/ui/CopyButton';
import { Input } from '../components/ui/Form';
import { Segmented } from '../components/ui/Segmented';
import { Notice } from '../components/ui/Notice';

export default function BaseConverter() {
  const [value, setValue] = useState('255');
  const [from, setFrom] = useState<'2' | '8' | '10' | '16'>('10');
  let r: ReturnType<typeof convertBase> | null = null, err: string | null = null;
  try { if (value.trim()) r = convertBase(value, Number(from)); } catch (e) { err = e instanceof Error ? e.message : 'Invalid number'; }
  return (
    <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
      <Card className="h-fit space-y-4 p-5">
        <Segmented label="Input is" value={from} onChange={setFrom} options={[{ value: '2', label: 'Binary' }, { value: '8', label: 'Octal' }, { value: '10', label: 'Decimal' }, { value: '16', label: 'Hex' }]} className="w-full" />
        <Input label="Number" value={value} onChange={(e) => setValue(e.target.value)} spellCheck={false} />
        <p className="text-xs text-fg-subtle">Works with very large whole numbers.</p>
      </Card>
      <Card className="divide-y divide-line">
        {err && <div className="p-4"><Notice tone="error">{err}</Notice></div>}
        {r && ([['Binary (base 2)', r.bin], ['Octal (base 8)', r.oct], ['Decimal (base 10)', r.dec], ['Hexadecimal (base 16)', r.hex]] as const).map(([l, v]) => (
          <div key={l} className="flex items-center gap-3 p-4"><div className="min-w-0 flex-1"><p className="text-xs text-fg-subtle">{l}</p><code className="block break-all text-lg text-fg">{v}</code></div><CopyButton text={v} size="icon" variant="ghost" label={`Copy ${l}`} /></div>
        ))}
      </Card>
    </div>
  );
}
