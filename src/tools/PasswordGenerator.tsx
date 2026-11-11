import { useCallback, useEffect, useState } from 'react';
import { RefreshCw, ShieldAlert } from 'lucide-react';
import {
  crackTimeEstimate, entropyBits, generatePassword, MAX_LENGTH, MIN_LENGTH, strengthFromEntropy, type PasswordOptions,
} from '../lib/password';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { CopyButton } from '../components/ui/CopyButton';
import { Checkbox, Range } from '../components/ui/Form';
import { Notice } from '../components/ui/Notice';
import { cn } from '../lib/cn';

const levelColors = ['bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-emerald-500', 'bg-emerald-600'];
const levelText = ['text-red-600 dark:text-red-400', 'text-orange-600 dark:text-orange-400', 'text-amber-600 dark:text-amber-400', 'text-emerald-600 dark:text-emerald-400', 'text-emerald-700 dark:text-emerald-400'];

function colorize(pw: string) {
  return Array.from(pw).map((c, i) => (
    <span key={i} className={cn(/\d/.test(c) ? 'text-sky-600 dark:text-sky-400' : /[^A-Za-z]/.test(c) ? 'text-rose-600 dark:text-rose-400' : 'text-fg')}>
      {c}
    </span>
  ));
}

export default function PasswordGenerator() {
  // Options are deliberately not persisted, and passwords are never stored.
  const [opts, setOpts] = useState<PasswordOptions>({
    length: 20,
    upper: true,
    lower: true,
    numbers: true,
    symbols: true,
    excludeAmbiguous: false,
  });
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const regenerate = useCallback(() => {
    try {
      setPassword(generatePassword(opts));
      setError(null);
    } catch (e) {
      setPassword('');
      setError(e instanceof Error ? e.message : 'Could not generate a password.');
    }
  }, [opts]);

  useEffect(() => {
    regenerate();
  }, [regenerate]);

  const bits = entropyBits(opts);
  const strength = strengthFromEntropy(bits);
  const set = <K extends keyof PasswordOptions>(k: K, v: PasswordOptions[K]) => setOpts((o) => ({ ...o, [k]: v }));
  const enabledCount = [opts.upper, opts.lower, opts.numbers, opts.symbols].filter(Boolean).length;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-4">
        <Card className="p-5 sm:p-6">
          <p className="mb-2 text-sm font-medium text-fg" id="pw-label">Your password</p>
          <div
            aria-labelledby="pw-label"
            className="min-h-[72px] break-all rounded-xl border border-line bg-surface-2 px-4 py-4 font-mono text-xl leading-relaxed sm:text-2xl"
            aria-live="polite"
          >
            {password ? colorize(password) : <span className="text-fg-subtle">—</span>}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <CopyButton text={password} variant="primary" size="md" label="Copy password" message="Password copied. Paste it into your password manager." />
            <Button variant="outline" onClick={regenerate} disabled={enabledCount === 0} icon={<RefreshCw className="h-4 w-4" aria-hidden />}>
              Generate new
            </Button>
          </div>
          {error && <Notice tone="error" className="mt-4">{error}</Notice>}
        </Card>
        <Card className="p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-fg">Strength</p>
            <p className={cn('text-sm font-semibold', levelText[strength.level])}>{enabledCount ? strength.label : '—'}</p>
          </div>
          <div className="mt-3 grid grid-cols-5 gap-1.5" aria-hidden>
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className={cn('h-2 rounded-full transition-colors', enabledCount && i <= strength.level ? levelColors[strength.level] : 'bg-surface-3')} />
            ))}
          </div>
          {enabledCount > 0 && (
            <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
              <div className="rounded-xl bg-surface-2 px-4 py-3">
                <dt className="text-xs uppercase tracking-wide text-fg-subtle">Entropy</dt>
                <dd className="mt-1 font-semibold tabular-nums text-fg">{Math.round(bits)} bits</dd>
              </div>
              <div className="rounded-xl bg-surface-2 px-4 py-3">
                <dt className="text-xs uppercase tracking-wide text-fg-subtle">Time to brute-force</dt>
                <dd className="mt-1 font-semibold text-fg">{crackTimeEstimate(bits)}</dd>
              </div>
            </dl>
          )}
          <p className="mt-3 text-xs text-fg-subtle">
            Estimate assumes an attacker making 10 billion guesses per second against a stolen password database. Real
            risk also depends on how the website stores passwords.
          </p>
        </Card>
      </div>

      <Card className="h-fit space-y-5 p-5 sm:p-6">
        <Range label="Length" value={opts.length} min={MIN_LENGTH} max={64} onChange={(v) => set('length', v)} display={`${opts.length} characters`} />
        <div className="flex items-center gap-2 text-xs text-fg-subtle">
          <label htmlFor="pw-len">Exact length:</label>
          <input
            id="pw-len"
            type="number"
            min={MIN_LENGTH}
            max={MAX_LENGTH}
            value={opts.length}
            onChange={(e) => {
              const v = Math.round(Number(e.target.value));
              if (Number.isFinite(v)) set('length', Math.min(MAX_LENGTH, Math.max(MIN_LENGTH, v)));
            }}
            className="h-8 w-20 rounded-lg border border-line bg-surface px-2 text-sm text-fg focus:border-accent focus:outline-none"
          />
          <span>(up to {MAX_LENGTH})</span>
        </div>
        <fieldset className="space-y-3.5 border-t border-line pt-5">
          <legend className="sr-only">Character types</legend>
          <Checkbox checked={opts.upper} onChange={(v) => set('upper', v)} label="Uppercase letters" description="A–Z" />
          <Checkbox checked={opts.lower} onChange={(v) => set('lower', v)} label="Lowercase letters" description="a–z" />
          <Checkbox checked={opts.numbers} onChange={(v) => set('numbers', v)} label="Numbers" description="0–9" />
          <Checkbox checked={opts.symbols} onChange={(v) => set('symbols', v)} label="Symbols" description="! @ # $ % ^ & * and more" />
        </fieldset>
        <div className="border-t border-line pt-5">
          <Checkbox
            checked={opts.excludeAmbiguous}
            onChange={(v) => set('excludeAmbiguous', v)}
            label="Exclude look-alike characters"
            description="Removes O 0 o I l 1 | and quotes"
          />
        </div>
        {enabledCount === 0 && (
          <Notice tone="warning" title="Select at least one character type" />
        )}
        <p className="flex items-start gap-2 text-xs text-fg-subtle">
          <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          Generated with crypto.getRandomValues() on your device. Never stored or sent.
        </p>
      </Card>
    </div>
  );
}
