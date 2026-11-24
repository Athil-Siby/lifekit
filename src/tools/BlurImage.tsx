import { useEffect, useRef, useState, type PointerEvent as RPointerEvent } from 'react';
import { Download, EyeOff, Undo2 } from 'lucide-react';
import { useImageFile } from '../hooks/useImageFile';
import { IMAGE_ACCEPT } from '../utils/files';
import { downloadBlob } from '../utils/download';
import { Card } from '../components/ui/Card';
import { Dropzone } from '../components/ui/Dropzone';
import { Button } from '../components/ui/Button';
import { Range } from '../components/ui/Form';
import { Segmented } from '../components/ui/Segmented';
import { PageLoader } from '../components/PageLoader';
import { IMAGE_INPUT, baseOf } from './imageShared';

interface Rect { x: number; y: number; w: number; h: number }

export default function BlurImage() {
  const { file, image, loading, select, clear } = useImageFile(IMAGE_ACCEPT);
  const [rects, setRects] = useState<Rect[]>([]);
  const [mode, setMode] = useState<'pixel' | 'black'>('pixel');
  const [strength, setStrength] = useState(14);
  const [draft, setDraft] = useState<Rect | null>(null);
  const ref = useRef<HTMLCanvasElement>(null);
  const start = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => setRects([]), [file]);
  useEffect(() => {
    if (!image || !ref.current) return;
    const c = ref.current, s = Math.min(1, 2400 / Math.max(image.width, image.height));
    c.width = Math.round(image.width * s); c.height = Math.round(image.height * s);
    const ctx = c.getContext('2d')!;
    ctx.imageSmoothingEnabled = true; ctx.drawImage(image.source, 0, 0, c.width, c.height);
    for (const r of [...rects, ...(draft ? [draft] : [])]) {
      const x = Math.round(Math.min(r.x, r.x + r.w) * c.width), y = Math.round(Math.min(r.y, r.y + r.h) * c.height);
      const w = Math.max(1, Math.round(Math.abs(r.w) * c.width)), h = Math.max(1, Math.round(Math.abs(r.h) * c.height));
      if (mode === 'black') { ctx.fillStyle = '#000'; ctx.fillRect(x, y, w, h); continue; }
      const block = Math.max(4, Math.round((Math.min(c.width, c.height) * strength) / 600));
      const tmp = document.createElement('canvas'); tmp.width = Math.max(1, Math.ceil(w / block)); tmp.height = Math.max(1, Math.ceil(h / block));
      tmp.getContext('2d')!.drawImage(c, x, y, w, h, 0, 0, tmp.width, tmp.height);
      ctx.imageSmoothingEnabled = false; ctx.drawImage(tmp, 0, 0, tmp.width, tmp.height, x, y, w, h); ctx.imageSmoothingEnabled = true;
    }
  }, [image, rects, draft, mode, strength]);

  const pt = (e: RPointerEvent<HTMLCanvasElement>) => { const b = e.currentTarget.getBoundingClientRect(); return { x: (e.clientX - b.left) / b.width, y: (e.clientY - b.top) / b.height }; };
  const down = (e: RPointerEvent<HTMLCanvasElement>) => { e.currentTarget.setPointerCapture(e.pointerId); start.current = pt(e); };
  const move = (e: RPointerEvent<HTMLCanvasElement>) => { if (!start.current) return; const p = pt(e); setDraft({ x: start.current.x, y: start.current.y, w: p.x - start.current.x, h: p.y - start.current.y }); };
  const up = () => { if (draft && Math.abs(draft.w) > 0.01 && Math.abs(draft.h) > 0.01) setRects((r) => [...r, draft]); setDraft(null); start.current = null; };

  if (!file || !image) return <Card className="p-4 sm:p-6">{loading ? <PageLoader label="Opening image…" /> : <Dropzone onFiles={select} accept={IMAGE_INPUT} title="Drop a screenshot or photo" hint="Hide names, numbers, faces or addresses before sharing" icon={<EyeOff className="h-7 w-7" aria-hidden />} />}</Card>;
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <Card className="flex flex-col items-center gap-2 p-3">
        <canvas ref={ref} onPointerDown={down} onPointerMove={move} onPointerUp={up} className="h-auto max-h-[70vh] max-w-full cursor-crosshair touch-none rounded-lg" aria-label="Drag over the parts to hide" />
        <p className="text-sm text-fg-muted">Drag over anything you want to hide.</p>
      </Card>
      <Card className="h-fit space-y-4 p-5">
        <Segmented label="Hide with" value={mode} onChange={setMode} options={[{ value: 'pixel', label: 'Pixelate' }, { value: 'black', label: 'Black box' }]} className="w-full" />
        {mode === 'pixel' && <Range label="Strength" min={6} max={40} value={strength} onChange={setStrength} />}
        <Button variant="outline" className="w-full" disabled={!rects.length} onClick={() => setRects((r) => r.slice(0, -1))} icon={<Undo2 className="h-4 w-4" aria-hidden />}>Undo ({rects.length})</Button>
        <Button size="lg" className="w-full" disabled={!rects.length} onClick={() => ref.current!.toBlob((b) => b && downloadBlob(b, `${baseOf(file.name)}-hidden.png`), 'image/png')} icon={<Download className="h-5 w-5" aria-hidden />}>Download</Button>
        <p className="text-xs text-fg-subtle">For bank details, IDs or passwords, use Black box: it removes the information completely.</p>
        <Button variant="ghost" className="w-full" onClick={clear}>Use another image</Button>
      </Card>
    </div>
  );
}
