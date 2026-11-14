import { useState } from 'react';
import { Download, RefreshCw } from 'lucide-react';
import { downloadText } from '../utils/download';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { CopyButton } from '../components/ui/CopyButton';
import { Checkbox, Input } from '../components/ui/Form';

const make = (n: number) => Array.from({ length: n }, () => crypto.randomUUID());

export default function UuidGenerator() {
  const [count, setCount] = useState('5');
  const [upper, setUpper] = useState(false);
  const [hyphens, setHyphens] = useState(true);
  const [braces, setBraces] = useState(false);
  const [list, setList] = useState(() => make(5));
  const fmt = (u: string) => { let x = hyphens ? u : u.replace(/-/g, ''); if (upper) x = x.toUpperCase(); return braces ? `{${x}}` : x; };
  const out = list.map(fmt).join('\n');
  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <Card className="h-fit space-y-4 p-5">
        <Input label="How many? (1–1000)" inputMode="numeric" value={count} onChange={(e) => setCount(e.target.value)} />
        <Checkbox checked={hyphens} onChange={setHyphens} label="Include hyphens" />
        <Checkbox checked={upper} onChange={setUpper} label="Uppercase" />
        <Checkbox checked={braces} onChange={setBraces} label="Wrap in { }" />
        <Button className="w-full" onClick={() => setList(make(Math.min(1000, Math.max(1, Math.round(Number(count)) || 1))))} icon={<RefreshCw className="h-4 w-4" aria-hidden />}>Generate</Button>
        <p className="text-xs text-fg-subtle">Version 4 (random) UUIDs from your browser’s secure random generator.</p>
      </Card>
      <Card className="min-w-0 p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-medium text-fg">{list.length} UUID{list.length === 1 ? '' : 's'}</span>
          <div className="flex gap-2"><CopyButton text={out} variant="primary" label="Copy all" /><Button variant="outline" size="sm" onClick={() => downloadText(out, 'uuids.txt')} icon={<Download className="h-4 w-4" aria-hidden />}>.txt</Button></div>
        </div>
        <pre className="max-h-[60vh] overflow-auto break-all whitespace-pre-wrap rounded-xl bg-surface-2 p-4 font-mono text-sm leading-7 text-fg">{out}</pre>
      </Card>
    </div>
  );
}
