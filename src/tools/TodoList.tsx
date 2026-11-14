import { useEffect, useState, type FormEvent } from 'react';
import { ArrowDown, ArrowUp, CheckCircle2, ListTodo, Plus, Trash2 } from 'lucide-react';
import { readStorage, writeStorage } from '../lib/storage';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/Misc';
import { Segmented } from '../components/ui/Segmented';
import { cn } from '../lib/cn';

interface Task { id: number; text: string; done: boolean; priority: boolean; due?: string }

export default function TodoList() {
  const [tasks, setTasks] = useState<Task[]>(() => readStorage<Task[]>('todos', []));
  const [text, setText] = useState('');
  const [due, setDue] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'done'>('all');
  const [editing, setEditing] = useState<number | null>(null);
  useEffect(() => writeStorage('todos', tasks), [tasks]);

  const add = (e: FormEvent) => {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    setTasks((ts) => [{ id: Date.now(), text: t, done: false, priority: false, due: due || undefined }, ...ts]);
    setText('');
    setDue('');
  };
  const patch = (id: number, p: Partial<Task>) => setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, ...p } : t)));
  const move = (i: number, d: number) => setTasks((ts) => { const j = i + d; if (j < 0 || j >= ts.length) return ts; const c = [...ts]; [c[i], c[j]] = [c[j], c[i]]; return c; });

  const shown = tasks.map((t, i) => ({ t, i })).filter(({ t }) => (filter === 'all' ? true : filter === 'done' ? t.done : !t.done));
  const left = tasks.filter((t) => !t.done).length;
  const today = new Date().toISOString().slice(0, 10);

  return (
    <Card className="mx-auto max-w-3xl p-4 sm:p-6">
      <form onSubmit={add} className="flex flex-col gap-2 sm:flex-row">
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Add a task, e.g. Finish maths homework" maxLength={200} aria-label="New task" className="h-11 flex-1 rounded-xl border border-line bg-surface px-3.5 text-fg placeholder:text-fg-subtle focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/15" />
        <input type="date" value={due} onChange={(e) => setDue(e.target.value)} aria-label="Due date (optional)" className="h-11 rounded-xl border border-line bg-surface px-3 text-sm text-fg" />
        <Button type="submit" className="h-11" disabled={!text.trim()} icon={<Plus className="h-4 w-4" aria-hidden />}>Add</Button>
      </form>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <Segmented label="Show" value={filter} onChange={setFilter} options={[{ value: 'all', label: `All (${tasks.length})` }, { value: 'active', label: `To do (${left})` }, { value: 'done', label: `Done (${tasks.length - left})` }]} />
        {tasks.some((t) => t.done) && <Button variant="ghost" size="sm" onClick={() => setTasks((ts) => ts.filter((t) => !t.done))}>Clear completed</Button>}
      </div>
      {tasks.length > 0 && (
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface-3" aria-hidden>
          <div className="h-full rounded-full bg-success transition-all" style={{ width: `${((tasks.length - left) / tasks.length) * 100}%` }} />
        </div>
      )}
      {shown.length === 0 ? (
        <div className="mt-6">
          <EmptyState icon={tasks.length && filter === 'active' ? <CheckCircle2 className="h-6 w-6" /> : <ListTodo className="h-6 w-6" />} title={tasks.length && filter === 'active' ? 'All done! 🎉' : 'Nothing here yet'}>
            {tasks.length ? 'Try another filter.' : 'Tasks are saved in this browser, so they’ll be here next time.'}
          </EmptyState>
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-line">
          {shown.map(({ t, i }) => (
            <li key={t.id} className="group flex items-center gap-3 py-2.5">
              <input type="checkbox" checked={t.done} onChange={(e) => patch(t.id, { done: e.target.checked })} className="h-5 w-5 shrink-0 cursor-pointer accent-[var(--accent)]" aria-label={`Mark “${t.text}” as ${t.done ? 'not done' : 'done'}`} />
              <div className="min-w-0 flex-1">
                {editing === t.id ? (
                  <input autoFocus defaultValue={t.text} onBlur={(e) => { patch(t.id, { text: e.target.value.trim() || t.text }); setEditing(null); }} onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); if (e.key === 'Escape') setEditing(null); }} className="w-full rounded-lg border border-accent bg-surface px-2 py-1 text-fg" aria-label="Edit task" />
                ) : (
                  <button type="button" onDoubleClick={() => setEditing(t.id)} onClick={() => setEditing(t.id)} className={cn('block w-full truncate text-left', t.done ? 'text-fg-subtle line-through' : 'text-fg')}>{t.text}</button>
                )}
                {t.due && <span className={cn('text-xs', !t.done && t.due < today ? 'font-semibold text-danger' : 'text-fg-subtle')}>Due {new Date(t.due + 'T00:00').toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}{!t.done && t.due < today ? ' · overdue' : ''}</span>}
              </div>
              <button type="button" onClick={() => patch(t.id, { priority: !t.priority })} aria-pressed={t.priority} aria-label="Mark as important" className={cn('text-lg leading-none', t.priority ? 'text-warning' : 'text-fg-subtle opacity-40 hover:opacity-100')}>★</button>
              <div className="flex">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up" icon={<ArrowUp className="h-4 w-4" />} />
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => move(i, 1)} disabled={i === tasks.length - 1} aria-label="Move down" icon={<ArrowDown className="h-4 w-4" />} />
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setTasks((ts) => ts.filter((x) => x.id !== t.id))} aria-label={`Delete “${t.text}”`} icon={<Trash2 className="h-4 w-4" />} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
