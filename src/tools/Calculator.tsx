import { useCallback, useEffect, useState } from 'react';
import { Delete, History } from 'lucide-react';
import { CalcError, evaluate } from '../lib/calculator';
import { formatNumber } from '../utils/format';
import { Card } from '../components/ui/Card';
import { CopyButton } from '../components/ui/CopyButton';
import { cn } from '../lib/cn';

type Key = { label: string; value: string; kind?: 'op' | 'fn' | 'eq' | 'num'; aria?: string; wide?: boolean };

const KEYS: Key[] = [
  { label: 'AC', value: 'clear', kind: 'fn', aria: 'Clear all' },
  { label: '( )', value: 'paren', kind: 'fn', aria: 'Brackets' },
  { label: '%', value: '%', kind: 'fn', aria: 'Percent' },
  { label: '÷', value: '÷', kind: 'op', aria: 'Divide' },
  { label: '7', value: '7' }, { label: '8', value: '8' }, { label: '9', value: '9' },
  { label: '×', value: '×', kind: 'op', aria: 'Multiply' },
  { label: '4', value: '4' }, { label: '5', value: '5' }, { label: '6', value: '6' },
  { label: '−', value: '−', kind: 'op', aria: 'Subtract' },
  { label: '1', value: '1' }, { label: '2', value: '2' }, { label: '3', value: '3' },
  { label: '+', value: '+', kind: 'op', aria: 'Add' },
  { label: '±', value: 'neg', kind: 'fn', aria: 'Plus or minus' },
  { label: '0', value: '0' },
  { label: '.', value: '.', aria: 'Decimal point' },
  { label: '=', value: '=', kind: 'eq', aria: 'Equals' },
];

const isOp = (c: string) => '+−×÷'.includes(c);

