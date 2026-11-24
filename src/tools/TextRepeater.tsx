import { useState } from 'react';
import { repeatText } from '../lib/misc2';
import { Card } from '../components/ui/Card';
import { CopyButton } from '../components/ui/CopyButton';
import { Input } from '../components/ui/Form';
import { Segmented } from '../components/ui/Segmented';

export default function TextRepeater() {
  const [text, setText] = useState('Happy Birthday! 🎉');
  const [times, setTimes] = useState('10');
  const [sep, setSep] = useState<'newline' | 'space' | 'comma' | 'none'>('newline');
  const out = text ? repeatText(text, Number(times) || 1, sep) : '';
  return (
    <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
      <Card className="h-fit space-y-4 p-5">
        <Input label="Text to repeat" value={text} onChange={(e) => setText(e.target.value)} maxLength={500} />
        <Input label="How many times? (up to 10,000)" inputMode="numeric" value={times} onChange={(e) => setTimes(e.target.value)} />
        <Segmented label="Separate with" value={sep} onChange={setSep} options={[{ value: 'newline', label: 'New line' }, { value: 'space', label: 'Space' }, { value: 'comma', label: 'Comma' }, { value: 'none', label: 'Nothing' }]} className="w-full" />
      </Card>
      <Card className="p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between"><span className="text-xs text-fg-subtle">{out.length.toLocaleString()} characters</span><CopyButton text={out} variant="primary" /></div>
        <pre className="max-h-[60vh] min-h-[200px] overflow-auto whitespace-pre-wrap break-words rounded-xl bg-surface-2 p-4 font-sans text-fg">{out.length > 200000 ? out.slice(0, 200000) + '…' : out}</pre>
      </Card>
    </div>
  );
}
