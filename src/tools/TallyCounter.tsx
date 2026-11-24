import { useEffect, useState } from 'react';
import { Minus, Plus, RotateCcw } from 'lucide-react';
import { readStorage, writeStorage } from '../lib/storage';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export default function TallyCounter() {
  const [count, setCount] = useState(() => readStorage<number>('tally', 0));
  const [step, setStep] = useState(1);
  useEffect(() => writeStorage('tally', count), [count]);
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if ((e.target as HTMLElement).closest('input,textarea,select')) return; if (e.key === ' ' || e.key === 'ArrowUp' || e.key === '+') { e.preventDefault(); setCount((c) => c + step); } if (e.key === 'ArrowDown' || e.key === '-') setCount((c) => c - step); };
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k);
  }, [step]);
  const tap = () => { setCount((c) => c + step); navigator.vibrate?.(10); };
  return (
    <Card className="mx-auto flex max-w-md flex-col items-center gap-6 p-6">
      <button type="button" onClick={tap} className="flex h-64 w-64 select-none flex-col items-center justify-center rounded-full bg-accent text-accent-fg shadow-xl transition-transform active:scale-95" aria-label={`Count is ${count}. Tap to add ${step}.`}>
        <span className="text-7xl font-bold tabular-nums">{count}</span>
        <span className="mt-2 text-sm opacity-80">tap to count</span>
      </button>
      <div className="flex gap-2">
        <Button variant="outline" size="lg" onClick={() => setCount((c) => c - step)} aria-label="Subtract" icon={<Minus className="h-5 w-5" />} />
        <Button variant="outline" size="lg" onClick={() => setCount((c) => c + step)} aria-label="Add" icon={<Plus className="h-5 w-5" />} />
        <Button variant="outline" size="lg" onClick={() => count && confirm('Reset the counter to 0?') && setCount(0)} icon={<RotateCcw className="h-5 w-5" aria-hidden />}>Reset</Button>
      </div>
      <div className="flex items-center gap-2 text-sm text-fg-muted">Count by {[1, 5, 10].map((s) => <Button key={s} size="sm" variant={step === s ? 'primary' : 'ghost'} onClick={() => setStep(s)}>{s}</Button>)}</div>
      <p className="text-xs text-fg-subtle">Saved on this device. On a computer, press Space or ↑ to count.</p>
    </Card>
  );
}