export default function Calculator() {
  const [expr, setExpr] = useState('');
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [justEvaluated, setJustEvaluated] = useState(false);
  const [history, setHistory] = useState<{ expr: string; result: string }[]>([]);


  // Live preview of the result while typing.
  useEffect(() => {
    setError(null);
    if (!expr || justEvaluated) return;
    try {
      const v = evaluate(expr);
      setResult(formatNumber(v, 12));
    } catch {
      setResult('');
    }
  }, [expr, justEvaluated]);

  const press = useCallback(
    (v: string) => {
      setError(null);
      if (v === 'clear') {
        setExpr('');
        setResult('');
        setJustEvaluated(false);
        return;
      }
      if (v === 'back') {
        setJustEvaluated(false);
        setExpr((e) => e.slice(0, -1));
        return;
      }
      if (v === '=') {
        if (!expr) return;
        try {
          const val = evaluate(expr);
          const r = formatNumber(val, 12);
          setHistory((h) => [{ expr, result: r }, ...h].slice(0, 20));
          setResult(r);
          setExpr(String(val));
          setJustEvaluated(true);
        } catch (e) {
          setError(e instanceof CalcError ? e.message : 'Invalid expression');
        }
        return;
      }
      setExpr((e) => {
        let cur = e;
        if (justEvaluated && !isOp(v) && v !== '%') cur = ''; // start fresh after "=" when typing a number
        setJustEvaluated(false);
        if (v === 'neg') {
          if (!cur) return '−';
          const num = cur.match(/(\d*\.?\d+%?)$/);
          if (!num) return cur;
          const start = cur.length - num[1].length;
          const before = cur.slice(0, start);
          if (before.endsWith('(−')) return before.slice(0, -2) + num[1];
          return `${before}(−${num[1]}`;
        }
        if (v === 'paren') {
          const open = (cur.match(/\(/g) ?? []).length - (cur.match(/\)/g) ?? []).length;
          const last = cur.slice(-1);
          return open > 0 && /[\d)%]/.test(last) ? cur + ')' : cur + (/[\d)%]/.test(last) ? '×(' : '(');
        }
        if (isOp(v)) {
          if (!cur) return v === '−' ? '−' : cur;
          if (isOp(cur.slice(-1))) return cur.slice(0, -1) + v;
          return cur + v;
        }
        if (v === '.') {
          const lastNum = cur.split(/[+−×÷()%]/).pop() ?? '';
          if (lastNum.includes('.')) return cur;
          return cur + (lastNum === '' ? '0.' : '.');
        }
        if (v === '%') return /[\d)]$/.test(cur) ? cur + '%' : cur;
        return cur + v;
      });
    },
    [expr, justEvaluated],
  );

  // Keyboard support when the calculator (or the page body) has focus.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName) || e.metaKey || e.ctrlKey || e.altKey) return;
      const map: Record<string, string> = { '*': '×', x: '×', '/': '÷', '-': '−', '+': '+', Enter: '=', '=': '=', Backspace: 'back', Escape: 'clear', ',': '.' };
      let v: string | undefined;
      if (/^[0-9.%]$/.test(e.key)) v = e.key;
      else if (e.key === '(' || e.key === ')') v = 'paren';
      else v = map[e.key];
      if (!v) return;
      e.preventDefault();
      press(v);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [press]);

  return (
    <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
      <Card className="mx-auto w-full max-w-[420px] p-4 sm:p-5">
        <div className="mb-4 rounded-2xl bg-surface-3 px-4 py-4 text-right" aria-live="polite">
          <div className="min-h-[1.5rem] overflow-x-auto whitespace-nowrap text-lg text-fg-muted tabular-nums">{expr || '0'}</div>
          <div className={cn('mt-1 min-h-[2.75rem] overflow-x-auto whitespace-nowrap text-4xl font-semibold tabular-nums', error ? 'text-danger text-xl leading-[2.75rem]' : 'text-fg')}>
            {error ?? (result ? `${justEvaluated ? '' : '= '}${result}` : '')}
          </div>
        </div>
        <div className="mb-3 flex items-center justify-between">
          <CopyButton text={result} size="sm" variant="ghost" label="Copy result" />
          <button type="button" onClick={() => press('back')} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-fg-muted hover:bg-surface-3 hover:text-fg" aria-label="Delete last character">
            <Delete className="h-4 w-4" aria-hidden /> Delete
          </button>
        </div>
        <div className="grid grid-cols-4 gap-2.5">
          {KEYS.map((k) => (
            <button
              key={k.label}
              type="button"
              onClick={() => press(k.value)}
              aria-label={k.aria ?? k.label}
              className={cn(
                'h-16 rounded-2xl text-2xl font-medium transition-all active:scale-95 sm:h-[4.25rem]',
                k.kind === 'op' && 'bg-accent-soft text-accent-text hover:brightness-95 dark:hover:brightness-125',
                k.kind === 'fn' && 'bg-surface-3 text-fg hover:bg-line',
                k.kind === 'eq' && 'bg-accent text-accent-fg hover:bg-accent-hover',
                !k.kind && 'border border-line bg-surface text-fg hover:bg-surface-2',
              )}
            >
              {k.label}
            </button>
          ))}
        </div>
        <p className="mt-3 text-center text-xs text-fg-subtle">Tip: you can type with your keyboard. Enter = calculate, Esc = clear.</p>
      </Card>
      <Card className="h-fit p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-fg">
          <History className="h-4 w-4 text-fg-subtle" aria-hidden /> History
        </h2>
        {history.length === 0 ? (
          <p className="mt-3 text-sm text-fg-subtle">Your calculations will appear here. Tap one to use its result.</p>
        ) : (
          <ul className="mt-3 divide-y divide-line">
            {history.map((h, i) => (
              <li key={i}>
                <button
                  type="button"
                  className="flex w-full items-baseline justify-between gap-4 rounded-lg px-2 py-2.5 text-left hover:bg-surface-2"
                  onClick={() => {
                    setExpr(h.result.replace(/,/g, ''));
                    setResult(h.result);
                    setJustEvaluated(true);
                  }}
                >
                  <span className="min-w-0 truncate text-sm text-fg-muted tabular-nums">{h.expr}</span>
                  <span className="shrink-0 font-semibold text-fg tabular-nums">= {h.result}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
