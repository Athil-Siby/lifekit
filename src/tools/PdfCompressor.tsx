import { useRef, useState } from 'react';
import { Download, FileDown, RotateCcw, X } from 'lucide-react';
import { getPageCount, optimizePdf, rasterCompressPdf } from '../lib/pdf';
import { validatePdf } from '../lib/pdfInput';
import { limits } from '../config/limits';
import { baseName, downloadBlob } from '../utils/download';
import { formatBytes, pluralize } from '../utils/format';
import { Card } from '../components/ui/Card';
import { Dropzone } from '../components/ui/Dropzone';
import { Button } from '../components/ui/Button';
import { Checkbox } from '../components/ui/Form';
import { Notice } from '../components/ui/Notice';
import { Progress } from '../components/ui/Misc';
import { FileChip } from '../components/FileChip';
import { SizeComparison } from '../components/SizeComparison';
import { PageLoader } from '../components/PageLoader';
import { useToast } from '../components/ui/Toast';
import { cn } from '../lib/cn';

type Level = 'lossless' | 'light' | 'balanced' | 'strong';

const levels: { id: Level; title: string; desc: string; dpi?: number; quality?: number }[] = [
  { id: 'lossless', title: 'Lossless', desc: 'Repacks the file structure. Text stays selectable; savings are usually small.' },
  { id: 'light', title: 'Light', desc: 'Pages become 150 DPI images at high quality. Good for scans you may print.', dpi: 150, quality: 0.8 },
  { id: 'balanced', title: 'Balanced', desc: 'Pages become 110 DPI images. Great for email and on-screen reading.', dpi: 110, quality: 0.65 },
  { id: 'strong', title: 'Strong', desc: 'Pages become 72 DPI images at lower quality. Smallest files.', dpi: 72, quality: 0.5 },
];

export default function PdfCompressor() {
  const toast = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [level, setLevel] = useState<Level>('balanced');
  const [grayscale, setGrayscale] = useState(false);
  const [stripMeta, setStripMeta] = useState(true);
  const [working, setWorking] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<Blob | null>(null);
  const abort = useRef<AbortController | null>(null);

  const select = async (files: File[]) => {
    const f = files[0];
    if (!f) return;
    const err = await validatePdf(f);
    if (err) {
      toast.error(err);
      return;
    }
    setLoading(true);
    try {
      setPages(await getPageCount(f));
      setFile(f);
      setResult(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'This PDF could not be opened.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    abort.current?.abort();
    setFile(null);
    setResult(null);
    setPages(0);
  };

  const compress = async () => {
    if (!file) return;
    const def = levels.find((l) => l.id === level)!;
    setWorking(true);
    setResult(null);
    setProgress(0);
    abort.current = new AbortController();
    try {
      const blob =
        level === 'lossless'
          ? await optimizePdf(file, { stripMetadata: stripMeta })
          : await rasterCompressPdf(file, { dpi: def.dpi!, quality: def.quality!, grayscale }, (d, t) => setProgress(d / t), abort.current.signal);
      setResult(blob);
      if (blob.size < file.size) toast.success('Compression finished');
      else toast.info('This PDF could not be made smaller with these settings.');
    } catch (e) {
      if ((e as Error)?.name === 'AbortError') toast.info('Compression cancelled.');
      else toast.error(e instanceof Error ? e.message : 'The PDF could not be compressed.');
    } finally {
      setWorking(false);
    }
  };

  if (!file) {
    return (
      <Card className="p-4 sm:p-6">
        {loading ? (
          <PageLoader label="Opening PDF…" />
        ) : (
          <Dropzone onFiles={select} accept=".pdf,application/pdf" title="Drop a PDF to compress" hint={`One PDF · up to ${formatBytes(limits.pdfMaxFileBytes)}`} icon={<FileDown className="h-7 w-7" aria-hidden />} />
        )}
      </Card>
    );
  }

  const smaller = result && result.size < file.size;
  const isRaster = level !== 'lossless';

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <Card className="p-5 sm:p-6">
        <FileChip file={file} kind="pdf" meta={pluralize(pages, 'page')} onRemove={reset} />
        <fieldset className="mt-6">
          <legend className="mb-3 text-sm font-semibold text-fg">Compression level</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {levels.map((l) => (
              <label
                key={l.id}
                className={cn(
                  'cursor-pointer rounded-xl border p-4 transition-all',
                  level === l.id ? 'border-accent bg-accent-soft ring-2 ring-accent/20' : 'border-line hover:border-line-strong',
                )}
              >
                <input type="radio" name="level" value={l.id} checked={level === l.id} onChange={() => { setLevel(l.id); setResult(null); }} className="sr-only" />
                <span className="flex items-center justify-between">
                  <span className="font-semibold text-fg">{l.title}</span>
                  {l.id === 'balanced' && <span className="text-xs font-medium text-accent-text">Recommended</span>}
                </span>
                <span className="mt-1 block text-sm text-fg-muted">{l.desc}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <div className="mt-5 space-y-3">
          {isRaster ? (
            <Checkbox checked={grayscale} onChange={(v) => { setGrayscale(v); setResult(null); }} label="Convert to greyscale" description="Removes colour for extra savings on text documents." />
          ) : (
            <Checkbox checked={stripMeta} onChange={(v) => { setStripMeta(v); setResult(null); }} label="Remove document metadata" description="Drops title, author and other properties." />
          )}
        </div>
        {isRaster && (
          <Notice tone="warning" className="mt-5" title="Image-based compression flattens pages">
            Text will no longer be selectable or searchable, and links and form fields are removed. Use “Lossless” if you need those.
          </Notice>
        )}
      </Card>

      <Card className="h-fit space-y-4 p-5 lg:sticky lg:top-24">
        {working && (
          <>
            <Progress value={isRaster ? progress : 0.5} label={isRaster ? `Compressing page ${Math.max(1, Math.round(progress * pages))} of ${pages}` : 'Optimising'} />
            {isRaster && (
              <Button variant="ghost" className="w-full" onClick={() => abort.current?.abort()} icon={<X className="h-4 w-4" aria-hidden />}>Cancel</Button>
            )}
          </>
        )}
        {!working && !result && (
          <Button size="lg" className="w-full" onClick={compress} icon={<FileDown className="h-4 w-4" aria-hidden />}>Compress PDF</Button>
        )}
        {result && (
          <>
            <SizeComparison original={file.size} result={result.size} />
            {smaller ? (
              <Button size="lg" className="w-full" onClick={() => downloadBlob(result, `${baseName(file.name)}-compressed.pdf`)} icon={<Download className="h-4 w-4" aria-hidden />}>
                Download compressed PDF
              </Button>
            ) : (
              <Notice tone="warning" title="No reduction possible with this setting">
                {level === 'lossless'
                  ? 'This PDF is already efficiently stored. Try an image-based level for scanned or image-heavy documents.'
                  : 'This PDF is probably mostly text or vector graphics, which are already compact. Turning pages into images would make it bigger, so keep your original.'}
              </Notice>
            )}
            <Button variant="outline" className="w-full" onClick={() => setResult(null)}>Try a different level</Button>
          </>
        )}
        <Button variant="ghost" className="w-full" onClick={reset} icon={<RotateCcw className="h-4 w-4" aria-hidden />}>Compress another PDF</Button>
      </Card>
    </div>
  );
}
