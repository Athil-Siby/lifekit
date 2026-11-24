import { useMemo, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Checkbox } from '../components/ui/Form';
import { Notice } from '../components/ui/Notice';

export default function RegexTester() {
  const [pattern, setPattern] = useState('\\b[\\w.+-]+@[\\w-]+\\.[\\w.]+\\b');
  const [flags, setFlags] = useState({ g: true, i: true, m: false });
  const [text, setText] = useState('Contact us at hello@example.com or support@lifekit.app.\nInvalid: user@ and @domain.com');
  const res = useMemo(() => {
    try {
      const re = new RegExp(pattern, Object.entries(flags).filter(([, v]) => v).map(([k]) => k).join('') + (flags.g ? '' : ''));
      if (!pattern) return { parts: [{ t: text, m: false }], matches: [] as RegExpExecArray[], err: null };
      const g = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g');
      const matches: RegExpExecArray[] = [];
      let m: RegExpExecArray | null, guard = 0;
      while ((m = g.exec(text)) && guard++ < 5000) { matches.push(m); if (m[0] === '') g.lastIndex++; if (!flags.g) break; }
      const parts: { t: string; m: boolean }[] = [];
      let last = 0;
      for (const x of matches) { if (x.index > last) parts.push({ t: text.slice(last, x.index), m: false }); parts.push({ t: x[0], m: true }); last = x.index + x[0].length; }
      parts.push({ t: text.slice(last), m: false });
      return { parts, matches, err: null };
    } catch (e) { return { parts: [], matches: [], err: e instanceof Error ? e.message : 'Invalid pattern' }; }
  }, [pattern, flags, text]);
  return (
    <div className="space-y-4">
      <Card className="space-y-3 p-4 sm:p-5">
        <label className="block"><span className="mb-1.5 block text-sm font-medium text-fg">Regular expression</span>
          <div className="flex items-center rounded-xl border border-line bg-surface-2 px-3 font-mono focus-within:border-accent"><span className="text-fg-subtle">/</span><input value={pattern} onChange={(e) => setPattern(e.target.value)} spellCheck={false} className="h-11 flex-1 bg-transparent px-1 text-fg focus:outline-none" aria-label="Pattern" /><span className="text-fg-subtle">/{Object.entries(flags).filter(([, v]) => v).map(([k]) => k).join('')}</span></div></label>
        <div className="flex flex-wrap gap-5"><Checkbox checked={flags.g} onChange={(v) => setFlags((f) => ({ ...f, g: v }))} label="g – all matches" /><Checkbox checked={flags.i} onChange={(v) => setFlags((f) => ({ ...f, i: v }))} label="i – ignore case" /><Checkbox checked={flags.m} onChange={(v) => setFlags((f) => ({ ...f, m: v }))} label="m – multiline" /></div>
      </Card>
      {res.err && <Notice tone="error">{res.err}</Notice>}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-4"><label className="block"><span className="mb-1.5 block text-sm font-medium text-fg">Test text</span><textarea value={text} onChange={(e) => setText(e.target.value)} rows={8} spellCheck={false} className="w-full rounded-xl border border-line bg-surface-2 p-3 font-mono text-sm text-fg focus:border-accent focus:outline-none" /></label></Card>
        <Card className="p-4">
          <p className="mb-1.5 text-sm font-medium text-fg">{res.matches.length} match{res.matches.length === 1 ? '' : 'es'}</p>
          <pre className="min-h-[120px] whitespace-pre-wrap break-words rounded-xl bg-surface-2 p-3 font-mono text-sm text-fg">{res.parts.map((p, i) => p.m ? <mark key={i} className="rounded bg-accent/40 text-fg">{p.t}</mark> : <span key={i}>{p.t}</span>)}</pre>
          {res.matches.some((m) => m.length > 1) && <ul className="mt-3 space-y-1 text-xs text-fg-muted">{res.matches.slice(0, 20).map((m, i) => <li key={i}>#{i + 1}: {m.slice(1).map((g, j) => `$${j + 1}=“${g ?? ''}”`).join(' ')}</li>)}</ul>}
        </Card>
      </div>
    </div>
  );
}
