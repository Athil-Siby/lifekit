import { useEffect, useMemo, useRef, useState } from 'react';
import { Keyboard, RotateCcw, Trophy } from 'lucide-react';
import { scoreTyping, wordStream } from '../lib/typing';
import { readStorage, writeStorage } from '../lib/storage';
import { useTicker } from '../hooks/useTicker';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Stat } from '../components/ui/Misc';
import { Segmented } from '../components/ui/Segmented';
import { cn } from '../lib/cn';

export default function TypingTest() {
  const [duration, setDuration] = useState<'15' | '30' | '60' | '120'>('60');
  const [words, setWords] = useState(() => wordStream(300));
  const [typed, setTyped] = useState<string[]>(['']);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);
  const [best, setBest] = useState(() => readStorage<number>('typing-best', 0));
  const inputRef = useRef<HTMLInputElement>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const now = useTicker(startedAt !== null && !finished, 200);
  const total = Number(duration);
  const elapsed = startedAt ? Math.min(total, (now - startedAt) / 1000) : 0;
  const left = Math.max(0, Math.ceil(total - elapsed));

  const score = useMemo(() => scoreTyping(words, typed, startedAt ? Math.max(1, finished ? total : elapsed) : 1), [words, typed, elapsed, finished, total, startedAt]);

  useEffect(() => {
    if (startedAt && !finished && elapsed >= total) {
      setFinished(true);
      const committed = typed[typed.length - 1] ? [...typed, ''] : typed;
      setTyped(committed);
      const final = scoreTyping(words, committed, total);
      if (final.wpm > best) { setBest(final.wpm); writeStorage('typing-best', final.wpm); }
    }
  }, [elapsed, total, startedAt, finished]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { wordRefs.current[typed.length - 1]?.scrollIntoView({ block: 'nearest' }); }, [typed.length]);

  const reset = () => {
    setWords(wordStream(300));
    setTyped(['']);
    setStartedAt(null);
    setFinished(false);
    setTimeout(() => inputRef.current?.focus(), 0);
  };
  useEffect(reset, [duration]); // eslint-disable-line react-hooks/exhaustive-deps

  const onChange = (v: string) => {
    if (finished) return;
    if (!startedAt) setStartedAt(Date.now());
    if (v.endsWith(' ')) {
      const w = v.trim();
      if (!w) return;
      setTyped((t) => [...t.slice(0, -1), w, '']);
    } else setTyped((t) => [...t.slice(0, -1), v]);
  };
  const current = typed.length - 1;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Segmented label="Test length" value={duration} onChange={setDuration} options={[{ value: '15', label: '15s' }, { value: '30', label: '30s' }, { value: '60', label: '1 min' }, { value: '120', label: '2 min' }]} />
        <div className="flex items-center gap-4">
          {best > 0 && <span className="inline-flex items-center gap-1.5 text-sm text-fg-muted"><Trophy className="h-4 w-4 text-warning" aria-hidden /> Best: {best} WPM</span>}
          <Button variant="outline" onClick={reset} icon={<RotateCcw className="h-4 w-4" aria-hidden />}>Restart</Button>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Time left" value={`${left}s`} highlight={!!startedAt && !finished} />
        <Stat label="Words per minute" value={startedAt ? score.wpm : '–'} />
        <Stat label="Accuracy" value={startedAt ? `${score.accuracy}%` : '–'} />
      </div>
      {finished ? (
        <Card className="animate-fade-up p-8 text-center">
          <Trophy className="mx-auto h-12 w-12 text-warning" aria-hidden />
          <p className="mt-3 text-5xl font-bold text-fg">{score.wpm} <span className="text-2xl font-semibold text-fg-muted">WPM</span></p>
          <p className="mt-2 text-fg-muted">{score.accuracy}% accuracy · {score.correctWords} correct words · {score.wrongWords} mistakes</p>
          <p className="mt-1 text-sm text-fg-subtle">{score.wpm >= 70 ? 'Excellent – that’s faster than most professional typists!' : score.wpm >= 40 ? 'Nice! That’s above the average typing speed.' : 'Keep practising – the average is about 40 WPM.'}</p>
          <Button size="lg" className="mt-6" onClick={reset} icon={<RotateCcw className="h-5 w-5" aria-hidden />}>Try again</Button>
        </Card>
      ) : (
        <Card className="p-5 sm:p-6" onClick={() => inputRef.current?.focus()}>
          <div className="h-[9.5rem] overflow-hidden text-xl leading-[2.4rem] sm:text-2xl sm:leading-[2.6rem]" aria-hidden>
            {words.map((w, i) => {
              const t = typed[i];
              const isCur = i === current;
              return (
                <span key={i} ref={(el) => { wordRefs.current[i] = el; }} className={cn('mr-[0.5em] inline-block rounded px-0.5', isCur && 'bg-accent-soft')}>
                  {w.split('').map((ch, k) => {
                    const tc = t?.[k];
                    return <span key={k} className={cn(tc === undefined ? (i < current ? 'text-danger' : 'text-fg-subtle') : tc === ch ? 'text-fg' : 'text-danger')}>{ch}</span>;
                  })}
                  {t && t.length > w.length && <span className="text-danger">{t.slice(w.length)}</span>}
                </span>
              );
            })}
          </div>
          <input ref={inputRef} autoFocus value={typed[current]} onChange={(e) => onChange(e.target.value)} autoCapitalize="off" autoCorrect="off" autoComplete="off" spellCheck={false}
            aria-label="Type the words shown, pressing space after each word"
            className="mt-4 h-12 w-full rounded-xl border border-line bg-surface-2 px-4 text-lg text-fg focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/15"
            placeholder={startedAt ? '' : 'Start typing to begin the test…'} />
          <p className="mt-3 flex items-center gap-2 text-xs text-fg-subtle"><Keyboard className="h-4 w-4" aria-hidden /> Press space after each word. The timer starts with your first key.</p>
        </Card>
      )}
    </div>
  );
}
