import { useEffect, useMemo, useRef, useState } from 'react';
import { Download, ImageDown, RotateCcw } from 'lucide-react';
import { useImageFile } from '../hooks/useImageFile';
import { useObjectUrl } from '../hooks/useObjectUrl';
import { encodeImage, FORMAT_INFO, formatFromMime, outputFilename, type EncodeResult, type OutputFormat } from '../lib/image';
import { COMPRESSIBLE_IMAGE_ACCEPT } from '../utils/files';
import { downloadBlob } from '../utils/download';
import { limits } from '../config/limits';
import { formatBytes } from '../utils/format';
import { Card } from '../components/ui/Card';
import { Dropzone } from '../components/ui/Dropzone';
import { Button } from '../components/ui/Button';
import { Range, Select } from '../components/ui/Form';
import { Notice } from '../components/ui/Notice';
import { Segmented } from '../components/ui/Segmented';
import { FileChip } from '../components/FileChip';
import { SizeComparison } from '../components/SizeComparison';
import { PageLoader } from '../components/PageLoader';

export default function ImageCompressor() {
  const { file, image, loading, select, clear } = useImageFile(COMPRESSIBLE_IMAGE_ACCEPT);
  const [format, setFormat] = useState<OutputFormat>('image/jpeg');
  const [quality, setQuality] = useState(75);
  const [maxWidth, setMaxWidth] = useState<number>(0);
  const [result, setResult] = useState<EncodeResult | null>(null);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'compressed' | 'original'>('compressed');
  const run = useRef(0);

  // Default output format follows the input.
  useEffect(() => {
    if (file) setFormat(formatFromMime(file.type));
    setMaxWidth(0);
    setView('compressed');
  }, [file]);

  // Re-encode (debounced) whenever settings change.
  useEffect(() => {
    if (!image) {
      setResult(null);
      return;
    }
    const id = ++run.current;
    setWorking(true);
    const t = window.setTimeout(async () => {
      try {
        const r = await encodeImage(image, { format, quality: quality / 100, maxWidth: maxWidth || undefined });
        if (id === run.current) {
          setResult(r);
          setError(null);
        }
      } catch (e) {
        if (id === run.current) setError(e instanceof Error ? e.message : 'Compression failed.');
      } finally {
        if (id === run.current) setWorking(false);
      }
    }, 250);
    return () => window.clearTimeout(t);
  }, [image, format, quality, maxWidth]);

  const originalUrl = useObjectUrl(file);
  const resultUrl = useObjectUrl(result?.blob);
  const widthOptions = useMemo(() => {
    if (!image) return [];
    return [3840, 2560, 1920, 1600, 1280, 1024, 800, 640].filter((w) => w < image.width);
  }, [image]);

  const fellBack = result && result.actualFormat !== format;
  const larger = result && file && result.blob.size >= file.size;
  const outName = file ? outputFilename(file.name, (result?.actualFormat as OutputFormat) ?? format, '-compressed') : '';

  if (!file) {
    return (
      <Card className="p-4 sm:p-6">
        {loading ? (
          <PageLoader label="Opening image…" />
        ) : (
          <Dropzone
            onFiles={select}
            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
            title="Drop an image here"
            hint={`JPG, PNG or WebP · up to ${formatBytes(limits.imageMaxFileBytes)}`}
            icon={<ImageDown className="h-7 w-7" aria-hidden />}
          />
        )}
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <Card className="h-fit space-y-5 p-5">
        <FileChip file={file} kind="image" meta={image ? `${image.width} × ${image.height}` : undefined} onRemove={clear} />
        <Select label="Output format" value={format} onChange={(e) => setFormat(e.target.value as OutputFormat)}>
          <option value="image/jpeg">JPG – best for photos</option>
          <option value="image/webp">WebP – smallest, keeps transparency</option>
          <option value="image/png">PNG – lossless</option>
        </Select>
        {FORMAT_INFO[format].lossy ? (
          <Range label="Quality" min={10} max={100} value={quality} onChange={setQuality} display={`${quality}%`} />
        ) : (
          <Notice tone="info">PNG is lossless, so there is no quality setting. Reduce the width below, or choose WebP or JPG for smaller files.</Notice>
        )}
        <Select label="Maximum width" value={maxWidth} onChange={(e) => setMaxWidth(Number(e.target.value))} hint="Scaling down large photos gives the biggest savings.">
          <option value={0}>Keep original ({image?.width ?? '?'} px)</option>
          {widthOptions.map((w) => (
            <option key={w} value={w}>{w} px wide</option>
          ))}
        </Select>
        {format === 'image/jpeg' && file.type !== 'image/jpeg' && (
          <p className="text-xs text-fg-subtle">JPG has no transparency; transparent areas will become white.</p>
        )}
        <Button variant="ghost" onClick={clear} icon={<RotateCcw className="h-4 w-4" aria-hidden />} className="w-full">
          Compress another image
        </Button>
      </Card>

      <div className="space-y-4">
        {error && <Notice tone="error">{error}</Notice>}
        {result && (
          <>
            <SizeComparison original={file.size} result={result.blob.size} />
            {larger && (
              <Notice tone="warning" title="This didn’t make the file smaller">
                The original is already well compressed. Try a lower quality, a smaller width, or WebP. If none of those help, keep your original file.
              </Notice>
            )}
            {fellBack && (
              <Notice tone="warning">
                Your browser can’t create {FORMAT_INFO[format].label} files, so the image was saved as {result.actualFormat.replace('image/', '').toUpperCase()} instead.
              </Notice>
            )}
          </>
        )}
        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
            <Segmented
              size="sm"
              label="Preview"
              value={view}
              onChange={setView}
              options={[
                { value: 'compressed', label: 'Compressed' },
                { value: 'original', label: 'Original' },
              ]}
            />
            <span className="text-xs text-fg-subtle" aria-live="polite">
              {working ? 'Compressing…' : result ? `${result.width} × ${result.height} · ${formatBytes(result.blob.size)}` : ''}
            </span>
          </div>
          <div className="checkerboard flex max-h-[520px] min-h-[260px] items-center justify-center overflow-auto">
            {(view === 'original' ? originalUrl : resultUrl) ? (
              <img
                src={(view === 'original' ? originalUrl : resultUrl)!}
                alt={view === 'original' ? `Original: ${file.name}` : `Compressed preview of ${file.name}`}
                className="max-h-[520px] w-auto max-w-full object-contain"
              />
            ) : (
              <PageLoader label="Compressing…" />
            )}
          </div>
        </Card>
        {/* Download kept apart from any ad placement. */}
        <div className="flex flex-wrap items-center gap-3">
          <Button size="lg" disabled={!result || working} onClick={() => result && downloadBlob(result.blob, outName)} icon={<Download className="h-4 w-4" aria-hidden />}>
            Download {result ? `(${formatBytes(result.blob.size)})` : ''}
          </Button>
          {result && <span className="text-sm text-fg-subtle break-all">{outName}</span>}
        </div>
      </div>
    </div>
  );
}
