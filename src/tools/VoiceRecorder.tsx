import { useEffect, useRef, useState } from 'react';
import { Download, Mic, Pause, Play, Square, Trash2 } from 'lucide-react';
import { formatClock } from '../lib/time';
import { formatBytes } from '../utils/format';
import { downloadBlob } from '../utils/download';
import { useTicker } from '../hooks/useTicker';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Notice } from '../components/ui/Notice';
import { EmptyState } from '../components/ui/Misc';
import { pickMime, stamp } from './recorderShared';

interface Clip { id: number; blob: Blob; url: string; ms: number; name: string }

export default function VoiceRecorder() {
  const supported = typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== 'undefined';
  const [state, setState] = useState<'idle' | 'recording' | 'paused'>('idle');
  const [clips, setClips] = useState<Clip[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [level, setLevel] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [segStart, setSegStart] = useState<number | null>(null);
  const rec = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const raf = useRef(0);
  const ctxRef = useRef<AudioContext | null>(null);
  const fmt = useRef(pickMime('audio'));
  const clipsRef = useRef(clips);
  clipsRef.current = clips;
  const now = useTicker(state === 'recording', 200);
  const time = elapsed + (segStart ? now - segStart : 0);

  const cleanup = () => {
    cancelAnimationFrame(raf.current);
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
    void ctxRef.current?.close();
    ctxRef.current = null;
    setLevel(0);
  };
  useEffect(() => () => { cleanup(); clipsRef.current.forEach((c) => URL.revokeObjectURL(c.url)); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const start = async () => {
    setError(null);
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      stream.current = s;
      const ctx = new AudioContext();
      ctxRef.current = ctx;
      const an = ctx.createAnalyser();
      an.fftSize = 512;
      ctx.createMediaStreamSource(s).connect(an);
      const data = new Uint8Array(an.fftSize);
      const loop = () => {
        an.getByteTimeDomainData(data);
        let peak = 0;
        for (const v of data) peak = Math.max(peak, Math.abs(v - 128));
        setLevel(peak / 128);
        raf.current = requestAnimationFrame(loop);
      };
      loop();
      const r = new MediaRecorder(s, fmt.current.mime ? { mimeType: fmt.current.mime } : undefined);
      const chunks: Blob[] = [];
      let total = 0;
      let seg = Date.now();
      r.ondataavailable = (e) => e.data.size && chunks.push(e.data);
      r.onpause = () => { total += Date.now() - seg; };
      r.onresume = () => { seg = Date.now(); };
      r.onstop = () => {
        if (r.state !== 'paused') total += Date.now() - seg;
        const blob = new Blob(chunks, { type: r.mimeType || 'audio/webm' });
        const n = clipsRef.current.length + 1;
        setClips((c) => [{ id: Date.now(), blob, url: URL.createObjectURL(blob), ms: total, name: `Recording ${n}` }, ...c]);
        cleanup();
        setState('idle');
        setSegStart(null);
      };
      r.start(500);
      rec.current = r;
      setElapsed(0);
      setSegStart(Date.now());
      setState('recording');
    } catch (e) {
      cleanup();
      const name = (e as { name?: string }).name;
      setError(name === 'NotAllowedError' ? 'Microphone access was blocked. Click the lock or camera icon in the address bar, allow the microphone, then try again.' : name === 'NotFoundError' ? 'No microphone was found on this device.' : 'The microphone couldn’t be started.');
    }
  };

  if (!supported) return <Notice tone="warning" title="Recording isn’t supported in this browser">Try a recent version of Chrome, Edge, Firefox or Safari.</Notice>;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      <Card className="flex flex-col items-center justify-center gap-5 p-6">
        <div className="relative flex h-40 w-40 items-center justify-center">
          <span className="absolute inset-0 rounded-full bg-danger/15 transition-transform duration-75" style={{ transform: `scale(${0.7 + level * 0.9})` }} aria-hidden />
          <button type="button" onClick={state === 'idle' ? start : () => { if (segStart) setElapsed((x) => x + Date.now() - segStart); rec.current?.stop(); }}
            aria-label={state === 'idle' ? 'Start recording' : 'Stop recording'}
            className={`relative flex h-28 w-28 items-center justify-center rounded-full shadow-lg transition-colors ${state === 'idle' ? 'bg-accent text-accent-fg hover:bg-accent-hover' : 'bg-red-600 text-white'}`}>
            {state === 'idle' ? <Mic className="h-12 w-12" /> : <Square className="h-10 w-10 fill-current" />}
          </button>
        </div>
        <span className="text-5xl font-bold tabular-nums text-fg" role="timer">{formatClock(time)}</span>
        <p className="text-sm text-fg-muted" aria-live="polite">{state === 'idle' ? 'Tap the microphone to start' : state === 'recording' ? 'Recording… tap to stop' : 'Paused'}</p>
        {state !== 'idle' && (state === 'recording'
          ? <Button variant="outline" onClick={() => { rec.current?.pause(); if (segStart) setElapsed((x) => x + Date.now() - segStart); setSegStart(null); setState('paused'); }} icon={<Pause className="h-4 w-4" aria-hidden />}>Pause</Button>
          : <Button variant="outline" onClick={() => { rec.current?.resume(); setSegStart(Date.now()); setState('recording'); }} icon={<Play className="h-4 w-4" aria-hidden />}>Resume</Button>)}
        {error && <Notice tone="error">{error}</Notice>}
      </Card>
      <Card className="h-fit overflow-hidden">
        <h2 className="border-b border-line px-5 py-3.5 text-sm font-semibold text-fg">Recordings</h2>
        {clips.length === 0 ? <div className="p-4"><EmptyState icon={<Mic className="h-6 w-6" />} title="No recordings yet">Recordings stay on this page until you download them or close the tab.</EmptyState></div> : (
          <ul className="divide-y divide-line">
            {clips.map((c) => (
              <li key={c.id} className="space-y-2 px-5 py-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-fg">{c.name} <span className="font-normal text-fg-subtle">· {formatClock(c.ms)} · {formatBytes(c.blob.size)}</span></span>
                  <div className="flex">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => downloadBlob(c.blob, `voice_${stamp()}.${fmt.current.ext}`)} aria-label={`Download ${c.name}`} icon={<Download className="h-4 w-4" />} />
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { URL.revokeObjectURL(c.url); setClips((x) => x.filter((y) => y.id !== c.id)); }} aria-label={`Delete ${c.name}`} icon={<Trash2 className="h-4 w-4" />} />
                  </div>
                </div>
                <audio src={c.url} controls className="w-full" />
              </li>
            ))}
          </ul>
        )}
        <p className="border-t border-line px-5 py-3 text-xs text-fg-subtle">Recorded on your device. Nothing is uploaded. Files are saved as {fmt.current.ext.toUpperCase()}.</p>
      </Card>
    </div>
  );
}
