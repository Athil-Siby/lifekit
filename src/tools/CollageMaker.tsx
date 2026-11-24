import { useEffect, useRef, useState } from 'react';
import { Download, LayoutGrid, X } from 'lucide-react';
import { decodeImage, releaseImage, type DecodedImage } from '../lib/image';
import { downloadBlob } from '../utils/download';
import { Card } from '../components/ui/Card';
import { Dropzone } from '../components/ui/Dropzone';
import { Button } from '../components/ui/Button';
import { Range } from '../components/ui/Form';
import { Segmented } from '../components/ui/Segmented';
import { useToast } from '../components/ui/Toast';
import { IMAGE_INPUT } from './imageShared';

const SHAPES = { square: [2160, 2160], portrait: [2160, 2700], story: [1620, 2880], landscape: [2880, 1620] } as const;

/** Rows layout: split n photos into balanced rows. */
function rowsFor(n: number, landscape: boolean): number[] {
  if (n <= 1) return [1];
  if (n === 2) return landscape ? [2] : [1, 1];
  if (n === 3) return landscape ? [3] : [1, 2];
  if (n === 4) return [2, 2];
  if (n === 5) return [2, 3];
  if (n === 6) return landscape ? [3, 3] : [2, 2, 2];
  if (n === 7) return [2, 3, 2];
  if (n === 8) return [3, 2, 3];
  return [3, 3, 3];
}

export default function CollageMaker() {
  const toast = useToast();
  const [imgs, setImgs] = useState<{ id: number; img: DecodedImage }[]>([]);
  const [shape, setShape] = useState<keyof typeof SHAPES>('square');
  const [gap, setGap] = useState(16);
  const [radius, setRadius] = useState(12);
  const [bg, setBg] = useState('#ffffff');
  const ref = useRef<HTMLCanvasElement>(null);
  const imgsRef = useRef(imgs); imgsRef.current = imgs;
  useEffect(() => () => imgsRef.current.forEach((x) => releaseImage(x.img)), []);

  const add = async (files: File[]) => {
    for (const f of files.slice(0, 9 - imgs.length)) {
      try { const img = await decodeImage(f); setImgs((x) => [...x, { id: Math.random(), img }]); } catch { toast.error(`“${f.name}” couldn’t be opened.`); }
    }
  };

  useEffect(() => {
    const c = ref.current; if (!c || !imgs.length) return;
    const [W, H] = SHAPES[shape]; c.width = W; c.height = H;
    const ctx = c.getContext('2d')!; ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    const rows = rowsFor(imgs.length, shape === 'landscape');
    const g = (gap / 1000) * W, rh = (H - g * (rows.length + 1)) / rows.length;
    let k = 0;
    rows.forEach((cols, r) => {
      const cw = (W - g * (cols + 1)) / cols;
      for (let i = 0; i < cols; i++) {
        const it = imgs[k++]; if (!it) return;
        const x = g + i * (cw + g), y = g + r * (rh + g);
        const s = Math.max(cw / it.img.width, rh / it.img.height), sw = cw / s, sh = rh / s;
        ctx.save(); ctx.beginPath(); ctx.roundRect(x, y, cw, rh, (radius / 1000) * W); ctx.clip();
        ctx.drawImage(it.img.source, (it.img.width - sw) / 2, (it.img.height - sh) / 2, sw, sh, x, y, cw, rh); ctx.restore();
      }
    });
  }, [imgs, shape, gap, radius, bg]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <Card className="space-y-4 p-4 sm:p-5">
        {imgs.length ? <canvas ref={ref} className="mx-auto h-auto max-h-[65vh] max-w-full rounded-lg shadow" aria-label="Collage preview" /> : null}
        {imgs.length < 9 && <Dropzone onFiles={add} multiple accept={IMAGE_INPUT} compact={imgs.length > 0} title={imgs.length ? `Add more photos (${imgs.length}/9)` : 'Drop 2–9 photos'} icon={<LayoutGrid className="h-7 w-7" aria-hidden />} />}
        {imgs.length > 0 && <div className="flex flex-wrap gap-2">{imgs.map((x, i) => <button key={x.id} type="button" onClick={() => { releaseImage(x.img); setImgs((a) => a.filter((y) => y.id !== x.id)); }} className="relative rounded-md bg-surface-3 px-2 py-1 text-xs text-fg-muted" aria-label={`Remove photo ${i + 1}`}>Photo {i + 1} <X className="inline h-3 w-3" /></button>)}</div>}
      </Card>
      <Card className="h-fit space-y-4 p-5">
        <Segmented label="Shape" value={shape} onChange={setShape} options={[{ value: 'square', label: 'Square' }, { value: 'portrait', label: '4:5' }, { value: 'story', label: 'Story' }, { value: 'landscape', label: 'Wide' }]} className="w-full" />
        <Range label="Spacing" min={0} max={40} value={gap} onChange={setGap} />
        <Range label="Rounded corners" min={0} max={40} value={radius} onChange={setRadius} />
        <label className="flex items-center gap-3 text-sm font-medium text-fg">Background <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="h-9 w-14 rounded-lg border border-line" /></label>
        <Button size="lg" className="w-full" disabled={imgs.length < 1} onClick={() => ref.current!.toBlob((b) => b && downloadBlob(b, 'collage.jpg'), 'image/jpeg', 0.92)} icon={<Download className="h-5 w-5" aria-hidden />}>Download collage</Button>
      </Card>
    </div>
  );
}
