import { useEffect, useState } from 'react';
import { Minimize2, RotateCcw } from 'lucide-react';
import { useImageFile } from '../hooks/useImageFile';
import { compressToTarget } from '../lib/imageOps';
import { IMAGE_ACCEPT } from '../utils/files';
import { formatBytes } from '../utils/format';
import { Card } from '../components/ui/Card';
import { Dropzone } from '../components/ui/Dropzone';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Form';
import { Notice } from '../components/ui/Notice';
import { Progress } from '../components/ui/Misc';
import { FileChip } from '../components/FileChip';
import { PageLoader } from '../components/PageLoader';
import { useToast } from '../components/ui/Toast';
import { Chips } from './shared';
import { baseOf, IMAGE_INPUT, ResultImage } from './imageShared';

const SIZES = [10, 20, 30, 50, 100, 200, 500, 1000];

export default function CompressToKb() {
  const toast = useToast();
  const { file, image, loading, select, clear } = useImageFile(IMAGE_ACCEPT);
  const [kb, setKb] = useState('50');
  const [maxW, setMaxW] = useState('');
  const [maxH, setMaxH] = useState('');
  const [working, setWorking] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<Awaited<ReturnType<typeof compressToTarget>> | null>(null);

  useEffect(() => setResult(null), [kb, maxW, maxH, file]);
  const target = Math.round(Number(kb));
  const valid = target >= 2 && target <= 20000;

  const run = async () => {
    if (!image) return;
    setWorking(true);
    setProgress(0);
    try {
      const r = await compressToTarget(image, target * 1000, { maxW: Number(maxW) || undefined, maxH: Number(maxH) || undefined }, setProgress);
      setResult(r);
      if (r.reached) toast.success(`Done: ${formatBytes(r.blob.size)}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'The image could not be compressed.');
    } finally {
      setWorking(false);
    }
  };

  if (!file || !image) {
    return (
      <Card className="p-4 sm:p-6">
        {loading ? <PageLoader label="Opening image…" /> : <Dropzone onFiles={select} accept={IMAGE_INPUT} title="Drop a photo or signature" hint="JPG, PNG, WebP and more" icon={<Minimize2 className="h-7 w-7" aria-hidden />} />}
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <Card className="space-y-4 p-4 sm:p-5">
        {working && <Progress value={progress} label="Finding the best quality" />}
        {result ? (
          <>
            {!result.reached && <Notice tone="warning" title={`Couldn’t get under ${target} KB`}>This is the smallest version possible ({formatBytes(result.blob.size)}). Try a bigger target size.</Notice>}
            <ResultImage blob={result.blob} width={result.width} height={result.height} name={`${baseOf(file.name)}-${target}kb.jpg`} note={`was ${formatBytes(file.size)}`} />
          </>
        ) : (
          <div className="flex min-h-[200px] flex-col items-center justify-center rounded-xl bg-surface-2 p-6 text-center text-fg-muted">
            <p className="text-lg font-semibold text-fg">{formatBytes(file.size)}</p>
            <p className="text-sm">{image.width} × {image.height}px. Pick a target size and press Compress.</p>
          </div>
        )}
      </Card>
      <Card className="h-fit space-y-5 p-5 lg:sticky lg:top-24">
        <FileChip file={file} kind="image" meta={`${image.width} × ${image.height}`} onRemove={clear} />
        <div>
          <p className="mb-2 text-sm font-medium text-fg">Target size</p>
          <Chips label="Target size in KB" options={SIZES} value={SIZES.includes(target) ? target : null} onChange={(v) => setKb(String(v))} format={(v) => (v >= 1000 ? `${v / 1000} MB` : `${v} KB`)} />
        </div>
        <Input label="Or type a size (KB)" inputMode="numeric" value={kb} onChange={(e) => setKb(e.target.value)} error={kb && !valid ? 'Enter a size between 2 and 20000 KB.' : null} />
        <details className="rounded-xl border border-line p-3">
          <summary className="cursor-pointer text-sm font-medium text-fg">Required pixel size? (optional)</summary>
          <p className="mt-2 text-xs text-fg-subtle">Some forms ask for a maximum size, such as 200 × 230 px for a photo or 140 × 60 px for a signature.</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Input label="Max width" inputMode="numeric" value={maxW} onChange={(e) => setMaxW(e.target.value)} placeholder="Any" />
            <Input label="Max height" inputMode="numeric" value={maxH} onChange={(e) => setMaxH(e.target.value)} placeholder="Any" />
          </div>
        </details>
        <Button size="lg" className="w-full" onClick={run} loading={working} disabled={!valid || working}>Compress to {valid ? `${target} KB` : '…'}</Button>
        <p className="text-xs text-fg-subtle">Output is JPG, the format almost every form accepts.</p>
        <Button variant="ghost" className="w-full" onClick={clear} icon={<RotateCcw className="h-4 w-4" aria-hidden />}>Use another image</Button>
      </Card>
    </div>
  );
}
