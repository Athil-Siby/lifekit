import { Volume2 } from 'lucide-react';
import { ALARM_SOUNDS, playOnce, unlockAudio, type AlarmSound } from '../lib/sound';
import { Select } from '../components/ui/Form';
import { Button } from '../components/ui/Button';

export function SoundPicker({ value, onChange, id }: { value: AlarmSound; onChange: (s: AlarmSound) => void; id?: string }) {
  return (
    <div className="flex items-end gap-2">
      <Select id={id} label="Alarm sound" value={value} onChange={(e) => onChange(e.target.value as AlarmSound)} containerClassName="flex-1">
        {ALARM_SOUNDS.map((s) => (
          <option key={s.id} value={s.id}>{s.label}</option>
        ))}
      </Select>
      <Button
        variant="outline"
        className="h-11"
        onClick={() => {
          unlockAudio();
          playOnce(value);
        }}
        icon={<Volume2 className="h-4 w-4" aria-hidden />}
      >
        Test
      </Button>
    </div>
  );
}

/** Circular progress ring with content in the middle. */
export function Ring({ progress, children, tone = 'accent' }: { progress: number; children: React.ReactNode; tone?: 'accent' | 'success' | 'warning' }) {
  const r = 46;
  const c = 2 * Math.PI * r;
  const color = tone === 'success' ? 'var(--success)' : tone === 'warning' ? 'var(--warning)' : 'var(--accent)';
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[320px]">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" aria-hidden>
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--surface-3)" strokeWidth="5" />
        <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - Math.min(1, Math.max(0, progress)))} style={{ transition: 'stroke-dashoffset 0.25s linear' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  );
}
