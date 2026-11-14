import { useEffect, useRef, useState, type PointerEvent as RPointerEvent } from 'react';
import { Crop, FlipHorizontal, FlipVertical, RotateCcw, RotateCw } from 'lucide-react';
import { useImageFile } from '../hooks/useImageFile';
import { renderImage, toBlob } from '../lib/imageOps';
import type { OutputFormat } from '../lib/image';
import { IMAGE_ACCEPT } from '../utils/files';
import { Card } from '../components/ui/Card';
import { Dropzone } from '../components/ui/Dropzone';
import { Button } from '../components/ui/Button';
import { Segmented } from '../components/ui/Segmented';
import { FileChip } from '../components/FileChip';
import { PageLoader } from '../components/PageLoader';
import { useToast } from '../components/ui/Toast';
import { Chips } from './shared';
import { baseOf, EXT, IMAGE_INPUT, ResultImage } from './imageShared';

type Box = { x: number; y: number; w: number; h: number }; // fractions of the (rotated) image
const RATIOS = ['Free', '1:1', '4:5', '3:4', '2:3', '16:9', '9:16', '4:3', '3:2'] as const;
type Ratio = (typeof RATIOS)[number];
const ratioValue = (r: Ratio) => (r === 'Free' ? null : Number(r.split(':')[0]) / Number(r.split(':')[1]));

