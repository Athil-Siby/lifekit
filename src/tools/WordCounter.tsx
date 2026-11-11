import { useDeferredValue, useMemo, useState } from 'react';
import { Eraser } from 'lucide-react';
import { formatDuration, getTextStats } from '../lib/textStats';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { CopyButton } from '../components/ui/CopyButton';
import { Stat } from '../components/ui/Misc';

export default function WordCounter() {
  const [text, setText] = useState('');
  const deferred = useDeferredValue(text);
  const s = useMemo(() => getTextStats(deferred), [deferred]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <Card className="p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <label htmlFor="wc-text" className="text-sm font-medium text-fg">Your text</label>
          <div className="flex gap-2">
            <CopyButton text={text} message="Text copied" />
            <Button variant="outline" size="sm" onClick={() => setText('')} disabled={!text} icon={<Eraser className="h-4 w-4" aria-hidden />}>
              Clear
            </Button>
          </div>
        </div>
        <textarea
          id="wc-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Start typing or paste your text here…"
          className="min-h-[360px] w-full resize-y rounded-xl border border-line bg-surface-2 p-4 leading-relaxed text-fg placeholder:text-fg-subtle focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/15"
          spellCheck
        />
      </Card>
      <div className="space-y-3" aria-live="polite">
        <div className="grid grid-cols-2 gap-3">
          <Stat label="Words" value={s.words.toLocaleString()} highlight />
          <Stat label="Characters" value={s.characters.toLocaleString()} />
          <Stat label="No spaces" value={s.charactersNoSpaces.toLocaleString()} sub="Characters excl. spaces" />
          <Stat label="Sentences" value={s.sentences.toLocaleString()} />
          <Stat label="Paragraphs" value={s.paragraphs.toLocaleString()} />
          <Stat label="Lines" value={s.lines.toLocaleString()} />
        </div>
        <Card className="p-4">
          <dl className="space-y-2.5 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-fg-muted">Reading time</dt>
              <dd className="font-semibold text-fg tabular-nums">{s.words ? formatDuration(s.readingMinutes) : '—'}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-fg-muted">Speaking time</dt>
              <dd className="font-semibold text-fg tabular-nums">{s.words ? formatDuration(s.speakingMinutes) : '—'}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-fg-muted">Avg. word length</dt>
              <dd className="font-semibold text-fg tabular-nums">
                {s.words ? `${(s.charactersNoSpaces / s.words).toFixed(1)} chars` : '—'}
              </dd>
            </div>
          </dl>
        </Card>
        <p className="text-xs text-fg-subtle">Reading time assumes 238 words per minute; speaking time assumes 150.</p>
      </div>
    </div>
  );
}
