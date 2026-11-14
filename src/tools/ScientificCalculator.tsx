import { useEffect, useState } from 'react';
import { History } from 'lucide-react';
import { evaluateSci } from '../lib/scicalc';
import { Card } from '../components/ui/Card';
import { CopyButton } from '../components/ui/CopyButton';
import { Segmented } from '../components/ui/Segmented';
import { cn } from '../lib/cn';

type Key = { label: string; insert?: string; action?: 'clear' | 'back' | 'eval' | 'ans'; kind?: 'fn' | 'op' | 'num' | 'eq' };
const KEYS: Key[] = [
  { label: 'sin', insert: 'sin(', kind: 'fn' }, { label: 'cos', insert: 'cos(', kind: 'fn' }, { label: 'tan', insert: 'tan(', kind: 'fn' }, { label: '(', insert: '(', kind: 'fn' }, { label: ')', insert: ')', kind: 'fn' },
  { label: 'sin⁻¹', insert: 'asin(', kind: 'fn' }, { label: 'cos⁻¹', insert: 'acos(', kind: 'fn' }, { label: 'tan⁻¹', insert: 'atan(', kind: 'fn' }, { label: 'xʸ', insert: '^', kind: 'fn' }, { label: 'x²', insert: '^2', kind: 'fn' },
  { label: 'ln', insert: 'ln(', kind: 'fn' }, { label: 'log', insert: 'log(', kind: 'fn' }, { label: '√', insert: '√(', kind: 'fn' }, { label: 'n!', insert: '!', kind: 'fn' }, { label: 'π', insert: 'π', kind: 'fn' },
  { label: 'AC', action: 'clear', kind: 'op' }, { label: '⌫', action: 'back', kind: 'op' }, { label: '%', insert: '%', kind: 'op' }, { label: '÷', insert: '÷', kind: 'op' }, { label: 'e', insert: 'e', kind: 'fn' },
  { label: '7', insert: '7' }, { label: '8', insert: '8' }, { label: '9', insert: '9' }, { label: '×', insert: '×', kind: 'op' }, { label: 'Ans', action: 'ans', kind: 'fn' },
  { label: '4', insert: '4' }, { label: '5', insert: '5' }, { label: '6', insert: '6' }, { label: '−', insert: '−', kind: 'op' }, { label: 'EXP', insert: '×10^', kind: 'fn' },
  { label: '1', insert: '1' }, { label: '2', insert: '2' }, { label: '3', insert: '3' }, { label: '+', insert: '+', kind: 'op' }, { label: '=', action: 'eval', kind: 'eq' },
  { label: '0', insert: '0' }, { label: '.', insert: '.' }, { label: '00', insert: '00' },
];

const fmt = (v: number) => (Math.abs(v) >= 1e15 || (Math.abs(v) < 1e-9 && v !== 0) ? v.toExponential(10).replace(/\.?0+e/, 'e') : String(v));

export default function ScientificCalculator() {
  const [expr, setExpr] = useState('');
  const [angle, setAngle] = useState<'deg' | 'rad'>('deg');
  const [ans, setAns] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<{ e: string; r: string }[]>([]);

  const preview = (() => { try { return expr ? fmt(evaluateSci(expr.replace(/Ans/g, `(${ans})`), angle)) : ''; } catch { return ''; } })();

  const press = (k: Key) => {
    setError(null);
    if (k.action === 'clear') { setExpr(''); setResult(null); return; }
    if (k.action === 'back') { setExpr((x) => x.replace(/(Ans|asin\(|acos\(|atan\(|sin\(|cos\(|tan\(|log\(|ln\(|√\(|.)$/, '')); return; }
    if (k.action === 'ans') { setExpr((x) => (result !== null && x === '' ? 'Ans' : x + 'Ans')); return; }
    if (k.action === 'eval') {
      if (!expr) return;
      try {
        const v = evaluateSci(expr.replace(/Ans/g, `(${ans})`), angle);
        setAns(v);
        setResult(fmt(v));
        setHistory((h) => [{ e: expr, r: fmt(v) }, ...h].slice(0, 30));
        setExpr('');
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error');
      }
      return;
    }
    // Start a new calculation with the last answer when an operator is pressed first.
    setExpr((x) => (x === '' && result !== null && k.kind === 'op' ? 'Ans' + k.insert : x + k.insert));
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest('input, textarea, select')) return;
      const map: Record<string, Key | undefined> = { Enter: KEYS.find((k) => k.label === '='), '=': KEYS.find((k) => k.label === '='), Backspace: KEYS.find((k) => k.label === '⌫'), Escape: KEYS.find((k) => k.label === 'AC'), '*': { label: '×', insert: '×', kind: 'op' }, '/': { label: '÷', insert: '÷', kind: 'op' }, '-': { label: '−', insert: '−', kind: 'op' } };
      const k = map[e.key] ?? (/^[0-9.+()^!%]$/.test(e.key) ? { label: e.key, insert: e.key, kind: '+'.includes(e.key) ? 'op' as const : undefined } : undefined);
      if (k) { e.preventDefault(); press(k); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,480px)_1fr]">
      <Card className="p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between">
          <Segmented label="Angle unit" value={angle} onChange={setAngle} options={[{ value: 'deg', label: 'DEG' }, { value: 'rad', label: 'RAD' }]} />
          <CopyButton text={result ?? ''} label="Copy result" variant="ghost" />
        </div>
        <div className="mb-4 rounded-2xl bg-surface-2 p-4 text-right" aria-live="polite">
          <div className="min-h-6 break-all font-mono text-lg text-fg-muted">{expr || (result !== null ? 'Ans' : '0')}</div>
          <div className={cn('mt-1 min-h-10 break-all text-4xl font-bold tabular-nums', error ? 'text-base font-medium text-danger' : 'text-fg')}>{error ?? (expr ? preview : result ?? '0')}</div>
        </div>
        <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
          {KEYS.map((k) => (
            <button key={k.label} type="button" onClick={() => press(k)} aria-label={k.label === '⌫' ? 'Delete' : k.label}
              className={cn('h-12 rounded-xl text-base font-medium transition-colors active:scale-95 sm:h-13',
                k.kind === 'fn' && 'bg-surface-3 text-sm text-fg hover:bg-line',
                k.kind === 'op' && 'bg-accent-soft text-accent-text hover:bg-accent/20',
                k.kind === 'eq' && 'row-span-2 h-auto bg-accent text-2xl text-accent-fg hover:bg-accent-hover',
                !k.kind && 'border border-line bg-surface text-lg text-fg hover:bg-surface-2')}>
              {k.label}
            </button>
          ))}
        </div>
      </Card>
      <Card className="h-fit overflow-hidden">
        <h2 className="flex items-center gap-2 border-b border-line px-5 py-3.5 text-sm font-semibold text-fg"><History className="h-4 w-4" aria-hidden /> History</h2>
        {history.length === 0 ? <p className="p-5 text-sm text-fg-subtle">Your calculations will appear here. Tap one to reuse the answer.</p> : (
          <ul className="max-h-[480px] divide-y divide-line overflow-y-auto">
            {history.map((h, i) => (
              <li key={i}><button type="button" onClick={() => setExpr((x) => x + h.r)} className="flex w-full justify-between gap-3 px-5 py-2.5 text-left hover:bg-surface-2"><span className="truncate font-mono text-sm text-fg-muted">{h.e}</span><span className="font-semibold tabular-nums text-fg">= {h.r}</span></button></li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
