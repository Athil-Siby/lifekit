import { useEffect, useRef, useState, type PointerEvent as RPointerEvent } from 'react';
import { Download, IdCard } from 'lucide-react';
import { useImageFile } from '../hooks/useImageFile';
import { renderImage, toBlob } from '../lib/imageOps';
import { IMAGE_ACCEPT } from '../utils/files';
import { downloadBlob } from '../utils/download';
import { Card } from '../components/ui/Card';
import { Dropzone } from '../components/ui/Dropzone';
import { Button } from '../components/ui/Button';
import { Range, Select } from '../components/ui/Form';
import { Segmented } from '../components/ui/Segmented';
import { PageLoader } from '../components/PageLoader';
import { IMAGE_INPUT } from './imageShared';

const SIZES = [
  { id: '35x45', label: '35 × 45 mm – India passport, UK, EU/Schengen, Australia', w: 35, h: 45 },
  { id: '51x51', label: '2 × 2 in (51 × 51 mm) – US passport, India visa (OCI)', w: 51, h: 51 },
  { id: '50x70', label: '50 × 70 mm – Canada passport', w: 50, h: 70 },
  { id: '33x48', label: '33 × 48 mm – China visa', w: 33, h: 48 },
  { id: '40x60', label: '40 × 60 mm', w: 40, h: 60 },
  { id: '25x35', label: '25 × 35 mm – stamp size', w: 25, h: 35 },
];
const DPI = 300;
const mm = (v: number) => Math.round((v / 25.4) * DPI);

export default function PassportPhoto() {
  const { file, image, loading, select, clear } = useImageFile(IMAGE_ACCEPT);
  const [sizeId, setSizeId] = useState('35x45');
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0.5, y: 0.4 });
  const [sheet, setSheet] = useState<'4x6' | 'a4'>('4x6');
  const [preview, setPreview] = useState<string | null>(null);
  const drag = useRef<{ sx: number; sy: number; px: number; py: number } | null>(null);
  const size = SIZES.find((s) => s.id === sizeId)!;
  const ratio = size.w / size.h;

  /** Crop rectangle (in source pixels) for the current zoom/position. */
  const crop = () => {
    if (!image) return { x: 0, y: 0, w: 1, h: 1 };
    let h = image.height / zoom, w = h * ratio;
    if (w > image.width / zoom) { w = image.width / zoom; h = w / ratio; }
    return { x: Math.min(image.width - w, Math.max(0, pos.x * image.width - w / 2)), y: Math.min(image.height - h, Math.max(0, pos.y * image.height - h / 2)), w, h };
  };

  useEffect(() => {
    if (!image) return;
    const c = renderImage(image, { crop: crop(), outW: 360, outH: 360 / ratio, background: '#ffffff' });
    setPreview(c.toDataURL('image/jpeg', 0.9));
  }, [image, zoom, pos, sizeId]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { setZoom(1); setPos({ x: 0.5, y: 0.4 }); }, [file]);

  const onDown = (e: RPointerEvent) => { (e.target as HTMLElement).setPointerCapture(e.pointerId); drag.current = { sx: e.clientX, sy: e.clientY, px: pos.x, py: pos.y }; };
  const onMove = (e: RPointerEvent<HTMLDivElement>) => {
    const d = drag.current; if (!d || !image) return;
    const r = e.currentTarget.getBoundingClientRect(); const c = crop();
    setPos({ x: Math.min(1, Math.max(0, d.px - ((e.clientX - d.sx) / r.width) * (c.w / image.width))), y: Math.min(1, Math.max(0, d.py - ((e.clientY - d.sy) / r.height) * (c.h / image.height))) });
  };

  const single = () => renderImage(image!, { crop: crop(), outW: mm(size.w), outH: mm(size.h), background: '#ffffff' });
  const downloadSingle = async () => { const c = single(); downloadBlob(await toBlob(c, 'image/jpeg', 0.95), `passport-photo-${size.id}.jpg`); };
  const downloadSheet = async () => {
    const photo = single();
    const [SW, SH] = sheet === '4x6' ? [mm(152.4), mm(101.6)] : [mm(210), mm(297)];
    const gap = mm(3), pw = photo.width, ph = photo.height;
    const cols = Math.floor((SW - gap) / (pw + gap)), rows = Math.floor((SH - gap) / (ph + gap));
    const c = document.createElement('canvas'); c.width = SW; c.height = SH;
    const ctx = c.getContext('2d')!; ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, SW, SH);
    const ox = (SW - cols * pw - (cols - 1) * gap) / 2, oy = (SH - rows * ph - (rows - 1) * gap) / 2;
    ctx.strokeStyle = '#cccccc'; ctx.lineWidth = 2;
    for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) { const x = ox + k * (pw + gap), y = oy + r * (ph + gap); ctx.drawImage(photo, x, y); ctx.strokeRect(x, y, pw, ph); }
    downloadBlob(await toBlob(c, 'image/jpeg', 0.95), `passport-photos-${cols * rows}-on-${sheet}.jpg`);
  };

  if (!file || !image) {
    return <Card className="p-4 sm:p-6">{loading ? <PageLoader label="Opening photo…" /> : <Dropzone onFiles={select} accept={IMAGE_INPUT} title="Drop a photo of your face" hint="Front-facing, plain light background, good lighting" icon={<IdCard className="h-7 w-7" aria-hidden />} />}</Card>;
  }
  const c = crop();
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <Card className="flex flex-col items-center gap-4 p-5">
        <div className="relative w-full max-w-[300px] cursor-move touch-none overflow-hidden rounded-md bg-white shadow ring-1 ring-line" style={{ aspectRatio: `${size.w} / ${size.h}` }} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={() => (drag.current = null)}>
          {preview && <img src={preview} alt="Passport photo preview" className="h-full w-full select-none" draggable={false} />}
          <div className="pointer-events-none absolute left-1/2 top-[12%] h-[62%] w-[58%] -translate-x-1/2 rounded-[50%] border-2 border-dashed border-accent/70" aria-hidden />
        </div>
        <p className="max-w-sm text-center text-sm text-fg-muted">Drag to move. Fit the face inside the oval: head and shoulders visible, eyes about a third from the top.</p>
        <p className="text-xs text-fg-subtle">Uses {Math.round(c.w)} × {Math.round(c.h)} px of your photo → {mm(size.w)} × {mm(size.h)} px at 300 DPI</p>
      </Card>
      <Card className="h-fit space-y-5 p-5">
        <Select label="Photo size" value={sizeId} onChange={(e) => setSizeId(e.target.value)}>{SIZES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}</Select>
        <Range label="Zoom" min={1} max={4} step={0.05} value={zoom} onChange={setZoom} display={`${zoom.toFixed(1)}×`} />
        <Button className="w-full" onClick={downloadSingle} icon={<Download className="h-4 w-4" aria-hidden />}>Download single photo</Button>
        <Segmented label="Print sheet" value={sheet} onChange={setSheet} options={[{ value: '4x6', label: '4 × 6 in photo paper' }, { value: 'a4', label: 'A4 paper' }]} className="w-full" />
        <Button size="lg" className="w-full" onClick={downloadSheet} icon={<Download className="h-5 w-5" aria-hidden />}>Download print sheet</Button>
        <p className="text-xs text-fg-subtle">Print at 100% (“actual size”), not “fit to page”. Rules differ by country: check the official photo requirements, including background colour. This tool doesn’t change the background.</p>
        <Button variant="ghost" className="w-full" onClick={clear}>Use another photo</Button>
      </Card>
    </div>
  );
}
