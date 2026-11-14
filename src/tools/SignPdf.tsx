import { useEffect, useRef, useState, type PointerEvent as RPointerEvent } from 'react';
import type { PDFDocument } from 'pdf-lib';
import { Download, Eraser, ImagePlus, PenLine, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { loadPdf, openForRendering, renderPage, type RenderHandle } from '../lib/pdf';
import { validatePdf } from '../lib/pdfInput';
import { limits } from '../config/limits';
import { baseName, downloadBlob } from '../utils/download';
import { formatBytes, pluralize } from '../utils/format';
import { Card } from '../components/ui/Card';
import { Dropzone } from '../components/ui/Dropzone';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Form';
import { Segmented } from '../components/ui/Segmented';
import { FileChip } from '../components/FileChip';
import { PageLoader } from '../components/PageLoader';
import { Notice } from '../components/ui/Notice';
import { useToast } from '../components/ui/Toast';
import { cn } from '../lib/cn';

interface Sig { id: number; url: string; png: Uint8Array; ratio: number } // ratio = height / width
interface Placed { id: number; sig: number; page: number; fx: number; fy: number; fw: number }

const MAX_PAGES = 60;

async function canvasToPng(c: HTMLCanvasElement): Promise<{ url: string; png: Uint8Array }> {
  const blob = await new Promise<Blob>((res) => c.toBlob((b) => res(b!), 'image/png'));
  return { url: URL.createObjectURL(blob), png: new Uint8Array(await blob.arrayBuffer()) };
}

/** Crop transparent margins so the placed signature hugs the ink. */
function trimCanvas(src: HTMLCanvasElement): HTMLCanvasElement {
  const ctx = src.getContext('2d')!;
  const { data, width, height } = ctx.getImageData(0, 0, src.width, src.height);
  let minX = width, minY = height, maxX = -1, maxY = -1;
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) if (data[(y * width + x) * 4 + 3] > 10) { if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y; }
  if (maxX < 0) return src;
  const pad = 6;
  const out = document.createElement('canvas');
  out.width = maxX - minX + 1 + pad * 2;
  out.height = maxY - minY + 1 + pad * 2;
  out.getContext('2d')!.drawImage(src, minX, minY, maxX - minX + 1, maxY - minY + 1, pad, pad, maxX - minX + 1, maxY - minY + 1);
  return out;
}

