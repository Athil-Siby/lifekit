import { useState } from 'react';
import { Dices } from 'lucide-react';
import { randomInt, randomInts } from '../lib/random';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { CopyButton } from '../components/ui/CopyButton';
import { Checkbox, Input } from '../components/ui/Form';
import { Segmented } from '../components/ui/Segmented';
import { Notice } from '../components/ui/Notice';
import { cn } from '../lib/cn';

const DICE = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

export default function RandomNumber() {
  const [mode, setMode] = useState<'number' | 'dice' | 'coin'>('number');
  const [min, setMin] = useState('1');
  const [max, setMax] = useState('100');
  const [count, setCount] = useState('1');
  const [unique, setUnique] = useState(true);
  const [sort, setSort] = useState(false);
  const [diceCount, setDiceCount] = useState(2);
  const [result, setResult] = useState<number[]>([]);
  const [coin, setCoin] = useState<{ side: 'Heads' | 'Tails'; heads: number; tails: number }>({ side: 'Heads', heads: 0, tails: 0 });
  const [anim, setAnim] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const go = () => {
    setError(null);
    setAnim((a) => a + 1);
    try {
      if (mode === 'number') {
        const lo = Math.round(Number(min)), hi = Math.round(Number(max)), c = Math.min(1000, Math.max(1, Math.round(Number(count)) || 1));
        if (!Number.isFinite(lo) || !Number.isFinite(hi)) throw new Error('Enter whole numbers for the range.');
        let r = randomInts(lo, hi, c, unique);
        if (sort) r = [...r].sort((a, b) => a - b);
        setResult(r);
      } else if (mode === 'dice') setResult(Array.from({ length: diceCount }, () => randomInt(1, 6)));
      else {
        const side = randomInt(0, 1) ? 'Heads' : 'Tails';
        setCoin((c) => ({ side, heads: c.heads + (side === 'Heads' ? 1 : 0), tails: c.tails + (side === 'Tails' ? 1 : 0) }));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
      <Card className="h-fit space-y-5 p-5">
        <Segmented label="Mode" value={mode} onChange={(m) => { setMode(m); setResult([]); }} options={[{ value: 'number', label: 'Number' }, { value: 'dice', label: 'Dice' }, { value: 'coin', label: 'Coin' }]} className="w-full" />
        {mode === 'number' && (
          <>
            <div className="grid grid-cols-2 gap-2">
              <Input label="Min" inputMode="numeric" value={min} onChange={(e) => setMin(e.target.value)} />
              <Input label="Max" inputMode="numeric" value={max} onChange={(e) => setMax(e.target.value)} />
            </div>
            <Input label="How many numbers?" inputMode="numeric" value={count} onChange={(e) => setCount(e.target.value)} />
            <Checkbox checked={unique} onChange={setUnique} label="No repeats" />
            <Checkbox checked={sort} onChange={setSort} label="Sort from low to high" />
          </>
        )}
        {mode === 'dice' && (
          <div>
            <p className="mb-2 text-sm font-medium text-fg">Number of dice</p>
            <div className="flex gap-2">{[1, 2, 3, 4, 5, 6].map((d) => <Button key={d} variant={diceCount === d ? 'primary' : 'outline'} size="sm" onClick={() => setDiceCount(d)}>{d}</Button>)}</div>
          </div>
        )}
        <Button size="lg" className="w-full" onClick={go} icon={<Dices className="h-5 w-5" aria-hidden />}>{mode === 'number' ? 'Generate' : mode === 'dice' ? 'Roll' : 'Flip coin'}</Button>
        <p className="text-xs text-fg-subtle">Uses your browser’s secure random number generator, so every result is fair.</p>
      </Card>
      <Card className="flex min-h-[320px] flex-col items-center justify-center p-6 text-center" aria-live="polite">
        {error && <Notice tone="error">{error}</Notice>}
        {mode === 'number' && result.length > 0 && (
          result.length === 1 ? <p key={anim} className="animate-fade-up text-7xl font-bold tabular-nums text-accent-text sm:text-8xl">{result[0]}</p> : (
            <div className="w-full">
              <div key={anim} className="animate-fade-up flex max-h-[50vh] flex-wrap justify-center gap-2 overflow-y-auto">{result.map((n, i) => <span key={i} className="rounded-lg bg-accent-soft px-3 py-1.5 font-semibold tabular-nums text-accent-text">{n}</span>)}</div>
              <CopyButton className="mt-4" text={result.join(', ')} />
            </div>
          )
        )}
        {mode === 'dice' && result.length > 0 && (
          <div key={anim} className="animate-fade-up">
            <div className="flex flex-wrap justify-center gap-2 text-8xl leading-none text-fg">{result.map((d, i) => <span key={i} aria-label={`${d}`}>{DICE[d - 1]}</span>)}</div>
            <p className="mt-4 text-lg text-fg-muted">Total: <strong className="text-fg">{result.reduce((a, b) => a + b, 0)}</strong></p>
          </div>
        )}
        {mode === 'coin' && (coin.heads + coin.tails > 0 ? (
          <div>
            <div key={anim} className={cn('mx-auto flex h-36 w-36 items-center justify-center rounded-full text-2xl font-bold text-white shadow-lg animate-[spin_0.6s_ease-out]', coin.side === 'Heads' ? 'bg-amber-500' : 'bg-slate-500')}>{coin.side}</div>
            <p className="mt-4 text-sm text-fg-muted">Heads {coin.heads} · Tails {coin.tails}</p>
          </div>
        ) : <p className="text-fg-muted">Press “Flip coin”.</p>)}
        {mode !== 'coin' && result.length === 0 && !error && <p className="text-fg-muted">Your result will appear here.</p>}
      </Card>
    </div>
  );
}
