import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, Download, Images, Plus, RotateCcw, X } from 'lucide-react';
import { decodeImage, releaseImage } from '../lib/image';
import { limits } from '../config/limits';
import { checkFile, IMAGE_ACCEPT } from '../utils/files';
import { downloadBlob, sanitizeFilename } from '../utils/download';
import { formatBytes, pluralize } from '../utils/format';
import { Card } from '../components/ui/Card';
import { Dropzone } from '../components/ui/Dropzone';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Form';
import { Segmented } from '../components/ui/Segmented';
import { Progress } from '../components/ui/Misc';
import { useToast } from '../components/ui/Toast';
import type { OrientationOption, PageSizeOption } from '../lib/pdf';

interface Item { id: number; file: File; url: string }
const MAX_IMAGES = 200;

export default function ImagesToPdf() {
  const toast = useToast();
  const [items, setItems] = useState<Item[]>([]);
  const [size, setSize] = useState<PageSizeOption>('a4');
  const [orientation, setOrientation] = useState<OrientationOption>('auto');
  const [margin, setMargin] = useState('small');
  const [name, setName] = useState('images');
  const [working, setWorking] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<Blob | null>(null);
  const nextId = useRef(1);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  useEffect(() => () => itemsRef.current.forEach((i) => URL.revokeObjectURL(i.url)), []);

  const add = (files: File[]) => {
    setResult(null);
    const added: Item[] = [];
    for (const f of files) {
      if (items.length + added.length >= MAX_IMAGES) {
        toast.error(`You can add up to ${MAX_IMAGES} images.`);
        break;
      }
      const c = checkFile(f, { accept: IMAGE_ACCEPT, maxBytes: limits.imageMaxFileBytes, label: 'image' });
      if (!c.ok) {
        toast.error(c.error!);
        continue;
      }
      added.push({ id: nextId.current++, file: f, url: URL.createObjectURL(f) });
    }
    if (!items.length && added[0]) setName(added[0].file.name.replace(/\.[^.]+$/, '') || 'images');
    setItems((xs) => [...xs, ...added]);
  };
  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return;
    setResult(null);
    setItems((xs) => {
      const c = [...xs];
      const [m] = c.splice(from, 1);
      c.splice(to, 0, m);
      return c;
    });
  };
  const remove = (id: number) => {
    setResult(null);
    setItems((xs) => {
      const it = xs.find((x) => x.id === id);
      if (it) URL.revokeObjectURL(it.url);
      return xs.filter((x) => x.id !== id);
    });
  };
  const clear = () => {
    items.forEach((i) => URL.revokeObjectURL(i.url));
    setItems([]);
    setResult(null);
  };

  const build = async () => {
    setWorking(true);
    setProgress(0);
    setResult(null);
    try {
      const { imagesToPdf } = await import('../lib/pdf');
      const blob = await imagesToPdf(
        items.map((it) => ({
          file: it.file,
          decode: async () => {
            const d = await decodeImage(it.file);
            return { source: d.source, width: d.width, height: d.height, release: () => releaseImage(d) };
          },
        })),
        { size, orientation, margin: margin === 'none' ? 0 : margin === 'small' ? 18 : 40 },
        (d, t) => setProgress(d / t),
      );
      setResult(blob);
      toast.success('Your PDF is ready');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'The PDF could not be created.');
    } finally {
      setWorking(false);
    }
  };

  const filename = `${sanitizeFilename(name.trim() || 'images')}.pdf`;

  if (!items.length) {
    return (
      <Card className="p-4 sm:p-6">
        <Dropzone onFiles={add} multiple accept="image/jpeg,image/png,image/webp,image/gif,image/bmp,image/avif" title="Drop photos or images" hint={`JPG, PNG, WebP and more · up to ${MAX_IMAGES} images`} icon={<Images className="h-7 w-7" aria-hidden />} />
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <Card className="p-4 sm:p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-fg">{pluralize(items.length, 'image')} · one per page</h2>
          <Button variant="ghost" size="sm" onClick={clear}>Remove all</Button>
        </div>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {items.map((it, i) => (
            <li key={it.id} className="rounded-xl border border-line bg-surface-2 p-2">
              <div className="relative flex aspect-[3/4] items-center justify-center overflow-hidden rounded-lg bg-white ring-1 ring-line">
                <img src={it.url} alt={it.file.name} className="h-full w-full object-contain" loading="lazy" />
                <span className="absolute left-1.5 top-1.5 rounded-md bg-black/60 px-1.5 py-0.5 text-xs font-semibold text-white">{i + 1}</span>
              </div>
              <p className="mt-1.5 truncate text-xs text-fg-muted" title={it.file.name}>{it.file.name}</p>
              <div className="mt-1 flex justify-between">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => move(i, i - 1)} disabled={i === 0} aria-label={`Move ${it.file.name} earlier`} icon={<ArrowUp className="h-4 w-4 -rotate-90 sm:rotate-0" />} />
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => move(i, i + 1)} disabled={i === items.length - 1} aria-label={`Move ${it.file.name} later`} icon={<ArrowDown className="h-4 w-4 -rotate-90 sm:rotate-0" />} />
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => remove(it.id)} aria-label={`Remove ${it.file.name}`} icon={<X className="h-4 w-4" />} />
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-4">
          <Dropzone compact onFiles={add} multiple accept="image/jpeg,image/png,image/webp,image/gif,image/bmp,image/avif" title="Add more images" icon={<Plus className="h-5 w-5" aria-hidden />} />
        </div>
      </Card>
      <Card className="h-fit space-y-5 p-5 lg:sticky lg:top-24">
        <Segmented label="Page size" value={size} onChange={(v) => { setSize(v); setResult(null); }} options={[{ value: 'a4', label: 'A4' }, { value: 'letter', label: 'Letter' }, { value: 'fit', label: 'Fit image' }]} className="w-full" />
        {size !== 'fit' && (
          <Segmented label="Orientation" value={orientation} onChange={(v) => { setOrientation(v); setResult(null); }} options={[{ value: 'auto', label: 'Auto' }, { value: 'portrait', label: 'Portrait' }, { value: 'landscape', label: 'Landscape' }]} className="w-full" />
        )}
        <Select label="Margin" value={margin} onChange={(e) => { setMargin(e.target.value); setResult(null); }}>
          <option value="none">No margin</option>
          <option value="small">Small</option>
          <option value="large">Large</option>
        </Select>
        <Input label="File name" value={name} onChange={(e) => setName(e.target.value)} hint={filename} />
        {working && <Progress value={progress} label="Adding pages" />}
        <Button size="lg" className="w-full" onClick={build} loading={working} disabled={working}>
          {working ? 'Creating PDF…' : 'Create PDF'}
        </Button>
        {result && (
          <div className="animate-fade-up space-y-3 rounded-xl border border-success/30 bg-success-soft p-4">
            <p className="text-sm text-fg"><strong>{filename}</strong> · {pluralize(items.length, 'page')} · {formatBytes(result.size)}</p>
            <Button className="w-full" onClick={() => downloadBlob(result, filename)} icon={<Download className="h-4 w-4" aria-hidden />}>Download PDF</Button>
          </div>
        )}
        <Button variant="ghost" className="w-full" onClick={clear} icon={<RotateCcw className="h-4 w-4" aria-hidden />}>Start over</Button>
      </Card>
    </div>
  );
}
