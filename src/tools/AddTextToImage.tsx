import { useEffect, useRef, useState } from 'react';
import { Download, Type } from 'lucide-react';
import { useImageFile } from '../hooks/useImageFile';
import { IMAGE_ACCEPT } from '../utils/files';
import { downloadBlob } from '../utils/download';
import { Card } from '../components/ui/Card';
import { Dropzone } from '../components/ui/Dropzone';
import { Button } from '../components/ui/Button';
import { Input, Range } from '../components/ui/Form';
import { Segmented } from '../components/ui/Segmented';
import { PageLoader } from '../components/PageLoader';
import { IMAGE_INPUT, baseOf } from './imageShared';

const FONTS = { meme: 'Impact, "Arial Black", "Helvetica Neue", sans-serif', clean: '"Inter Variable", system-ui, sans-serif', serif: 'Georgia, "Times New Roman", serif' };

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxW: number) {
  const lines: string[] = [];
  for (const para of text.split('\n')) { let cur = ''; for (const w of para.split(' ')) { const t = cur ? `${cur} ${w}` : w; if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; } lines.push(cur); }
  return lines;
}

export default function AddTextToImage() {
  const { file, image, loading, select, clear } = useImageFile(IMAGE_ACCEPT);
  const [top, setTop] = useState('WHEN THE WIFI');
  const [bottom, setBottom] = useState('FINALLY CONNECTS');
  const [style, setStyle] = useState<keyof typeof FONTS>('meme');
  const [size, setSize] = useState(10);
  const [color, setColor] = useState('#ffffff');
  const [upper, setUpper] = useState(true);
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!image || !ref.current) return;
    const c = ref.current, s = Math.min(1, 2000 / Math.max(image.width, image.height));
    c.width = Math.round(image.width * s); c.height = Math.round(image.height * s);
    const ctx = c.getContext('2d')!;
    ctx.drawImage(image.source, 0, 0, c.width, c.height);
    const px = Math.round((Math.min(c.width, c.height) * size) / 100);
    ctx.font = `${style === 'meme' ? '' : 'bold '}${px}px ${FONTS[style]}`;
    ctx.textAlign = 'center'; ctx.fillStyle = color; ctx.lineJoin = 'round';
    ctx.strokeStyle = color.toLowerCase() === '#000000' ? '#ffffff' : '#000000'; ctx.lineWidth = Math.max(2, px / 8);
    const draw = (t: string, fromTop: boolean) => {
      if (!t.trim()) return;
      const lines = wrapLines(ctx, upper ? t.toUpperCase() : t, c.width * 0.92);
      const lh = px * 1.1;
      lines.forEach((ln, i) => {
        const y = fromTop ? px * 1.05 + i * lh + c.height * 0.02 : c.height - c.height * 0.03 - (lines.length - 1 - i) * lh;
        ctx.strokeText(ln, c.width / 2, y); ctx.fillText(ln, c.width / 2, y);
      });
    };
    draw(top, true); draw(bottom, false);
  }, [image, top, bottom, style, size, color, upper]);

  if (!file || !image) return <Card className="p-4 sm:p-6">{loading ? <PageLoader label="Opening image…" /> : <Dropzone onFiles={select} accept={IMAGE_INPUT} title="Drop an image to add text" hint="Make memes, quotes and captions" icon={<Type className="h-7 w-7" aria-hidden />} />}</Card>;
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <Card className="flex items-center justify-center p-3"><canvas ref={ref} className="h-auto max-h-[70vh] max-w-full rounded-lg" aria-label="Image with text" /></Card>
      <Card className="h-fit space-y-4 p-5">
        <Input label="Top text" value={top} onChange={(e) => setTop(e.target.value)} />
        <Input label="Bottom text" value={bottom} onChange={(e) => setBottom(e.target.value)} />
        <Segmented label="Style" value={style} onChange={setStyle} options={[{ value: 'meme', label: 'Meme' }, { value: 'clean', label: 'Clean' }, { value: 'serif', label: 'Classic' }]} className="w-full" />
        <Range label="Text size" min={4} max={20} value={size} onChange={setSize} />
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-fg">Colour <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-9 w-12 rounded-lg border border-line" /></label>
          <label className="flex items-center gap-2 text-sm text-fg"><input type="checkbox" checked={upper} onChange={(e) => setUpper(e.target.checked)} className="h-4 w-4 accent-[var(--accent)]" /> CAPITALS</label>
        </div>
        <Button size="lg" className="w-full" onClick={() => ref.current!.toBlob((b) => b && downloadBlob(b, `${baseOf(file.name)}-text.jpg`), 'image/jpeg', 0.92)} icon={<Download className="h-5 w-5" aria-hidden />}>Download image</Button>
        <Button variant="ghost" className="w-full" onClick={clear}>Use another image</Button>
      </Card>
    </div>
  );
}
