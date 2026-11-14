import { useEffect, useMemo, useRef, useState } from 'react';
import { Eraser, Pause, Play, Square } from 'lucide-react';
import { splitForSpeech } from '../lib/speech';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Range, Select } from '../components/ui/Form';
import { Notice } from '../components/ui/Notice';
import { Progress } from '../components/ui/Misc';

const SAMPLE =
  'Welcome to LifeKit. This tool reads any text aloud using the voices built into your device. Paste an article, your notes or an essay, choose a voice and speed, and press play.';

export default function TextToSpeech() {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const [text, setText] = useState(SAMPLE);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceUri, setVoiceUri] = useState('');
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [state, setState] = useState<'idle' | 'speaking' | 'paused'>('idle');
  const [chunk, setChunk] = useState(0);
  const chunksRef = useRef<string[]>([]);
  const cancelled = useRef(false);

  useEffect(() => {
    if (!supported) return;
    const load = () => {
      const v = window.speechSynthesis.getVoices().slice().sort((a, b) => a.lang.localeCompare(b.lang) || a.name.localeCompare(b.name));
      setVoices(v);
      setVoiceUri((cur) => cur || (v.find((x) => x.default) ?? v.find((x) => x.lang.startsWith(navigator.language.slice(0, 2))) ?? v[0])?.voiceURI || '');
    };
    load();
    window.speechSynthesis.addEventListener('voiceschanged', load);
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', load);
      window.speechSynthesis.cancel();
    };
  }, [supported]);

  const grouped = useMemo(() => {
    const names = new Intl.DisplayNames([navigator.language || 'en'], { type: 'language' });
    const m = new Map<string, SpeechSynthesisVoice[]>();
    for (const v of voices) {
      let lang = v.lang;
      try {
        lang = names.of(v.lang) ?? v.lang;
      } catch { /* keep code */ }
      m.set(lang, [...(m.get(lang) ?? []), v]);
    }
    return [...m.entries()];
  }, [voices]);

  const speakFrom = (i: number) => {
    const chunks = chunksRef.current;
    if (cancelled.current || i >= chunks.length) {
      setState('idle');
      setChunk(0);
      return;
    }
    setChunk(i);
    const u = new SpeechSynthesisUtterance(chunks[i]);
    const voice = voices.find((v) => v.voiceURI === voiceUri);
    if (voice) {
      u.voice = voice;
      u.lang = voice.lang;
    }
    u.rate = rate;
    u.pitch = pitch;
    u.onend = () => speakFrom(i + 1);
    u.onerror = (e) => {
      if (e.error !== 'interrupted' && e.error !== 'canceled') setState('idle');
    };
    window.speechSynthesis.speak(u);
  };

  const play = () => {
    if (state === 'paused') {
      window.speechSynthesis.resume();
      setState('speaking');
      return;
    }
    window.speechSynthesis.cancel();
    chunksRef.current = splitForSpeech(text);
    if (!chunksRef.current.length) return;
    cancelled.current = false;
    setState('speaking');
    speakFrom(0);
  };
  const stop = () => {
    cancelled.current = true;
    window.speechSynthesis.cancel();
    setState('idle');
    setChunk(0);
  };

  if (!supported) {
    return <Notice tone="error" title="Text to speech isn’t available in this browser">Try a recent version of Chrome, Edge, Safari or Firefox.</Notice>;
  }

  const total = chunksRef.current.length || 1;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <Card className="p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between">
          <label htmlFor="tts-text" className="text-sm font-medium text-fg">Text to read</label>
          <Button variant="outline" size="sm" onClick={() => { stop(); setText(''); }} disabled={!text} icon={<Eraser className="h-4 w-4" aria-hidden />}>Clear</Button>
        </div>
        <textarea
          id="tts-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type or paste text here…"
          className="min-h-[300px] w-full resize-y rounded-xl border border-line bg-surface-2 p-4 leading-relaxed text-fg placeholder:text-fg-subtle focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/15"
        />
        <p className="mt-2 text-xs text-fg-subtle">{text.trim() ? `${text.trim().split(/\s+/).length.toLocaleString()} words · about ${Math.max(1, Math.round(text.trim().split(/\s+/).length / (150 * rate)))} min to listen` : ''}</p>
      </Card>
      <Card className="h-fit space-y-5 p-5">
        <Select label="Voice" value={voiceUri} onChange={(e) => setVoiceUri(e.target.value)} disabled={state !== 'idle'} hint={voices.length ? `${voices.length} voices on this device` : 'Loading voices…'}>
          {grouped.map(([lang, vs]) => (
            <optgroup key={lang} label={lang}>
              {vs.map((v) => <option key={v.voiceURI} value={v.voiceURI}>{v.name}{v.localService ? '' : ' (online)'}</option>)}
            </optgroup>
          ))}
        </Select>
        <Range label="Speed" min={0.5} max={2} step={0.1} value={rate} onChange={setRate} display={`${rate.toFixed(1)}×`} />
        <Range label="Pitch" min={0.5} max={2} step={0.1} value={pitch} onChange={setPitch} display={pitch.toFixed(1)} />
        {state !== 'idle' && <Progress value={(chunk + 1) / total} label={state === 'paused' ? 'Paused' : 'Reading'} />}
        <div className="flex gap-2">
          {state === 'speaking' ? (
            <Button size="lg" variant="secondary" className="flex-1" onClick={() => { window.speechSynthesis.pause(); setState('paused'); }} icon={<Pause className="h-5 w-5" aria-hidden />}>Pause</Button>
          ) : (
            <Button size="lg" className="flex-1" onClick={play} disabled={!text.trim()} icon={<Play className="h-5 w-5" aria-hidden />}>{state === 'paused' ? 'Resume' : 'Play'}</Button>
          )}
          <Button size="lg" variant="outline" onClick={stop} disabled={state === 'idle'} aria-label="Stop" icon={<Square className="h-5 w-5" aria-hidden />} />
        </div>
        <p className="text-xs text-fg-subtle">Speed and voice changes apply the next time you press Play.</p>
      </Card>
    </div>
  );
}