function SignaturePad({ onDone }: { onDone: (c: HTMLCanvasElement) => void }) {
  const [mode, setMode] = useState<'draw' | 'type' | 'upload'>('draw');
  const [typed, setTyped] = useState('');
  const [color, setColor] = useState('#1e3a8a');
  const [hasInk, setHasInk] = useState(false);
  const ref = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    c.width = 900;
    c.height = 300;
    setHasInk(false);
  }, [mode]);

  const pos = (e: RPointerEvent) => {
    const r = ref.current!.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * 900, y: ((e.clientY - r.top) / r.height) * 300 };
  };
  const down = (e: RPointerEvent) => {
    ref.current!.setPointerCapture(e.pointerId);
    drawing.current = true;
    last.current = pos(e);
  };
  const move = (e: RPointerEvent) => {
    if (!drawing.current) return;
    const ctx = ref.current!.getContext('2d')!;
    const p = pos(e);
    ctx.strokeStyle = color;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(last.current!.x, last.current!.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
    setHasInk(true);
  };
  const up = () => (drawing.current = false);

  const typedCanvas = () => {
    const c = document.createElement('canvas');
    c.width = 1200;
    c.height = 300;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = color;
    ctx.font = 'italic 130px "Segoe Script", "Brush Script MT", "Lucida Handwriting", "Apple Chancery", cursive';
    ctx.textBaseline = 'middle';
    ctx.fillText(typed.trim(), 20, 150, 1160);
    return c;
  };

  const upload = async (f?: File) => {
    if (!f) return;
    const img = await createImageBitmap(f);
    const c = document.createElement('canvas');
    const s = Math.min(1, 1200 / img.width);
    c.width = Math.round(img.width * s);
    c.height = Math.round(img.height * s);
    const ctx = c.getContext('2d')!;
    ctx.drawImage(img, 0, 0, c.width, c.height);
    // Make near-white paper transparent so the signature sits on the page.
    const d = ctx.getImageData(0, 0, c.width, c.height);
    for (let i = 0; i < d.data.length; i += 4) {
      const lum = 0.299 * d.data[i] + 0.587 * d.data[i + 1] + 0.114 * d.data[i + 2];
      if (lum > 200) d.data[i + 3] = 0;
      else if (lum > 150) d.data[i + 3] = Math.round(((200 - lum) / 50) * d.data[i + 3]);
    }
    ctx.putImageData(d, 0, 0);
    img.close();
    onDone(trimCanvas(c));
  };

  return (
    <div className="space-y-3">
      <Segmented label="Create signature" value={mode} onChange={setMode} options={[{ value: 'draw', label: 'Draw' }, { value: 'type', label: 'Type' }, { value: 'upload', label: 'Upload' }]} className="w-full" />
      {mode === 'draw' && (
        <>
          <canvas ref={ref} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} className="aspect-[3/1] w-full touch-none rounded-xl border-2 border-dashed border-line-strong bg-white" aria-label="Draw your signature here" />
          <div className="flex items-center gap-2">
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-9 w-12 cursor-pointer rounded-lg border border-line" aria-label="Ink colour" />
            <Button variant="ghost" size="sm" onClick={() => { const c = ref.current!; c.getContext('2d')!.clearRect(0, 0, c.width, c.height); setHasInk(false); }} icon={<Eraser className="h-4 w-4" aria-hidden />}>Clear</Button>
            <Button size="sm" className="ml-auto" disabled={!hasInk} onClick={() => onDone(trimCanvas(ref.current!))} icon={<Plus className="h-4 w-4" aria-hidden />}>Use signature</Button>
          </div>
        </>
      )}
      {mode === 'type' && (
        <>
          <Input label="Your name" value={typed} onChange={(e) => setTyped(e.target.value)} maxLength={40} />
          <div className="flex h-20 items-center overflow-hidden rounded-xl bg-white px-4 ring-1 ring-line" style={{ color, fontFamily: '"Segoe Script", "Brush Script MT", "Lucida Handwriting", "Apple Chancery", cursive', fontStyle: 'italic', fontSize: 34 }}>{typed || 'Your signature'}</div>
          <div className="flex items-center gap-2">
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-9 w-12 cursor-pointer rounded-lg border border-line" aria-label="Ink colour" />
            <Button size="sm" className="ml-auto" disabled={!typed.trim()} onClick={() => onDone(trimCanvas(typedCanvas()))} icon={<Plus className="h-4 w-4" aria-hidden />}>Use signature</Button>
          </div>
        </>
      )}
      {mode === 'upload' && (
        <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-line-strong bg-surface-2 p-6 text-center text-sm text-fg-muted">
          <ImagePlus className="h-6 w-6" aria-hidden />
          Upload a photo of your signature on white paper. The white background is removed automatically.
          <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(e) => { void upload(e.target.files?.[0]); e.target.value = ''; }} />
        </label>
      )}
    </div>
  );
}

