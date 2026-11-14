import { useEffect, useMemo, useRef, useState } from 'react';
import { Shuffle, Trash2 } from 'lucide-react';
import { randomInt, shuffle } from '../lib/random';
import { readStorage, writeStorage } from '../lib/storage';
import { playOnce, unlockAudio } from '../lib/sound';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Checkbox } from '../components/ui/Form';
import { Modal } from '../components/ui/Modal';

const COLORS = ['#6366f1', '#f43f5e', '#10b981', '#f59e0b', '#0ea5e9', '#a855f7', '#ef4444', '#14b8a6', '#ec4899', '#84cc16', '#f97316', '#3b82f6'];
const DEFAULT = 'Pizza\nBurger\nSushi\nPasta\nTacos\nSalad';

export default function SpinWheel() {
  const [raw, setRaw] = useState(() => readStorage<string>('wheel', DEFAULT));
  const [angle, setAngle] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [removeWinner, setRemoveWinner] = useState(false);
  const [sound, setSound] = useState(true);
  const tickTimer = useRef<number | null>(null);
  const items = useMemo(() => raw.split('\n').map((s) => s.trim()).filter(Boolean).slice(0, 100), [raw]);
  useEffect(() => writeStorage('wheel', raw), [raw]);
  useEffect(() => () => { if (tickTimer.current) clearInterval(tickTimer.current); }, []);

  const n = items.length;
  const seg = 360 / Math.max(1, n);

  const spin = () => {
    if (n < 2 || spinning) return;
    unlockAudio();
    const target = randomInt(0, n - 1);
    // Pointer is at the top (−90°). Segment i spans [i*seg, (i+1)*seg) clockwise from the right (0°).
    const within = seg * (0.15 + (randomInt(0, 700) / 1000));
    const targetAngle = 270 - (target * seg + within);
    const base = angle - (angle % 360);
    const final = base + 360 * (6 + randomInt(0, 3)) + ((targetAngle % 360) + 360) % 360;
    setSpinning(true);
    setWinner(null);
    setAngle(final);
    if (sound) {
      let delay = 60;
      const tick = () => { playOnce('gentle', 0.15); delay *= 1.08; if (delay < 600) tickTimer.current = window.setTimeout(tick, delay); };
      tick();
    }
    window.setTimeout(() => {
      setSpinning(false);
      setWinner(items[target]);
      if (sound) playOnce('chime', 0.5);
    }, 5200);
  };

  const closeWinner = () => {
    if (removeWinner && winner) {
      const lines = raw.split('\n');
      const idx = lines.findIndex((l) => l.trim() === winner);
      if (idx >= 0) lines.splice(idx, 1);
      setRaw(lines.join('\n'));
    }
    setWinner(null);
  };

  const r = 48;
  const path = (i: number) => {
    const a0 = (i * seg * Math.PI) / 180, a1 = ((i + 1) * seg * Math.PI) / 180;
    const large = seg > 180 ? 1 : 0;
    return `M50 50 L${50 + r * Math.cos(a0)} ${50 + r * Math.sin(a0)} A${r} ${r} 0 ${large} 1 ${50 + r * Math.cos(a1)} ${50 + r * Math.sin(a1)} Z`;
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <Card className="flex flex-col items-center p-5 sm:p-8">
        <div className="relative w-full max-w-[460px]">
          <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1" aria-hidden>
            <div className="h-0 w-0 border-x-[14px] border-t-[26px] border-x-transparent border-t-fg drop-shadow" />
          </div>
          <svg viewBox="0 0 100 100" className="w-full drop-shadow-lg" style={{ transform: `rotate(${angle}deg)`, transition: spinning ? 'transform 5.2s cubic-bezier(0.12, 0.7, 0.12, 1)' : 'none' }} role="img" aria-label={`Wheel with ${n} options`}>
            {n === 1 && <circle cx="50" cy="50" r={r} fill={COLORS[0]} />}
            {n > 1 && items.map((it, i) => (
              <g key={i}>
                <path d={path(i)} fill={COLORS[i % COLORS.length]} stroke="white" strokeWidth="0.4" />
                <text x="50" y="50" fill="white" fontSize={n > 24 ? 2.2 : n > 12 ? 3 : 4} fontWeight="700" dominantBaseline="middle"
                  transform={`rotate(${(i + 0.5) * seg} 50 50) translate(${n > 12 ? 20 : 16} 0)`}>
                  {it.length > 18 ? it.slice(0, 17) + '…' : it}
                </text>
              </g>
            ))}
            <circle cx="50" cy="50" r="6" fill="white" stroke="#e2e8f0" strokeWidth="0.6" />
          </svg>
          <button type="button" onClick={spin} disabled={n < 2 || spinning} className="absolute left-1/2 top-1/2 flex h-[14%] w-[14%] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-fg text-xs font-bold text-bg shadow-lg disabled:opacity-70 sm:text-sm">SPIN</button>
        </div>
        <Button size="lg" className="mt-6" onClick={spin} disabled={n < 2 || spinning}>{spinning ? 'Spinning…' : n < 2 ? 'Add at least 2 options' : 'Spin the wheel'}</Button>
      </Card>
      <Card className="h-fit space-y-4 p-5">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-fg">Options (one per line) · {n}</span>
          <textarea value={raw} onChange={(e) => setRaw(e.target.value)} disabled={spinning} rows={10} className="w-full resize-y rounded-xl border border-line bg-surface-2 p-3 text-fg focus:border-accent focus:outline-none" placeholder="Type names, choices or prizes…" />
        </label>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={spinning || n < 2} onClick={() => setRaw(shuffle([...items]).join('\n'))} icon={<Shuffle className="h-4 w-4" aria-hidden />}>Shuffle</Button>
          <Button variant="outline" size="sm" disabled={spinning || !raw} onClick={() => setRaw('')} icon={<Trash2 className="h-4 w-4" aria-hidden />}>Clear</Button>
        </div>
        <Checkbox checked={removeWinner} onChange={setRemoveWinner} label="Remove the winner after each spin" />
        <Checkbox checked={sound} onChange={setSound} label="Sound effects" />
      </Card>
      <Modal open={!!winner} onClose={closeWinner} title="We have a winner! 🎉">
        <p className="py-6 text-center text-4xl font-bold text-accent-text">{winner}</p>
        <Button className="w-full" onClick={closeWinner}>{removeWinner ? 'Remove and close' : 'Close'}</Button>
      </Modal>
    </div>
  );
}
