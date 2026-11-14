import { useEffect, useState } from 'react';
import { Download, RotateCcw, ScanText } from 'lucide-react';
import { useObjectUrl } from '../hooks/useObjectUrl';
import { checkFile, IMAGE_ACCEPT } from '../utils/files';
import { limits } from '../config/limits';
import { downloadText } from '../utils/download';
import { Card } from '../components/ui/Card';
import { Dropzone } from '../components/ui/Dropzone';
import { Button } from '../components/ui/Button';
import { CopyButton } from '../components/ui/CopyButton';
import { Notice } from '../components/ui/Notice';
import { Progress } from '../components/ui/Misc';
import { FileChip } from '../components/FileChip';
import { useToast } from '../components/ui/Toast';
import { IMAGE_INPUT, baseOf } from './imageShared';

const STATUS: Record<string, string> = {
  'loading tesseract core': 'Loading the text reader',
  'initializing tesseract': 'Starting up',
  'loading language traineddata': 'Loading English language data',
  'initializing api': 'Starting up',
  'recognizing text': 'Reading text',
};

export default function ImageToText() {
  const toast = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState('');
  const [status, setStatus] = useState<{ label: string; p: number } | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const url = useObjectUrl(file);

  const choose = (files: File[]) => {
    const f = files[0];
    if (!f) return;
    const c = checkFile(f, { accept: IMAGE_ACCEPT, maxBytes: limits.imageMaxFileBytes, label: 'image' });
    if (!c.ok) return toast.error(c.error!);
    setFile(f);
    setText('');
    setConfidence(null);
    setError(null);
  };

  // Paste a screenshot with Ctrl+V.
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const item = [...(e.clipboardData?.items ?? [])].find((i) => i.type.startsWith('image/'));
      const f = item?.getAsFile();
      if (f) choose([new File([f], 'pasted-image.png', { type: f.type })]);
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }); // eslint-disable-line react-hooks/exhaustive-deps

  const run = async () => {
    if (!file) return;
    setStatus({ label: 'Starting', p: 0 });
    setError(null);
    try {
      const { recognizeImage } = await import('../lib/ocr');
      const r = await recognizeImage(file, (s, p) => setStatus({ label: STATUS[s] ?? 'Working', p: s === 'recognizing text' ? p : 0.02 }));
      setText(r.text);
      setConfidence(r.confidence);
      if (!r.text) setError('No text was found. Try a sharper, well-lit photo where the text is straight and large enough.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'The text reader couldn’t start. Check your connection and try again.');
    } finally {
      setStatus(null);
    }
  };

  if (!file) {
    return (
      <Card className="p-4 sm:p-6">
        <Dropzone onFiles={choose} accept={IMAGE_INPUT} title="Drop a photo or screenshot with text" hint={<>JPG, PNG, WebP… You can also paste a screenshot with <kbd>Ctrl</kbd>+<kbd>V</kbd></>} icon={<ScanText className="h-7 w-7" aria-hidden />} />
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="space-y-4 p-4 sm:p-5">
        <FileChip file={file} kind="image" onRemove={status ? undefined : () => setFile(null)} />
        {url && (
          <div className="flex max-h-[420px] items-center justify-center overflow-hidden rounded-xl bg-surface-3 ring-1 ring-line">
            <img src={url} alt="Your image" className="max-h-[420px] max-w-full object-contain" />
          </div>
        )}
        {status ? (
          <Progress value={status.p} label={status.label} />
        ) : (
          <Button size="lg" className="w-full" onClick={run} icon={<ScanText className="h-5 w-5" aria-hidden />}>{text ? 'Read again' : 'Extract text'}</Button>
        )}
        <p className="text-xs text-fg-subtle">Works best with printed English text. The first run downloads the text reader (about 4 MB) from LifeKit; after that it’s cached.</p>
      </Card>
      <Card className="flex flex-col p-4 sm:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-fg">Extracted text{confidence !== null && text ? <span className="ml-2 font-normal text-fg-subtle">· {Math.round(confidence)}% confidence</span> : null}</h2>
          <div className="flex gap-2">
            <CopyButton text={text} />
            <Button variant="outline" size="sm" disabled={!text} onClick={() => downloadText(text, `${baseOf(file.name)}.txt`)} icon={<Download className="h-4 w-4" aria-hidden />}>.txt</Button>
          </div>
        </div>
        {error && <Notice tone="warning" className="mb-3">{error}</Notice>}
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="The text from your image will appear here. You can edit it before copying." className="min-h-[320px] w-full flex-1 resize-y rounded-xl border border-line bg-surface-2 p-4 text-sm leading-relaxed text-fg placeholder:text-fg-subtle focus:border-accent focus:outline-none" />
        <Button variant="ghost" className="mt-3" onClick={() => setFile(null)} disabled={!!status} icon={<RotateCcw className="h-4 w-4" aria-hidden />}>Use another image</Button>
      </Card>
    </div>
  );
}
