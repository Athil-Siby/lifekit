import { useEffect, useMemo, useState } from 'react';
import { Link2, Link2Off, RotateCcw, Scaling } from 'lucide-react';
import { useImageFile } from '../hooks/useImageFile';
import { useObjectUrl } from '../hooks/useObjectUrl';
import { renderImage, toBlob } from '../lib/imageOps';
import type { OutputFormat } from '../lib/image';
import { IMAGE_ACCEPT } from '../utils/files';
import { formatBytes } from '../utils/format';
import { Card } from '../components/ui/Card';
import { Dropzone } from '../components/ui/Dropzone';
import { Button } from '../components/ui/Button';
import { Input, Range, Select } from '../components/ui/Form';
import { Segmented } from '../components/ui/Segmented';
import { FileChip } from '../components/FileChip';
import { PageLoader } from '../components/PageLoader';
import { useToast } from '../components/ui/Toast';
import { baseOf, EXT, IMAGE_INPUT, ResultImage } from './imageShared';

const PRESETS: { label: string; w: number; h: number }[] = [
  { label: 'Instagram post (1080 × 1080)', w: 1080, h: 1080 },
  { label: 'Instagram portrait (1080 × 1350)', w: 1080, h: 1350 },
  { label: 'Instagram / WhatsApp story (1080 × 1920)', w: 1080, h: 1920 },
  { label: 'YouTube thumbnail (1280 × 720)', w: 1280, h: 720 },
  { label: 'Facebook cover (1640 × 624)', w: 1640, h: 624 },
  { label: 'LinkedIn banner (1584 × 396)', w: 1584, h: 396 },
  { label: 'X / Twitter post (1600 × 900)', w: 1600, h: 900 },
  { label: 'Profile picture (500 × 500)', w: 500, h: 500 },
  { label: 'Passport photo 35×45 mm (413 × 531)', w: 413, h: 531 },
  { label: 'Full HD (1920 × 1080)', w: 1920, h: 1080 },
  { label: 'HD (1280 × 720)', w: 1280, h: 720 },
];

