import { useState } from 'react';
import { Shuffle } from 'lucide-react';
import { makeTeams } from '../lib/misc2';
import { shuffle } from '../lib/random';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { CopyButton } from '../components/ui/CopyButton';
import { Input } from '../components/ui/Form';

export default function TeamGenerator() {
  const [raw, setRaw] = useState('Aarav\nDiya\nRohan\nSara\nKabir\nAnaya\nVihaan\nMeera\nArjun\nZara');
  const [n, setN] = useState('2');
  const [teams, setTeams] = useState<string[][]>([]);
  const names = raw.split('\n').map((s) => s.trim()).filter(Boolean);
  const go = () => setTeams(makeTeams(names, Math.min(names.length, Math.max(2, Math.round(Number(n)) || 2)), shuffle([...names])));
  const text = teams.map((t, i) => `Team ${i + 1}: ${t.join(', ')}`).join('\n');
  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <Card className="h-fit space-y-4 p-5">
        <label className="block"><span className="mb-1.5 block text-sm font-medium text-fg">Names (one per line) · {names.length}</span>
          <textarea value={raw} onChange={(e) => setRaw(e.target.value)} rows={10} className="w-full rounded-xl border border-line bg-surface-2 p-3 text-fg focus:border-accent focus:outline-none" /></label>
        <Input label="Number of teams" inputMode="numeric" value={n} onChange={(e) => setN(e.target.value)} />
        <Button size="lg" className="w-full" onClick={go} disabled={names.length < 2} icon={<Shuffle className="h-5 w-5" aria-hidden />}>Make teams</Button>
      </Card>
      <div className="space-y-3">
        {teams.length ? (
          <>
            <div className="flex justify-end"><CopyButton text={text} label="Copy teams" /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              {teams.map((t, i) => <Card key={i} className="animate-fade-up p-5"><h3 className="mb-3 font-semibold text-accent-text">Team {i + 1}</h3><ul className="space-y-1.5 text-fg">{t.map((x) => <li key={x}>{x}</li>)}</ul></Card>)}
            </div>
          </>
        ) : <Card className="flex min-h-[240px] items-center justify-center p-6 text-fg-muted">Add names and press “Make teams”.</Card>}
      </div>
    </div>
  );
}
