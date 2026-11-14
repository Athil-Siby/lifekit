import { useEffect, useMemo, useState } from 'react';
import { Download, FilePlus2, Trash2 } from 'lucide-react';
import { readStorage, writeStorage } from '../lib/storage';
import { downloadText } from '../utils/download';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { CopyButton } from '../components/ui/CopyButton';
import { cn } from '../lib/cn';

interface Note { id: number; text: string; updated: number }
const title = (n: Note) => n.text.trim().split('\n')[0].slice(0, 40) || 'Untitled note';

export default function Notepad() {
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = readStorage<Note[]>('notes', []);
    return saved.length ? saved : [{ id: Date.now(), text: '', updated: Date.now() }];
  });
  const [activeId, setActiveId] = useState(() => notes[0].id);
  const [size, setSize] = useState(() => readStorage<number>('notes-size', 16));
  const [saved, setSaved] = useState(true);
  const active = notes.find((n) => n.id === activeId) ?? notes[0];

  useEffect(() => {
    setSaved(false);
    const t = setTimeout(() => { writeStorage('notes', notes); setSaved(true); }, 400);
    return () => clearTimeout(t);
  }, [notes]);
  useEffect(() => writeStorage('notes-size', size), [size]);

  const update = (text: string) => setNotes((ns) => ns.map((n) => (n.id === active.id ? { ...n, text, updated: Date.now() } : n)));
  const add = () => {
    const n = { id: Date.now(), text: '', updated: Date.now() };
    setNotes((ns) => [n, ...ns]);
    setActiveId(n.id);
  };
  const remove = () => {
    if (active.text.trim() && !confirm('Delete this note? This can’t be undone.')) return;
    setNotes((ns) => {
      const rest = ns.filter((n) => n.id !== active.id);
      const next = rest.length ? rest : [{ id: Date.now(), text: '', updated: Date.now() }];
      setActiveId(next[0].id);
      return next;
    });
  };
  const stats = useMemo(() => {
    const t = active.text;
    return { words: t.trim() ? t.trim().split(/\s+/).length : 0, chars: t.length };
  }, [active.text]);
  const sorted = [...notes].sort((a, b) => b.updated - a.updated);

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <Card className="h-fit overflow-hidden">
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <h2 className="text-sm font-semibold text-fg">Notes ({notes.length})</h2>
          <Button size="sm" variant="ghost" onClick={add} icon={<FilePlus2 className="h-4 w-4" aria-hidden />}>New</Button>
        </div>
        <ul className="max-h-[50vh] overflow-y-auto">
          {sorted.map((n) => (
            <li key={n.id}>
              <button type="button" onClick={() => setActiveId(n.id)} className={cn('block w-full px-4 py-2.5 text-left', n.id === active.id ? 'bg-accent-soft' : 'hover:bg-surface-2')}>
                <span className="block truncate text-sm font-medium text-fg">{title(n)}</span>
                <span className="text-xs text-fg-subtle">{new Date(n.updated).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</span>
              </button>
            </li>
          ))}
        </ul>
      </Card>
      <Card className="flex flex-col p-4 sm:p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="text-xs text-fg-subtle" aria-live="polite">{saved ? 'Saved on this device' : 'Saving…'} · {stats.words} words · {stats.chars} characters</span>
          <div className="ml-auto flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => setSize((s) => Math.max(12, s - 2))} aria-label="Smaller text">A−</Button>
            <Button variant="outline" size="sm" onClick={() => setSize((s) => Math.min(28, s + 2))} aria-label="Larger text">A+</Button>
            <CopyButton text={active.text} />
            <Button variant="outline" size="sm" disabled={!active.text} onClick={() => downloadText(active.text, `${title(active).replace(/[^\w\- ]+/g, '').trim() || 'note'}.txt`)} icon={<Download className="h-4 w-4" aria-hidden />}>.txt</Button>
            <Button variant="outline" size="sm" onClick={remove} aria-label="Delete note" icon={<Trash2 className="h-4 w-4" />} />
          </div>
        </div>
        <textarea autoFocus value={active.text} onChange={(e) => update(e.target.value)} placeholder="Start typing… Your notes save automatically in this browser." style={{ fontSize: size }} className="min-h-[60vh] w-full flex-1 resize-y rounded-xl border border-line bg-surface-2 p-4 leading-relaxed text-fg placeholder:text-fg-subtle focus:border-accent focus:outline-none" aria-label="Note text" />
      </Card>
    </div>
  );
}
