import { useMemo, useState } from 'react';
import { ArrowLeftRight } from 'lucide-react';
import { diffLines, diffWords, type DiffOp } from '../lib/diff';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Checkbox } from '../components/ui/Form';
import { Notice } from '../components/ui/Notice';
import { cn } from '../lib/cn';

const A = 'The quick brown fox jumps over the lazy dog.\nIt was a sunny day.\nThe end.';
const B = 'The quick brown fox leaps over the lazy dog.\nIt was a sunny day.\nThe birds were singing.\nThe end.';

/** Pair up adjacent delete/add runs so changed lines can show word-level highlights. */
function render(ops: DiffOp[]) {
  const rows: { type: 'same' | 'add' | 'del'; left?: string; right?: string; words?: DiffOp[] }[] = [];
  for (let i = 0; i < ops.length; i++) {
    const o = ops[i];
    if (o.type === 'del' && ops[i + 1]?.type === 'add') {
      rows.push({ type: 'del', left: o.text, right: ops[i + 1].text, words: diffWords(o.text, ops[i + 1].text) });
      i++;
    } else rows.push({ type: o.type, left: o.text });
  }
  return rows;
}

export default function TextCompare() {
  const [a, setA] = useState(A);
  const [b, setB] = useState(B);
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [ignoreSpace, setIgnoreSpace] = useState(false);
  const result = useMemo(() => {
    try {
      return { ops: diffLines(a, b, { ignoreCase, ignoreSpace }), error: null };
    } catch (e) {
      return { ops: [], error: e instanceof Error ? e.message : 'Comparison failed.' };
    }
  }, [a, b, ignoreCase, ignoreSpace]);
  const added = result.ops.filter((o) => o.type === 'add').length;
  const removed = result.ops.filter((o) => o.type === 'del').length;
  const rows = render(result.ops);
  const area = 'min-h-[200px] w-full resize-y rounded-xl border border-line bg-surface-2 p-3 font-mono text-sm text-fg focus:border-accent focus:outline-none';

  return (
    <div className="space-y-5">
      <Card className="p-4 sm:p-5">
        <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr]">
          <label className="block"><span className="mb-1.5 block text-sm font-medium text-fg">Original text</span><textarea value={a} onChange={(e) => setA(e.target.value)} className={area} /></label>
          <div className="flex items-center justify-center"><Button variant="ghost" size="icon" onClick={() => { setA(b); setB(a); }} aria-label="Swap texts" icon={<ArrowLeftRight className="h-4 w-4" />} /></div>
          <label className="block"><span className="mb-1.5 block text-sm font-medium text-fg">Changed text</span><textarea value={b} onChange={(e) => setB(e.target.value)} className={area} /></label>
        </div>
        <div className="mt-4 flex flex-wrap gap-6">
          <Checkbox checked={ignoreCase} onChange={setIgnoreCase} label="Ignore capital letters" />
          <Checkbox checked={ignoreSpace} onChange={setIgnoreSpace} label="Ignore extra spaces" />
        </div>
      </Card>
      {result.error ? <Notice tone="error">{result.error}</Notice> : (
        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-3 text-sm">
            <span className="font-semibold text-fg">{added === 0 && removed === 0 ? 'The texts are identical ✓' : 'Differences'}</span>
            {added > 0 && <span className="rounded-full bg-success-soft px-2.5 py-0.5 text-success">+{added} added</span>}
            {removed > 0 && <span className="rounded-full bg-danger-soft px-2.5 py-0.5 text-danger">−{removed} removed</span>}
          </div>
          <div className="max-h-[60vh] overflow-auto font-mono text-sm">
            {rows.map((r, i) => r.words ? (
              <div key={i}>
                <div className="flex bg-danger-soft"><span className="w-8 shrink-0 select-none text-center text-danger">−</span><span className="whitespace-pre-wrap break-words py-0.5 pr-3">{r.words.filter((w) => w.type !== 'add').map((w, k) => <span key={k} className={w.type === 'del' ? 'rounded bg-danger/25' : ''}>{w.text}</span>)}</span></div>
                <div className="flex bg-success-soft"><span className="w-8 shrink-0 select-none text-center text-success">+</span><span className="whitespace-pre-wrap break-words py-0.5 pr-3">{r.words.filter((w) => w.type !== 'del').map((w, k) => <span key={k} className={w.type === 'add' ? 'rounded bg-success/25' : ''}>{w.text}</span>)}</span></div>
              </div>
            ) : (
              <div key={i} className={cn('flex', r.type === 'add' && 'bg-success-soft', r.type === 'del' && 'bg-danger-soft')}>
                <span className={cn('w-8 shrink-0 select-none text-center', r.type === 'add' ? 'text-success' : r.type === 'del' ? 'text-danger' : 'text-fg-subtle')}>{r.type === 'add' ? '+' : r.type === 'del' ? '−' : ''}</span>
                <span className="whitespace-pre-wrap break-words py-0.5 pr-3 text-fg">{r.left || ' '}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
