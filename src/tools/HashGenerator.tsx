import { useEffect, useState } from 'react';
import { FileUp } from 'lucide-react';
import { md5 } from '../lib/md5';
import { formatBytes } from '../utils/format';
import { Card } from '../components/ui/Card';
import { CopyButton } from '../components/ui/CopyButton';
import { Checkbox, Input } from '../components/ui/Form';

const ALGOS = ['MD5', 'SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'] as const;
const hex = (buf: ArrayBuffer) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');

export default function HashGenerator() {
  const [text, setText] = useState('hello world');
  const [file, setFile] = useState<File | null>(null);
  const [upper, setUpper] = useState(false);
  const [hashes, setHashes] = useState<Record<string, string>>({});
  const [compare, setCompare] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const bytes = file ? new Uint8Array(await file.arrayBuffer()) : new TextEncoder().encode(text);
      const out: Record<string, string> = { MD5: md5(bytes) };
      for (const a of ALGOS.slice(1)) out[a] = hex(await crypto.subtle.digest(a, bytes));
      if (!cancelled) setHashes(out);
    })();
    return () => { cancelled = true; };
  }, [text, file]);

  const c = compare.trim().toLowerCase();
  const match = c ? Object.entries(hashes).find(([, h]) => h === c)?.[0] : undefined;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="space-y-4 p-4 sm:p-5">
        {file ? (
          <div className="flex items-center justify-between rounded-xl bg-surface-2 px-4 py-3 text-sm"><span className="truncate text-fg">{file.name} · {formatBytes(file.size)}</span><button type="button" className="font-medium text-accent-text" onClick={() => setFile(null)}>Use text instead</button></div>
        ) : (
          <label className="block"><span className="mb-1.5 block text-sm font-medium text-fg">Text</span><textarea value={text} onChange={(e) => setText(e.target.value)} className="min-h-[160px] w-full resize-y rounded-xl border border-line bg-surface-2 p-3 font-mono text-sm text-fg focus:border-accent focus:outline-none" /></label>
        )}
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-accent-text">
          <FileUp className="h-4 w-4" aria-hidden /> Hash a file instead (check downloads)
          <input type="file" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f && f.size <= 500 * 1024 * 1024) setFile(f); e.target.value = ''; }} />
        </label>
        <Checkbox checked={upper} onChange={setUpper} label="Uppercase letters" />
        <Input label="Compare with a hash (optional)" value={compare} onChange={(e) => setCompare(e.target.value)} placeholder="Paste a hash to check it matches" hint={c ? (match ? `✓ Matches the ${match} hash` : '✗ Doesn’t match any hash below') : undefined} />
      </Card>
      <Card className="h-fit divide-y divide-line">
        {ALGOS.map((a) => {
          const h = hashes[a] ? (upper ? hashes[a].toUpperCase() : hashes[a]) : '…';
          return (
            <div key={a} className={`space-y-1 p-4 ${match === a ? 'bg-success-soft' : ''}`}>
              <div className="flex items-center justify-between"><span className="text-sm font-semibold text-fg">{a}</span><CopyButton text={h} size="icon" variant="ghost" label={`Copy ${a}`} /></div>
              <code className="block break-all text-xs text-fg-muted">{h}</code>
            </div>
          );
        })}
      </Card>
    </div>
  );
}