export default function ImageResizer() {
  const toast = useToast();
  const { file, image, loading, select, clear } = useImageFile(IMAGE_ACCEPT);
  const [mode, setMode] = useState<'pixels' | 'percent' | 'preset'>('pixels');
  const [w, setW] = useState('');
  const [h, setH] = useState('');
  const [lock, setLock] = useState(true);
  const [pct, setPct] = useState(50);
  const [preset, setPreset] = useState(0);
  const [fit, setFit] = useState<'cover' | 'contain' | 'stretch'>('cover');
  const [format, setFormat] = useState<OutputFormat>('image/jpeg');
  const [quality, setQuality] = useState(90);
  const [result, setResult] = useState<{ blob: Blob; width: number; height: number } | null>(null);
  const [working, setWorking] = useState(false);
  const originalUrl = useObjectUrl(file);

  useEffect(() => {
    if (!image || !file) return;
    setW(String(image.width));
    setH(String(image.height));
    setFormat(file.type === 'image/png' ? 'image/png' : file.type === 'image/webp' ? 'image/webp' : 'image/jpeg');
    setResult(null);
  }, [image, file]);
  useEffect(() => setResult(null), [mode, w, h, pct, preset, fit, format, quality]);

  const target = useMemo(() => {
    if (!image) return null;
    if (mode === 'percent') return { w: Math.max(1, Math.round((image.width * pct) / 100)), h: Math.max(1, Math.round((image.height * pct) / 100)), ratioChange: false };
    if (mode === 'preset') return { w: PRESETS[preset].w, h: PRESETS[preset].h, ratioChange: true };
    const W = Math.round(Number(w)), H = Math.round(Number(h));
    if (!(W > 0 && H > 0)) return null;
    return { w: W, h: H, ratioChange: Math.abs(W / H - image.width / image.height) > 0.01 };
  }, [image, mode, w, h, pct, preset]);

  const setWidth = (v: string) => {
    setW(v);
    if (lock && image && Number(v) > 0) setH(String(Math.max(1, Math.round((Number(v) * image.height) / image.width))));
  };
  const setHeight = (v: string) => {
    setH(v);
    if (lock && image && Number(v) > 0) setW(String(Math.max(1, Math.round((Number(v) * image.width) / image.height))));
  };

  const tooBig = target && target.w * target.h > 50_000_000;

  const resize = async () => {
    if (!image || !target) return;
    setWorking(true);
    try {
      const c = renderImage(image, { outW: target.w, outH: target.h, fit: target.ratioChange ? fit : 'stretch', background: format === 'image/jpeg' || fit === 'contain' ? '#ffffff' : undefined });
      const blob = await toBlob(c, format, quality / 100);
      setResult({ blob, width: c.width, height: c.height });
      c.width = 0;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'The image could not be resized.');
    } finally {
      setWorking(false);
    }
  };

  if (!file || !image) {
    return (
      <Card className="p-4 sm:p-6">
        {loading ? <PageLoader label="Opening image…" /> : <Dropzone onFiles={select} accept={IMAGE_INPUT} title="Drop an image to resize" hint="JPG, PNG, WebP, GIF, BMP or AVIF" icon={<Scaling className="h-7 w-7" aria-hidden />} />}
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <Card className="space-y-4 p-4 sm:p-5">
        {result ? (
          <ResultImage blob={result.blob} width={result.width} height={result.height} name={`${baseOf(file.name)}-${result.width}x${result.height}.${EXT[format]}`} />
        ) : (
          originalUrl && (
            <div className="checkerboard flex max-h-[420px] items-center justify-center overflow-hidden rounded-xl ring-1 ring-line">
              <img src={originalUrl} alt="Original" className="max-h-[420px] max-w-full object-contain" />
            </div>
          )
        )}
        <p className="text-sm text-fg-muted">Original: {image.width} × {image.height}px · {formatBytes(file.size)}</p>
      </Card>
      <Card className="h-fit space-y-5 p-5 lg:sticky lg:top-24">
        <FileChip file={file} kind="image" meta={`${image.width} × ${image.height}`} onRemove={clear} />
        <Segmented label="Resize by" value={mode} onChange={setMode} options={[{ value: 'pixels', label: 'Pixels' }, { value: 'percent', label: 'Percent' }, { value: 'preset', label: 'Presets' }]} className="w-full" />
        {mode === 'pixels' && (
          <div className="flex items-end gap-2">
            <Input label="Width (px)" inputMode="numeric" value={w} onChange={(e) => setWidth(e.target.value)} />
            <Button variant={lock ? 'secondary' : 'outline'} size="icon" className="mb-0 h-11 w-11 shrink-0" onClick={() => setLock(!lock)} aria-label={lock ? 'Unlock aspect ratio' : 'Lock aspect ratio'} aria-pressed={lock} icon={lock ? <Link2 className="h-4 w-4" /> : <Link2Off className="h-4 w-4" />} />
            <Input label="Height (px)" inputMode="numeric" value={h} onChange={(e) => setHeight(e.target.value)} />
          </div>
        )}
        {mode === 'percent' && <Range label="Scale" min={5} max={200} step={5} value={pct} onChange={setPct} display={`${pct}%`} />}
        {mode === 'preset' && (
          <Select label="Size" value={preset} onChange={(e) => setPreset(Number(e.target.value))}>
            {PRESETS.map((p, i) => <option key={p.label} value={i}>{p.label}</option>)}
          </Select>
        )}
        {target?.ratioChange && (
          <Segmented label="When the shape is different" value={fit} onChange={setFit} options={[{ value: 'cover', label: 'Crop to fill' }, { value: 'contain', label: 'Fit (white bars)' }, { value: 'stretch', label: 'Stretch' }]} className="w-full" />
        )}
        <Segmented label="Format" value={format} onChange={setFormat} options={[{ value: 'image/jpeg', label: 'JPG' }, { value: 'image/png', label: 'PNG' }, { value: 'image/webp', label: 'WebP' }]} className="w-full" />
        {format !== 'image/png' && <Range label="Quality" min={40} max={100} value={quality} onChange={setQuality} display={`${quality}%`} />}
        {target && <p className="text-sm text-fg-muted">New size: <strong className="text-fg">{target.w} × {target.h}px</strong></p>}
        {tooBig && <p className="text-sm text-danger">That’s too large to create in the browser. Choose a smaller size.</p>}
        <Button size="lg" className="w-full" onClick={resize} loading={working} disabled={!target || !!tooBig || working}>Resize image</Button>
        <Button variant="ghost" className="w-full" onClick={clear} icon={<RotateCcw className="h-4 w-4" aria-hidden />}>Resize another image</Button>
      </Card>
    </div>
  );
}
