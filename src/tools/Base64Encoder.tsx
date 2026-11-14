import { useMemo, useState } from 'react';
import { ArrowDownUp, FileUp } from 'lucide-react';
import { base64ToText, textToBase64, urlDecode, urlEncode } from '../lib/encode';
import { formatBytes } from '../utils/format';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { CopyButton } from '../components/ui/CopyButton';
import { Checkbox } from '../components/ui/Form';
import { Segmented } from '../components/ui/Segmented';
import { Notice } from '../components/ui/Notice';

const area = 'min-h-[220px] w-full resize-y rounded-xl border border-line bg-surface-2 p-3 font-mono text-sm text-fg focus:border-accent focus:outline-none break-all';

export default function Base64Encoder() {
  const [kind, setKind] = useState<'base64' | 'url'>('base64');
  const [dir, setDir] = useState<'encode' | 'decode'>('encode');
  const [input, setInput] = useState('Hello, LifeKit! ✓');
  const [urlSafe, setUrlSafe] = useState(false);
  const [fileOut, setFileOut] = useState<{ name: string; size: number; data: string } | null>(null);

  const out = useMemo(() => {
    try {
      if (kind === 'base64') return { v: dir === 'encode' ? textToBase64(input, urlSafe) : base64ToText(input), e: null };
      return { v: dir === 'encode' ? urlEncode(input) : urlDecode(input), e: null };
    } catch (e) {
      return { v: '', e: e instanceof Error ? e.message : 'Invalid input' };
    }
  }, [kind, dir, input, urlSafe]);

  const readFile = (f?: File) => {
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) { setFileOut({ name: f.name, size: f.size, data: '' }); return; }
    const r = new FileReader();
    r.onload = () => setFileOut({ name: f.name, size: f.size, data: String(r.result) });
    r.readAsDataURL(f);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Segmented label="Encoding" value={kind} onChange={setKind} options={[{ value: 'base64', label: 'Base64' }, { value: 'url', label: 'URL' }]} />
        <Segmented label="Direction" value={dir} onChange={setDir} options={[{ value: 'encode', label: 'Encode' }, { value: 'decode', label: 'Decode' }]} />
        <Button variant="ghost" size="sm" onClick={() => { if (out.v) { setInput(out.v); setDir(dir === 'encode' ? 'decode' : 'encode'); } }} icon={<ArrowDownUp className="h-4 w-4" aria-hidden />}>Swap</Button>
        {kind === 'base64' && dir === 'encode' && <Checkbox checked={urlSafe} onChange={setUrlSafe} label="URL-safe (- and _)" />}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-4">
          <label htmlFor="b64-in" className="mb-2 block text-sm font-medium text-fg">{dir === 'encode' ? 'Text' : kind === 'base64' ? 'Base64' : 'Encoded URL text'}</label>
          <textarea id="b64-in" value={input} onChange={(e) => setInput(e.target.value)} spellCheck={false} className={area} />
        </Card>
        <Card className="p-4">
          <div className="mb-2 flex items-center justify-between"><span className="text-sm font-medium text-fg">Result</span><CopyButton text={out.v} /></div>
          {out.e ? <Notice tone="error">{out.e}</Notice> : <textarea readOnly value={out.v} className={area} aria-label="Result" />}
        </Card>
      </div>
      {kind === 'base64' && (
        <Card className="space-y-3 p-4">
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-accent-text">
            <FileUp className="h-4 w-4" aria-hidden /> Convert a file (image, PDF…) to a Base64 data URL
            <input type="file" className="sr-only" onChange={(e) => { readFile(e.target.files?.[0]); e.target.value = ''; }} />
          </label>
          {fileOut && (fileOut.data ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm"><span className="text-fg-muted">{fileOut.name} · {formatBytes(fileOut.size)} → {formatBytes(fileOut.data.length)} of text</span><CopyButton text={fileOut.data} /></div>
              <textarea readOnly value={fileOut.data.length > 200000 ? fileOut.data.slice(0, 200000) + '…' : fileOut.data} className={area + ' min-h-[120px]'} aria-label="File as Base64" />
            </div>
          ) : <Notice tone="warning">Files over 10 MB are too big to show as text.</Notice>)}
        </Card>
      )}
    </div>
  );
}
