import { useState } from 'react';
import { FANCY_STYLES } from '../lib/fancyText';
import { Card } from '../components/ui/Card';
import { CopyButton } from '../components/ui/CopyButton';

export default function FancyText() {
  const [text, setText] = useState('Life is beautiful');
  return (
    <div className="space-y-5">
      <Card className="p-4 sm:p-5">
        <label htmlFor="fancy-in" className="mb-2 block text-sm font-medium text-fg">Type your text</label>
        <input id="fancy-in" value={text} onChange={(e) => setText(e.target.value)} maxLength={300} className="h-12 w-full rounded-xl border border-line bg-surface-2 px-4 text-lg text-fg focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/15" placeholder="Type something…" />
        <p className="mt-2 text-xs text-fg-subtle">Copy any style and paste it into your Instagram bio, captions, WhatsApp or games. Some apps may not show every style.</p>
      </Card>
      <Card className="divide-y divide-line">
        {FANCY_STYLES.map((s) => {
          const out = s.fn(text || 'Preview');
          return (
            <div key={s.name} className="flex items-center gap-3 px-4 py-3 sm:px-5">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-fg-subtle">{s.name}</p>
                <p className="truncate text-xl text-fg">{out}</p>
              </div>
              <CopyButton text={out} label="Copy" />
            </div>
          );
        })}
      </Card>
    </div>
  );
}
