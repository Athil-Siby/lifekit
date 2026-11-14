import { useMemo, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { lorem } from '../lib/lorem';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { CopyButton } from '../components/ui/CopyButton';
import { Checkbox, Input } from '../components/ui/Form';
import { Segmented } from '../components/ui/Segmented';

export default function LoremIpsum() {
  const [kind, setKind] = useState<'paragraphs' | 'sentences' | 'words'>('paragraphs');
  const [count, setCount] = useState('3');
  const [start, setStart] = useState(true);
  const [html, setHtml] = useState(false);
  const [seed, setSeed] = useState(0);
  const text = useMemo(() => lorem(kind, Number(count) || 1, start), [kind, count, start, seed]); // eslint-disable-line react-hooks/exhaustive-deps
  const out = html && kind === 'paragraphs' ? text.split('\n\n').map((p) => `<p>${p}</p>`).join('\n') : text;
  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <Card className="h-fit space-y-5 p-5">
        <Segmented label="Generate" value={kind} onChange={setKind} options={[{ value: 'paragraphs', label: 'Paragraphs' }, { value: 'sentences', label: 'Sentences' }, { value: 'words', label: 'Words' }]} className="w-full" />
        <Input label={`How many ${kind}?`} inputMode="numeric" value={count} onChange={(e) => setCount(e.target.value)} />
        <Checkbox checked={start} onChange={setStart} label="Start with “Lorem ipsum dolor sit amet…”" />
        {kind === 'paragraphs' && <Checkbox checked={html} onChange={setHtml} label="Wrap paragraphs in <p> tags" />}
        <Button variant="outline" className="w-full" onClick={() => setSeed((s) => s + 1)} icon={<RefreshCw className="h-4 w-4" aria-hidden />}>Generate new text</Button>
      </Card>
      <Card className="p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs text-fg-subtle">{out.trim().split(/\s+/).length} words · {out.length} characters</span>
          <CopyButton text={out} variant="primary" />
        </div>
        <div className="max-h-[60vh] min-h-[240px] overflow-auto whitespace-pre-wrap rounded-xl bg-surface-2 p-4 leading-relaxed text-fg">{out}</div>
      </Card>
    </div>
  );
}
