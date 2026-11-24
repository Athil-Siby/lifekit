import { useRef, useState } from 'react';
import { readStorage, writeStorage } from '../lib/storage';
import { Card } from '../components/ui/Card';
import { cn } from '../lib/cn';

type State = 'idle' | 'waiting' | 'go' | 'early' | 'result';

export default function ReactionTime() {
  const [state, setState] = useState<State>('idle');
  const [ms, setMs] = useState(0);
  const [tries, setTries] = useState<number[]>([]);
  const [best, setBest] = useState(() => readStorage<number>('reaction-best', 0));
  const t0 = useRef(0), timer = useRef<number>(0);
  const press = () => {
    if (state === 'idle' || state === 'result' || state === 'early') {
      setState('waiting');
      timer.current = window.setTimeout(() => { t0.current = performance.now(); setState('go'); }, 1500 + Math.random() * 3000);
    } else if (state === 'waiting') {
      clearTimeout(timer.current); setState('early');
    } else if (state === 'go') {
      const r = Math.round(performance.now() - t0.current);
      setMs(r); setTries((t) => [...t.slice(-4), r]); setState('result');
      if (!best || r < best) { setBest(r); writeStorage('reaction-best', r); }
    }
  };
  const avg = tries.length ? Math.round(tries.reduce((a, b) => a + b, 0) / tries.length) : 0;
  const bg = { idle: 'bg-accent', waiting: 'bg-red-600', go: 'bg-emerald-500', early: 'bg-amber-500', result: 'bg-accent' }[state];
  const msg = { idle: ['Reaction time test', 'Tap anywhere to start. When the box turns green, tap as fast as you can.'], waiting: ['Wait for green…', ''], go: ['TAP!', ''], early: ['Too soon!', 'Tap to try again.'], result: [`${ms} ms`, ms < 200 ? 'Lightning fast ⚡ Tap to go again.' : ms < 280 ? 'Great reflexes! Tap to go again.' : 'Tap to go again – the average is about 250 ms.'] }[state];
  return (
    <div className="space-y-4">
      <button type="button" onPointerDown={press} className={cn('flex h-[52vh] min-h-[300px] w-full select-none flex-col items-center justify-center rounded-3xl text-center text-white transition-colors', bg, state === 'idle' || state === 'result' ? 'text-accent-fg' : '')} aria-live="assertive">
        <span className="text-5xl font-bold sm:text-7xl">{msg[0]}</span>
        {msg[1] && <span className="mt-4 max-w-md px-6 text-lg opacity-90">{msg[1]}</span>}
      </button>
      <div className="grid grid-cols-3 gap-3">
        {[['Last 5 average', avg ? `${avg} ms` : '–'], ['Your best', best ? `${best} ms` : '–'], ['Tries', String(tries.length)]].map(([l, v]) => <Card key={l} className="p-4 text-center"><p className="text-xs text-fg-subtle">{l}</p><p className="text-2xl font-bold tabular-nums text-fg">{v}</p></Card>)}
      </div>
    </div>
  );
}
