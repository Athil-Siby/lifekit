import { useEffect, useRef, useState } from 'react';
import { Circle, Download, MonitorPlay, Pause, Play, RotateCcw, Square } from 'lucide-react';
import { formatClock } from '../lib/time';
import { formatBytes } from '../utils/format';
import { downloadBlob } from '../utils/download';
import { useObjectUrl } from '../hooks/useObjectUrl';
import { useTicker } from '../hooks/useTicker';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Checkbox } from '../components/ui/Form';
import { Notice } from '../components/ui/Notice';
import { pickMime, stamp } from './recorderShared';

export default function ScreenRecorder() {
  const supported = typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getDisplayMedia && typeof MediaRecorder !== 'undefined';
  const [mic, setMic] = useState(true);
  const [sysAudio, setSysAudio] = useState(true);
  const [state, setState] = useState<'idle' | 'recording' | 'paused'>('idle');
  const [blob, setBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [segStart, setSegStart] = useState<number | null>(null);
  const rec = useRef<MediaRecorder | null>(null);
  const streams = useRef<MediaStream[]>([]);
  const fmt = useRef(pickMime('video'));
  const now = useTicker(state === 'recording', 250);
  const url = useObjectUrl(blob);
  const time = elapsed + (segStart ? now - segStart : 0);

  const cleanup = () => { streams.current.forEach((s) => s.getTracks().forEach((t) => t.stop())); streams.current = []; };
  useEffect(() => () => { rec.current?.state !== 'inactive' && rec.current?.stop(); cleanup(); }, []);

  const start = async () => {
    setError(null);
    setBlob(null);
    try {
      const display = await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: 30 }, audio: sysAudio });
      streams.current = [display];
      const tracks = [...display.getVideoTracks()];
      const audioTracks: MediaStreamTrack[] = [...display.getAudioTracks()];
      if (mic) {
        try {
          const m = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
          streams.current.push(m);
          audioTracks.push(...m.getAudioTracks());
        } catch { setError('Microphone not available – recording the screen without your voice.'); }
      }
      if (audioTracks.length > 1) {
        // Mix screen audio and microphone into one track.
        const ctx = new AudioContext();
        const dest = ctx.createMediaStreamDestination();
        audioTracks.forEach((t) => ctx.createMediaStreamSource(new MediaStream([t])).connect(dest));
        tracks.push(...dest.stream.getAudioTracks());
      } else tracks.push(...audioTracks);
      const stream = new MediaStream(tracks);
      const r = new MediaRecorder(stream, fmt.current.mime ? { mimeType: fmt.current.mime, videoBitsPerSecond: 5_000_000 } : undefined);
      const chunks: Blob[] = [];
      r.ondataavailable = (e) => e.data.size && chunks.push(e.data);
      r.onstop = () => {
        setBlob(new Blob(chunks, { type: r.mimeType || 'video/webm' }));
        setState('idle');
        setSegStart(null);
        cleanup();
      };
      display.getVideoTracks()[0].onended = () => r.state !== 'inactive' && r.stop();
      r.start(1000);
      rec.current = r;
      setElapsed(0);
      setSegStart(Date.now());
      setState('recording');
    } catch (e) {
      cleanup();
      const name = (e as { name?: string }).name;
      if (name !== 'NotAllowedError' && name !== 'AbortError') setError('Screen recording couldn’t start. ' + (e instanceof Error ? e.message : ''));
    }
  };
  const stop = () => {
    if (segStart) setElapsed((x) => x + Date.now() - segStart);
    rec.current?.stop();
  };
  const pause = () => { rec.current?.pause(); if (segStart) setElapsed((x) => x + Date.now() - segStart); setSegStart(null); setState('paused'); };
  const resume = () => { rec.current?.resume(); setSegStart(Date.now()); setState('recording'); };

  if (!supported) {
    return <Notice tone="warning" title="Screen recording isn’t available here">Phones and tablets don’t allow websites to record the screen. Use a computer with Chrome, Edge, Firefox or Safari – or your phone’s built-in screen recorder.</Notice>;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <Card className="flex min-h-[320px] flex-col items-center justify-center gap-4 p-5">
        {state !== 'idle' ? (
          <>
            <span className="flex items-center gap-2 text-lg font-semibold text-danger"><span className={`h-3 w-3 rounded-full bg-danger ${state === 'recording' ? 'animate-pulse' : ''}`} /> {state === 'recording' ? 'Recording' : 'Paused'}</span>
            <span className="text-6xl font-bold tabular-nums text-fg">{formatClock(time)}</span>
            <p className="text-sm text-fg-muted">You can switch to other tabs or apps. Come back here, or use the browser’s “Stop sharing” button, to finish.</p>
          </>
        ) : blob && url ? (
          <div className="w-full space-y-3">
            <video src={url} controls className="w-full rounded-xl bg-black" />
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm text-fg-muted">{formatClock(elapsed)} · {formatBytes(blob.size)} · {fmt.current.ext.toUpperCase()}</span>
              <Button onClick={() => downloadBlob(blob, `screen-recording_${stamp()}.${fmt.current.ext}`)} icon={<Download className="h-4 w-4" aria-hidden />}>Download video</Button>
            </div>
          </div>
        ) : (
          <div className="text-center text-fg-muted">
            <MonitorPlay className="mx-auto mb-3 h-12 w-12 text-fg-subtle" aria-hidden />
            <p>Record your whole screen, a window or a browser tab.</p>
          </div>
        )}
        {error && <Notice tone="warning">{error}</Notice>}
      </Card>
      <Card className="h-fit space-y-5 p-5">
        <Checkbox checked={mic} onChange={setMic} disabled={state !== 'idle'} label="Record my microphone" />
        <Checkbox checked={sysAudio} onChange={setSysAudio} disabled={state !== 'idle'} label="Record computer sound" description="Works best when sharing a Chrome or Edge tab." />
        {state === 'idle' ? (
          <Button size="lg" className="w-full" onClick={start} icon={blob ? <RotateCcw className="h-5 w-5" aria-hidden /> : <Circle className="h-5 w-5 fill-current" aria-hidden />}>{blob ? 'Record again' : 'Start recording'}</Button>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {state === 'recording' ? <Button size="lg" variant="secondary" onClick={pause} icon={<Pause className="h-5 w-5" aria-hidden />}>Pause</Button> : <Button size="lg" variant="secondary" onClick={resume} icon={<Play className="h-5 w-5" aria-hidden />}>Resume</Button>}
            <Button size="lg" variant="danger" onClick={stop} icon={<Square className="h-5 w-5" aria-hidden />}>Stop</Button>
          </div>
        )}
        <p className="text-xs text-fg-subtle">The video is recorded and saved on your device. Nothing is uploaded. Long recordings use a lot of memory, so download each one before starting the next.</p>
      </Card>
    </div>
  );
}