export default function CropImage() {
  const toast = useToast();
  const { file, image, loading, select, clear } = useImageFile(IMAGE_ACCEPT);
  const [rotate, setRotate] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [ratio, setRatio] = useState<Ratio>('Free');
  const [box, setBox] = useState<Box>({ x: 0.1, y: 0.1, w: 0.8, h: 0.8 });
  const [preview, setPreview] = useState<string | null>(null);
  const [format, setFormat] = useState<OutputFormat>('image/jpeg');
  const [result, setResult] = useState<{ blob: Blob; width: number; height: number } | null>(null);
  const area = useRef<HTMLDivElement>(null);
  const drag = useRef<{ mode: string; sx: number; sy: number; start: Box } | null>(null);

  const rw = image ? (rotate % 180 ? image.height : image.width) : 1;
  const rh = image ? (rotate % 180 ? image.width : image.height) : 1;

  // Rotated/flipped preview (downscaled for speed).
  useEffect(() => {
    if (!image) return;
    let url: string | null = null;
    let cancelled = false;
    const scale = Math.min(1, 1400 / Math.max(image.width, image.height));
    const c = renderImage(image, { rotate, flipH, flipV, outW: rw * scale, outH: rh * scale });
    toBlob(c, 'image/jpeg', 0.85).then((b) => {
      if (cancelled) return;
      url = URL.createObjectURL(b);
      setPreview(url);
    });
    c.width = 0;
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [image, rotate, flipH, flipV, rw, rh]);

  useEffect(() => {
    if (file) setFormat(file.type === 'image/png' ? 'image/png' : 'image/jpeg');
    setRotate(0); setFlipH(false); setFlipV(false); setRatio('Free');
    setBox({ x: 0.1, y: 0.1, w: 0.8, h: 0.8 });
  }, [file]);
  useEffect(() => setResult(null), [box, rotate, flipH, flipV, format]);

  // Apply a ratio: largest centred box with that shape.
  const applyRatio = (r: Ratio) => {
    setRatio(r);
    const v = ratioValue(r);
    if (!v) return;
    const imgRatio = rw / rh;
    let w = 0.9, h = (0.9 * imgRatio) / v;
    if (h > 0.9) { h = 0.9; w = (0.9 * v) / imgRatio; }
    setBox({ x: (1 - w) / 2, y: (1 - h) / 2, w, h });
  };
  useEffect(() => { if (ratio !== 'Free') applyRatio(ratio); }, [rotate]); // eslint-disable-line react-hooks/exhaustive-deps

  const onDown = (mode: string) => (e: RPointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { mode, sx: e.clientX, sy: e.clientY, start: box };
  };
  const onMove = (e: RPointerEvent) => {
    const d = drag.current;
    const el = area.current;
    if (!d || !el) return;
    const rect = el.getBoundingClientRect();
    const dx = (e.clientX - d.sx) / rect.width;
    const dy = (e.clientY - d.sy) / rect.height;
    const s = d.start;
    const MIN = 0.03;
    if (d.mode === 'move') {
      setBox({ ...s, x: Math.min(1 - s.w, Math.max(0, s.x + dx)), y: Math.min(1 - s.h, Math.max(0, s.y + dy)) });
      return;
    }
    let { x, y, w, h } = s;
    if (d.mode.includes('e')) w = Math.min(1 - x, Math.max(MIN, s.w + dx));
    if (d.mode.includes('s')) h = Math.min(1 - y, Math.max(MIN, s.h + dy));
    if (d.mode.includes('w')) { const nx = Math.min(s.x + s.w - MIN, Math.max(0, s.x + dx)); w = s.w + (s.x - nx); x = nx; }
    if (d.mode.includes('n')) { const ny = Math.min(s.y + s.h - MIN, Math.max(0, s.y + dy)); h = s.h + (s.y - ny); y = ny; }
    const v = ratioValue(ratio);
    if (v) {
      // Keep the ratio in pixel space: h = w * rw / (rh * v)
      const k = rw / (rh * v);
      h = w * k;
      if (d.mode.includes('n')) y = s.y + s.h - h;
      if (y < 0 || y + h > 1) { h = y < 0 ? s.y + s.h : 1 - y; if (y < 0) y = 0; w = h / k; if (d.mode.includes('w')) x = s.x + s.w - w; }
      if (x < 0) { x = 0; }
      if (x + w > 1) { w = 1 - x; h = w * k; }
    }
    setBox({ x, y, w, h });
  };
  const onUp = () => (drag.current = null);

  const pxW = Math.round(box.w * rw), pxH = Math.round(box.h * rh);

  const doCrop = async () => {
    if (!image) return;
    try {
      const crop = { x: box.x * rw, y: box.y * rh, w: box.w * rw, h: box.h * rh };
      const c = renderImage(image, { rotate, flipH, flipV, crop, background: format === 'image/jpeg' ? '#ffffff' : undefined });
      const blob = await toBlob(c, format, 0.92);
      setResult({ blob, width: c.width, height: c.height });
      c.width = 0;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'The image could not be cropped.');
    }
  };

  if (!file || !image) {
    return (
      <Card className="p-4 sm:p-6">
        {loading ? <PageLoader label="Opening image…" /> : <Dropzone onFiles={select} accept={IMAGE_INPUT} title="Drop an image to crop or rotate" hint="JPG, PNG, WebP and more" icon={<Crop className="h-7 w-7" aria-hidden />} />}
      </Card>
    );
  }

  const handles = ['nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w'];
  const handlePos: Record<string, string> = {
    nw: 'left-0 top-0 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize', ne: 'right-0 top-0 translate-x-1/2 -translate-y-1/2 cursor-nesw-resize',
    sw: 'left-0 bottom-0 -translate-x-1/2 translate-y-1/2 cursor-nesw-resize', se: 'right-0 bottom-0 translate-x-1/2 translate-y-1/2 cursor-nwse-resize',
    n: 'left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 cursor-ns-resize', s: 'left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2 cursor-ns-resize',
    e: 'right-0 top-1/2 translate-x-1/2 -translate-y-1/2 cursor-ew-resize', w: 'left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize',
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <Card className="space-y-4 p-4 sm:p-5">
        <div className="flex justify-center rounded-xl bg-surface-3 p-3">
          {preview && (
            <div ref={area} className="relative touch-none select-none" onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
              <img src={preview} alt="Image to crop" className="block max-h-[60vh] max-w-full" draggable={false} />
              <div
                className="absolute cursor-move border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]"
                style={{ left: `${box.x * 100}%`, top: `${box.y * 100}%`, width: `${box.w * 100}%`, height: `${box.h * 100}%` }}
                onPointerDown={onDown('move')}
                role="group"
                aria-label={`Crop area ${pxW} by ${pxH} pixels`}
              >
                <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3">
                  {Array.from({ length: 9 }, (_, i) => <span key={i} className="border border-white/30" />)}
                </div>
                {handles.map((hd) => (
                  <span key={hd} onPointerDown={onDown(hd)} className={`absolute h-5 w-5 rounded-full border-2 border-accent bg-white shadow ${handlePos[hd]} ${hd.length === 1 ? 'h-4 w-4' : ''}`} />
                ))}
              </div>
            </div>
          )}
        </div>
        <p className="text-center text-sm text-fg-muted">Drag the box to move it, or drag the corners to resize. Crop: <strong className="text-fg">{pxW} × {pxH}px</strong></p>
        {result && <ResultImage blob={result.blob} width={result.width} height={result.height} name={`${baseOf(file.name)}-cropped.${EXT[format]}`} />}
      </Card>
      <Card className="h-fit space-y-5 p-5 lg:sticky lg:top-24">
        <FileChip file={file} kind="image" meta={`${image.width} × ${image.height}`} onRemove={clear} />
        <div>
          <p className="mb-2 text-sm font-medium text-fg">Aspect ratio</p>
          <Chips label="Aspect ratio" options={[...RATIOS]} value={ratio} onChange={applyRatio} />
        </div>
        <div>
          <p className="mb-2 text-sm font-medium text-fg">Rotate & flip</p>
          <div className="grid grid-cols-4 gap-2">
            <Button variant="outline" onClick={() => setRotate((r) => (r + 270) % 360)} aria-label="Rotate left" icon={<RotateCcw className="h-4 w-4" />} />
            <Button variant="outline" onClick={() => setRotate((r) => (r + 90) % 360)} aria-label="Rotate right" icon={<RotateCw className="h-4 w-4" />} />
            <Button variant={flipH ? 'secondary' : 'outline'} onClick={() => setFlipH(!flipH)} aria-label="Flip horizontally" aria-pressed={flipH} icon={<FlipHorizontal className="h-4 w-4" />} />
            <Button variant={flipV ? 'secondary' : 'outline'} onClick={() => setFlipV(!flipV)} aria-label="Flip vertically" aria-pressed={flipV} icon={<FlipVertical className="h-4 w-4" />} />
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={() => { setRatio('Free'); setBox({ x: 0, y: 0, w: 1, h: 1 }); }}>Select whole image (rotate/flip only)</Button>
        <Segmented label="Format" value={format} onChange={setFormat} options={[{ value: 'image/jpeg', label: 'JPG' }, { value: 'image/png', label: 'PNG' }, { value: 'image/webp', label: 'WebP' }]} className="w-full" />
        <Button size="lg" className="w-full" onClick={doCrop} icon={<Crop className="h-4 w-4" aria-hidden />}>Crop image</Button>
        <Button variant="ghost" className="w-full" onClick={clear}>Use another image</Button>
      </Card>
    </div>
  );
}