export default function SignPdf() {
  const toast = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [doc, setDoc] = useState<PDFDocument | null>(null);
  const [pages, setPages] = useState<{ url: string; ratio: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [sigs, setSigs] = useState<Sig[]>([]);
  const [active, setActive] = useState<number | null>(null);
  const [placed, setPlaced] = useState<Placed[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const handle = useRef<RenderHandle | null>(null);
  const dragRef = useRef<{ id: number; sx: number; sy: number; fx: number; fy: number; el: HTMLElement } | null>(null);
  const nextId = useRef(1);

  useEffect(() => () => { void handle.current?.destroy(); }, []);

  const select = async (files: File[]) => {
    const f = files[0];
    if (!f) return;
    const err = await validatePdf(f);
    if (err) return toast.error(err);
    setLoading(true);
    try {
      const d = await loadPdf(f);
      if (d.getPageCount() > MAX_PAGES) throw new Error(`This PDF has ${d.getPageCount()} pages. Signing supports up to ${MAX_PAGES} pages.`);
      await handle.current?.destroy();
      const rd = await openForRendering(f);
      handle.current = rd;
      const out: { url: string; ratio: number }[] = [];
      for (let i = 1; i <= rd.doc.numPages; i++) {
        const c = await renderPage(rd.doc, i, 1.3);
        out.push({ url: c.toDataURL('image/jpeg', 0.85), ratio: c.height / c.width });
        c.width = 0;
      }
      setDoc(d);
      setPages(out);
      setFile(f);
      setPlaced([]);
      setResult(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'This PDF could not be opened.');
    } finally {
      setLoading(false);
    }
  };

  const addSig = async (c: HTMLCanvasElement) => {
    const { url, png } = await canvasToPng(c);
    const s = { id: nextId.current++, url, png, ratio: c.height / c.width };
    setSigs((x) => [...x, s]);
    setActive(s.id);
    toast.success('Now tap the page where it should go');
  };

  const placeOn = (page: number, e: React.MouseEvent<HTMLDivElement>) => {
    if (active === null || dragRef.current) return;
    if ((e.target as HTMLElement).closest('[data-placed]')) return;
    const r = e.currentTarget.getBoundingClientRect();
    const fw = 0.3;
    const sig = sigs.find((s) => s.id === active)!;
    const fh = (fw * sig.ratio) / pages[page].ratio;
    const p = { id: nextId.current++, sig: active, page, fw, fx: Math.min(1 - fw, Math.max(0, (e.clientX - r.left) / r.width - fw / 2)), fy: Math.min(1 - fh, Math.max(0, (e.clientY - r.top) / r.height - fh / 2)) };
    setPlaced((x) => [...x, p]);
    setSelected(p.id);
    setResult(null);
  };

  const startDrag = (pl: Placed) => (e: RPointerEvent<HTMLElement>) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    setSelected(pl.id);
    dragRef.current = { id: pl.id, sx: e.clientX, sy: e.clientY, fx: pl.fx, fy: pl.fy, el: e.currentTarget.parentElement! };
  };
  const onDrag = (e: RPointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    const r = d.el.getBoundingClientRect();
    setPlaced((xs) => xs.map((p) => {
      if (p.id !== d.id) return p;
      const sig = sigs.find((s) => s.id === p.sig)!;
      const fh = (p.fw * sig.ratio) / pages[p.page].ratio;
      return { ...p, fx: Math.min(1 - p.fw, Math.max(0, d.fx + (e.clientX - d.sx) / r.width)), fy: Math.min(1 - fh, Math.max(0, d.fy + (e.clientY - d.sy) / r.height)) };
    }));
    setResult(null);
  };
  const endDrag = () => setTimeout(() => (dragRef.current = null), 0);

  const sel = placed.find((p) => p.id === selected);

  const save = async () => {
    if (!doc || !file) return;
    setSaving(true);
    try {
      const { stampImages } = await import('../lib/pdfStamp');
      // Reload so repeated saves don't stack signatures.
      const fresh = await loadPdf(file);
      const blob = await stampImages(fresh, placed.map((p) => {
        const sig = sigs.find((s) => s.id === p.sig)!;
        return { page: p.page, fx: p.fx, fy: p.fy, fw: p.fw, fh: (p.fw * sig.ratio) / pages[p.page].ratio, png: sig.png };
      }));
      setResult(blob);
      toast.success('Signed PDF ready');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'The PDF could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  const reset = () => { setFile(null); setDoc(null); setPages([]); setPlaced([]); setResult(null); };

  if (!file) {
    return (
      <Card className="p-4 sm:p-6">
        {loading ? <PageLoader label="Opening PDF…" /> : <Dropzone onFiles={select} accept=".pdf,application/pdf" title="Drop a PDF to sign" hint={`One PDF · up to ${MAX_PAGES} pages · ${formatBytes(limits.pdfMaxFileBytes)}`} icon={<PenLine className="h-7 w-7" aria-hidden />} />}
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <Card className="p-3 sm:p-5">
        <p className="mb-3 text-sm text-fg-muted">{active === null ? 'Create a signature on the right first.' : 'Tap a page to place the selected signature. Drag to move it.'}</p>
        <div className="space-y-5" onPointerMove={onDrag} onPointerUp={endDrag}>
          {pages.map((pg, i) => (
            <div key={i}>
              <div className={cn('relative mx-auto max-w-[720px] select-none overflow-hidden rounded-md bg-white shadow ring-1 ring-line', active !== null && 'cursor-copy')} onClick={(e) => placeOn(i, e)}>
                <img src={pg.url} alt={`Page ${i + 1}`} className="block w-full" draggable={false} />
                {placed.filter((p) => p.page === i).map((p) => {
                  const sig = sigs.find((s) => s.id === p.sig)!;
                  return (
                    <img key={p.id} data-placed src={sig.url} alt="Signature" draggable={false} onPointerDown={startDrag(p)}
                      className={cn('absolute touch-none cursor-move', selected === p.id && 'outline outline-2 outline-offset-2 outline-accent')}
                      style={{ left: `${p.fx * 100}%`, top: `${p.fy * 100}%`, width: `${p.fw * 100}%` }} />
                  );
                })}
              </div>
              <p className="mt-1.5 text-center text-xs text-fg-subtle">Page {i + 1}</p>
            </div>
          ))}
        </div>
      </Card>
      <Card className="h-fit space-y-5 p-5 lg:sticky lg:top-24">
        <FileChip file={file} kind="pdf" meta={pluralize(pages.length, 'page')} onRemove={reset} />
        <SignaturePad onDone={addSig} />
        {sigs.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-medium text-fg">Your signatures (tap one, then tap the page)</p>
            <div className="flex flex-wrap gap-2">
              {sigs.map((s) => (
                <button key={s.id} type="button" onClick={() => setActive(s.id)} aria-pressed={active === s.id} className={cn('flex h-14 w-28 items-center justify-center rounded-lg bg-white p-1 ring-1', active === s.id ? 'ring-2 ring-accent' : 'ring-line')}>
                  <img src={s.url} alt="Saved signature" className="max-h-full max-w-full" />
                </button>
              ))}
            </div>
          </div>
        )}
        {sel && (
          <div className="space-y-2 rounded-xl bg-surface-2 p-3">
            <label className="flex items-center justify-between text-sm font-medium text-fg" htmlFor="sig-size">Selected signature size</label>
            <input id="sig-size" type="range" min={0.08} max={0.8} step={0.01} value={sel.fw} className="w-full accent-[var(--accent)]"
              onChange={(e) => { const fw = Number(e.target.value); setPlaced((xs) => xs.map((p) => (p.id === sel.id ? { ...p, fw, fx: Math.min(p.fx, 1 - fw) } : p))); setResult(null); }} />
            <Button variant="ghost" size="sm" onClick={() => { setPlaced((xs) => xs.filter((p) => p.id !== sel.id)); setSelected(null); setResult(null); }} icon={<Trash2 className="h-4 w-4" aria-hidden />}>Remove from page</Button>
          </div>
        )}
        <Button size="lg" className="w-full" onClick={save} loading={saving} disabled={!placed.length || saving}>
          {placed.length ? `Save signed PDF (${pluralize(placed.length, 'signature')})` : 'Place a signature first'}
        </Button>
        {result && (
          <div className="animate-fade-up space-y-3 rounded-xl border border-success/30 bg-success-soft p-4">
            <p className="text-sm text-fg"><strong>{baseName(file.name)}-signed.pdf</strong> · {formatBytes(result.size)}</p>
            <Button className="w-full" onClick={() => downloadBlob(result, `${baseName(file.name)}-signed.pdf`)} icon={<Download className="h-4 w-4" aria-hidden />}>Download signed PDF</Button>
          </div>
        )}
        <Notice tone="info">This adds a picture of your signature, which is fine for most everyday forms. It isn’t a certified digital signature.</Notice>
        <Button variant="ghost" className="w-full" onClick={reset} icon={<RotateCcw className="h-4 w-4" aria-hidden />}>Sign another PDF</Button>
      </Card>
    </div>
  );
}
