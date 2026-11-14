/**
 * Alarm sounds generated with the Web Audio API (no audio files to download).
 * Browsers only allow sound after the user has interacted with the page, so
 * call unlock() from a click (e.g. the Start button) before the alarm is due.
 */
export type AlarmSound = 'beep' | 'chime' | 'digital' | 'gentle';

export const ALARM_SOUNDS: { id: AlarmSound; label: string }[] = [
  { id: 'beep', label: 'Classic beep' },
  { id: 'digital', label: 'Digital alarm' },
  { id: 'chime', label: 'Chime' },
  { id: 'gentle', label: 'Gentle' },
];

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  return ctx;
}

export function unlockAudio(): void {
  const a = audio();
  if (a && a.state === 'suspended') void a.resume();
}

function tone(a: AudioContext, freq: number, start: number, dur: number, type: OscillatorType, vol: number) {
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(0, start);
  g.gain.linearRampToValueAtTime(vol, start + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  o.connect(g).connect(a.destination);
  o.start(start);
  o.stop(start + dur + 0.05);
}

/** Plays one cycle of a sound pattern; returns its length in seconds. */
export function playOnce(sound: AlarmSound, volume = 0.6): number {
  const a = audio();
  if (!a) return 1;
  unlockAudio();
  const t = a.currentTime + 0.02;
  const v = 0.25 * volume;
  switch (sound) {
    case 'beep':
      [0, 0.25, 0.5].forEach((d) => tone(a, 880, t + d, 0.15, 'square', v));
      return 1.2;
    case 'digital':
      [0, 0.12, 0.24, 0.36].forEach((d) => tone(a, 1760, t + d, 0.07, 'square', v * 0.8));
      return 0.9;
    case 'chime':
      tone(a, 1046.5, t, 0.9, 'sine', v * 1.6);
      tone(a, 1318.5, t + 0.25, 1.1, 'sine', v * 1.4);
      return 1.8;
    case 'gentle':
      [523.25, 659.25, 783.99].forEach((f, i) => tone(a, f, t + i * 0.3, 0.8, 'triangle', v * 1.5));
      return 2.2;
  }
}

/** Repeats a sound until stop() is called (or maxSeconds passes). */
export function startAlarm(sound: AlarmSound, volume = 0.6, maxSeconds = 120): () => void {
  let stopped = false;
  let timer: number | undefined;
  const started = Date.now();
  const loop = () => {
    if (stopped || Date.now() - started > maxSeconds * 1000) return;
    const len = playOnce(sound, volume);
    timer = window.setTimeout(loop, len * 1000);
  };
  loop();
  return () => {
    stopped = true;
    window.clearTimeout(timer);
  };
}
