import { useEffect, useRef, useState } from 'react';
import { Download, Eraser, Mic, Square } from 'lucide-react';
import { downloadText } from '../utils/download';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { CopyButton } from '../components/ui/CopyButton';
import { Checkbox, Select } from '../components/ui/Form';
import { Notice } from '../components/ui/Notice';

interface Rec {
  lang: string; continuous: boolean; interimResults: boolean;
  start(): void; stop(): void;
  onresult: ((e: { resultIndex: number; results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
}
type RecCtor = new () => Rec;

const LANGS = [
  ['en-US', 'English (US)'], ['en-GB', 'English (UK)'], ['en-IN', 'English (India)'], ['hi-IN', 'हिन्दी Hindi'], ['ml-IN', 'മലയാളം Malayalam'],
  ['ta-IN', 'தமிழ் Tamil'], ['te-IN', 'తెలుగు Telugu'], ['kn-IN', 'ಕನ್ನಡ Kannada'], ['bn-IN', 'বাংলা Bengali'], ['mr-IN', 'मराठी Marathi'],
  ['es-ES', 'Español'], ['fr-FR', 'Français'], ['de-DE', 'Deutsch'], ['pt-BR', 'Português (BR)'], ['it-IT', 'Italiano'],
  ['ar-SA', 'العربية Arabic'], ['ja-JP', '日本語 Japanese'], ['zh-CN', '中文 Chinese'], ['ko-KR', '한국어 Korean'], ['ru-RU', 'Русский'],
];

export default function SpeechToText() {
  const Ctor: RecCtor | undefined = typeof window !== 'undefined' ? ((window as unknown as { SpeechRecognition?: RecCtor; webkitSpeechRecognition?: RecCtor }).SpeechRecognition ?? (window as unknown as { webkitSpeechRecognition?: RecCtor }).webkitSpeechRecognition) : undefined;
  const [lang, setLang] = useState(() => LANGS.find(([c]) => c === navigator.language)?.[0] ?? 'en-US');
  const [text, setText] = useState('');
  const [interim, setInterim] = useState('');
  const [listening, setListening] = useState(false);
  const [punct, setPunct] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const rec = useRef<Rec | null>(null);
  const wantOn = useRef(false);

  useEffect(() => () => { wantOn.current = false; rec.current?.stop(); }, []);

  const tidy = (s: string) => {
    let t = s.trim();
    if (!t) return '';
    if (punct) {
      t = t.replace(/\b(full stop|period)\b/gi, '.').replace(/\bcomma\b/gi, ',').replace(/\bquestion mark\b/gi, '?').replace(/\bnew line\b/gi, '\n').replace(/\s+([.,?])/g, '$1');
      t = t.charAt(0).toUpperCase() + t.slice(1);
    }
    return t;
  };

  const start = () => {
    if (!Ctor) return;
    setError(null);
    const r = new Ctor();
    r.lang = lang;
    r.continuous = true;
    r.interimResults = true;
    r.onresult = (e) => {
      let fin = '', mid = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        if (res.isFinal) fin += res[0].transcript;
        else mid += res[0].transcript;
      }
      if (fin) setText((t) => (t && !t.endsWith('\n') ? t + ' ' : t) + tidy(fin));
      setInterim(mid);
    };
    r.onerror = (e) => {
      if (e.error === 'no-speech' || e.error === 'aborted') return;
      wantOn.current = false;
      setError(e.error === 'not-allowed' || e.error === 'service-not-allowed' ? 'Microphone access was blocked. Allow the microphone in your browser’s address bar, then try again.' : e.error === 'network' ? 'The speech service couldn’t be reached. Check your internet connection.' : `Speech recognition stopped (${e.error}).`);
    };
    r.onend = () => {
      setInterim('');
      if (wantOn.current) {
        try { r.start(); return; } catch { /* fall through */ }
      }
      setListening(false);
    };
    rec.current = r;
    wantOn.current = true;
    r.start();
    setListening(true);
  };
  const stop = () => {
    wantOn.current = false;
    rec.current?.stop();
    setListening(false);
  };

  if (!Ctor) {
    return (
      <Notice tone="warning" title="Speech to text isn’t supported in this browser">
        Please open this page in <strong>Google Chrome</strong>, <strong>Microsoft Edge</strong> or <strong>Safari</strong>. Firefox doesn’t support voice typing yet. On your phone you can also use the microphone key on your keyboard.
      </Notice>
    );
  }

  const words = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <Card className="flex flex-col p-4 sm:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-fg">Your text <span className="font-normal text-fg-subtle">· {words} words</span></h2>
          <div className="flex gap-2">
            <CopyButton text={text} />
            <Button variant="outline" size="sm" disabled={!text} onClick={() => downloadText(text, 'speech-to-text.txt')} icon={<Download className="h-4 w-4" aria-hidden />}>.txt</Button>
            <Button variant="outline" size="sm" disabled={!text} onClick={() => setText('')} icon={<Eraser className="h-4 w-4" aria-hidden />}>Clear</Button>
          </div>
        </div>
        <textarea value={text + (interim ? (text ? ' ' : '') + interim : '')} onChange={(e) => { if (!interim) setText(e.target.value); }} placeholder="Press the microphone and start talking. Your words appear here, and you can edit them." className="min-h-[340px] w-full flex-1 resize-y rounded-xl border border-line bg-surface-2 p-4 leading-relaxed text-fg placeholder:text-fg-subtle focus:border-accent focus:outline-none" />
      </Card>
      <Card className="h-fit space-y-5 p-5">
        <button type="button" onClick={listening ? stop : start} aria-pressed={listening} aria-label={listening ? 'Stop listening' : 'Start listening'}
          className={`mx-auto flex h-28 w-28 items-center justify-center rounded-full shadow-lg transition-all ${listening ? 'animate-pulse bg-red-600 text-white' : 'bg-accent text-accent-fg hover:scale-105'}`}>
          {listening ? <Square className="h-10 w-10" /> : <Mic className="h-12 w-12" />}
        </button>
        <p className="text-center text-sm font-medium text-fg" aria-live="polite">{listening ? 'Listening… speak now' : 'Tap to start'}</p>
        {error && <Notice tone="error">{error}</Notice>}
        <Select label="Language" value={lang} onChange={(e) => setLang(e.target.value)} disabled={listening}>
          {LANGS.map(([c, n]) => <option key={c} value={c}>{n}</option>)}
        </Select>
        <Checkbox checked={punct} onChange={setPunct} label="Spoken punctuation" description="Say “comma”, “full stop”, “question mark” or “new line”." />
        <p className="text-xs text-fg-subtle">Voice recognition is provided by your browser. In Chrome and Edge your audio is processed by Google’s or Microsoft’s speech service; LifeKit never receives it.</p>
      </Card>
    </div>
  );
}
