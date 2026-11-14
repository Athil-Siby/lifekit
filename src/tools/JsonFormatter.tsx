import { useState } from 'react';
import { Download, Minimize2, Wand2 } from 'lucide-react';
import { formatJson } from '../lib/encode';
import { downloadText } from '../utils/download';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { CopyButton } from '../components/ui/CopyButton';
import { Select } from '../components/ui/Form';
import { Notice } from '../components/ui/Notice';

const SAMPLE = '{"name":"LifeKit","tools":["pdf","image","json"],"free":true,"stats":{"tools":60,"uploads":0}}';
const area = 'min-h-[360px] w-full resize-y rounded-xl border border-line bg-surface-2 p-3 font-mono text-sm text-fg focus:border-accent focus:outline-none';

export default function JsonFormatter() {
  const [input, setInput] = useState(SAMPLE);
  const [output, setOutput] = useState('');
  const [indent, setIndent] = useState('2');
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const run = (mode: number | 'min') => {
    try {
      setOutput(formatJson(input, mode));
      setError(null);
      setOk(mode === 'min' ? 'Minified ✓' : 'Valid JSON ✓');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON');
      setOk(null);
    }
  };
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-2">
        <Button onClick={() => run(indent === 'tab' ? ('\t' as unknown as number) : Number(indent))} icon={<Wand2 className="h-4 w-4" aria-hidden />}>Format / validate</Button>
        <Button variant="outline" onClick={() => run('min')} icon={<Minimize2 className="h-4 w-4" aria-hidden />}>Minify</Button>
        <Select label="Indent" value={indent} onChange={(e) => setIndent(e.target.value)} containerClassName="w-32">
          <option value="2">2 spaces</option><option value="4">4 spaces</option><option value="tab">Tabs</option>
        </Select>
      </div>
      {error && <Notice tone="error">{error}</Notice>}
      {ok && !error && <Notice tone="success">{ok}</Notice>}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-4">
          <label htmlFor="json-in" className="mb-2 block text-sm font-medium text-fg">Input</label>
          <textarea id="json-in" value={input} onChange={(e) => setInput(e.target.value)} spellCheck={false} className={area} placeholder="Paste JSON here" />
        </Card>
        <Card className="p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-fg">Result</span>
            <div className="flex gap-2">
              <CopyButton text={output} />
              <Button variant="outline" size="sm" disabled={!output} onClick={() => downloadText(output, 'formatted.json', 'application/json')} icon={<Download className="h-4 w-4" aria-hidden />}>.json</Button>
            </div>
          </div>
          <textarea readOnly value={output} spellCheck={false} className={area} aria-label="Formatted JSON" />
        </Card>
      </div>
    </div>
  );
}
