import { useState } from 'react';
import { ArrowDownUp, ArrowUp, CaseLower, CaseSensitive, CaseUpper, Eraser, Heading, ListX, Repeat, Rows3, Space, Undo2 } from 'lucide-react';
import {
  removeDuplicateLines, removeExtraSpaces, reverseLines, reverseText, sortLines, toLower, toSentenceCase, toTitleCase, toUpper,
} from '../lib/textFormat';
import { consumeHashParams, readParam } from '../lib/hashParams';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { CopyButton } from '../components/ui/CopyButton';
import { Checkbox } from '../components/ui/Form';
import { useToast } from '../components/ui/Toast';

type Action = { id: string; label: string; icon: typeof CaseUpper; run: (t: string, o: Opts) => string };
interface Opts {
  ignoreCase: boolean;
  descending: boolean;
}

const actions: Action[] = [
  { id: 'upper', label: 'UPPERCASE', icon: CaseUpper, run: toUpper },
  { id: 'lower', label: 'lowercase', icon: CaseLower, run: toLower },
  { id: 'title', label: 'Title Case', icon: Heading, run: toTitleCase },
  { id: 'sentence', label: 'Sentence case', icon: CaseSensitive, run: toSentenceCase },
  { id: 'spaces', label: 'Remove extra spaces', icon: Space, run: removeExtraSpaces },
  { id: 'dupes', label: 'Remove duplicate lines', icon: ListX, run: (t, o) => removeDuplicateLines(t, { ignoreCase: o.ignoreCase }) },
  { id: 'sort', label: 'Sort lines A–Z', icon: ArrowDownUp, run: (t, o) => sortLines(t, { descending: o.descending }) },
  { id: 'reverse', label: 'Reverse text', icon: Repeat, run: reverseText },
  { id: 'reverseLines', label: 'Reverse line order', icon: Rows3, run: reverseLines },
];

const areaCls =
  'min-h-[260px] w-full resize-y rounded-xl border border-line bg-surface-2 p-4 font-mono text-sm leading-relaxed text-fg placeholder:text-fg-subtle focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/15';

export default function TextFormatter() {
  const [input, setInput] = useState(() => readParam(consumeHashParams(), 'text') ?? '');
  const [output, setOutput] = useState('');
  const [last, setLast] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [opts, setOpts] = useState<Opts>({ ignoreCase: false, descending: false });
  const toast = useToast();

  const apply = (a: Action) => {
    if (!input) {
      toast.info('Paste or type some text first.');
      return;
    }
    const result = a.run(input, opts);
    setOutput(result);
    setLast(a.label);
    if (result === input) toast.info(`“${a.label}” made no changes to this text.`);
  };

  const useAsInput = () => {
    setHistory((h) => [...h.slice(-19), input]);
    setInput(output);
    setOutput('');
    setLast(null);
  };

  const undo = () => {
    const prev = history[history.length - 1];
    if (prev === undefined) return;
    setHistory((h) => h.slice(0, -1));
    setInput(prev);
  };

  return (
    <div className="space-y-5">
      <Card className="p-4 sm:p-5">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Formatting actions">
          {actions.map((a) => (
            <Button key={a.id} variant="outline" size="sm" onClick={() => apply(a)} icon={<a.icon className="h-4 w-4" aria-hidden />}>
              {a.label}
            </Button>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3 border-t border-line pt-4">
          <Checkbox checked={opts.ignoreCase} onChange={(v) => setOpts((o) => ({ ...o, ignoreCase: v }))} label="Ignore case when removing duplicates" />
          <Checkbox checked={opts.descending} onChange={(v) => setOpts((o) => ({ ...o, descending: v }))} label="Sort Z–A instead" />
        </div>
      </Card>
      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <label htmlFor="tf-input" className="text-sm font-medium text-fg">Input</label>
            <div className="flex gap-2">
              {history.length > 0 && (
                <Button variant="ghost" size="sm" onClick={undo} icon={<Undo2 className="h-4 w-4" aria-hidden />}>Undo</Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setInput('');
                  setOutput('');
                  setLast(null);
                  setHistory([]);
                }}
                disabled={!input && !output}
                icon={<Eraser className="h-4 w-4" aria-hidden />}
              >
                Clear
              </Button>
            </div>
          </div>
          <textarea id="tf-input" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Paste your text here…" className={areaCls} />
        </Card>
        <Card className="p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <label htmlFor="tf-output" className="text-sm font-medium text-fg">
              Output {last && <span className="font-normal text-fg-subtle">· {last}</span>}
            </label>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={useAsInput} disabled={!output} icon={<ArrowUp className="h-4 w-4" aria-hidden />}>
                Use as input
              </Button>
              <CopyButton text={output} variant="primary" message="Output copied" />
            </div>
          </div>
          <textarea id="tf-output" value={output} readOnly placeholder="Choose an action to see the result here." className={areaCls} />
        </Card>
      </div>
    </div>
  );
}
