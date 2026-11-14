import { useEffect, useRef, useState } from 'react';
import type { PDFDocument } from 'pdf-lib';
import { ArrowLeft, ArrowRight, Download, LayoutGrid, RotateCcw, RotateCw, Trash2, Undo2 } from 'lucide-react';
import { loadPdf, openForRendering, renderThumbnail, type RenderHandle } from '../lib/pdf';
import { validatePdf } from '../lib/pdfInput';
import { limits } from '../config/limits';
import { baseName, downloadBlob } from '../utils/download';
import { formatBytes, pluralize } from '../utils/format';
import { Card } from '../components/ui/Card';
import { Dropzone } from '../components/ui/Dropzone';
import { Button } from '../components/ui/Button';
import { FileChip } from '../components/FileChip';
import { PageLoader } from '../components/PageLoader';
import { useToast } from '../components/ui/Toast';
import { cn } from '../lib/cn';

interface PageItem { index: number; rotate: number; deleted: boolean }
const MAX_PAGES = 500;

export default function OrganizePdf() {
  const toast = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [doc, setDoc] = useState<PDFDocument | null>(null);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [thumbs, setThumbs] = useState<(string | undefined)[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const handle = useRef<RenderHandle | null>(null);

  useEffect(() => {
    if (!file) return;
    let cancelled = false;
    (async () => {
      try {
        const rd = await openForRendering(file);
        if (cancelled) return void rd.destroy();
        handle.current = rd;
        for (let i = 1; i <= Math.min(rd.doc.numPages, MAX_PAGES) && !cancelled; i++) {
          const url = await renderThumbnail(rd.doc, i, 150);
          if (cancelled) break;
          setThumbs((t) => { const c = [...t]; c[i - 1] = url; return c; });
        }
      } catch { /* previews are optional */ }
    })();
    return () => {
      cancelled = true;
      void handle.current?.destroy();
      handle.current = null;
    };
  }, [file]);

  const select = async (files: File[]) => {
    const f = files[0];
    if (!f) return;
    const err = await validatePdf(f);
    if (err) return toast.error(err);
    setLoading(true);
    try {
      const d = await loadPdf(f);
      const n = d.getPageCount();
      if (n > MAX_PAGES) throw new Error(`This PDF has ${n} pages. The organizer handles up to ${MAX_PAGES}.`);
      setDoc(d);
      setPages(Array.from({ length: n }, (_, i) => ({ index: i, rotate: 0, deleted: false })));
      setThumbs([]);
      setResult(null);
      setFile(f);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'This PDF could not be opened.');
    } finally {
      setLoading(false);
    }
  };

  const update = (fn: (p: PageItem[]) => PageItem[]) => { setResult(null); setPages(fn); };
  const move = (from: number, to: number) => update((ps) => { if (to < 0 || to >= ps.length) return ps; const c = [...ps]; const [m] = c.splice(from, 1); c.splice(to, 0, m); return c; });
  const rotate = (i: number, by: number) => update((ps) => ps.map((p, j) => (j === i ? { ...p, rotate: (p.rotate + by + 360) % 360 } : p)));
  const toggleDelete = (i: number) => update((ps) => ps.map((p, j) => (j === i ? { ...p, deleted: !p.deleted } : p)));
  const reset = () => { setFile(null); setDoc(null); setPages([]); setThumbs([]); setResult(null); };

  const kept = pages.filter((p) => !p.deleted);
  const changed = pages.some((p, i) => p.index !== i || p.rotate || p.deleted);
  const outName = file ? `${baseName(file.name)}-organized.pdf` : 'organized.pdf';

  const save = async () => {
    if (!doc || !kept.length) return;
    setSaving(true);
    try {
      const { organizePdf } = await import('../lib/pdf');
      const blob = await organizePdf(doc, kept.map(({ index, rotate }) => ({ index, rotate })));
      setResult(blob);
      toast.success('Your PDF is ready');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'The PDF could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  if (!file) {
    return (
      <Card className="p-4 sm:p-6">
        {loading ? <PageLoader label="Opening PDF…" /> : (
          <Dropzone onFiles={select} accept=".pdf,application/pdf" title="Drop a PDF to organize" hint={`One PDF · up to ${formatBytes(limits.pdfMaxFileBytes)}`} icon={<LayoutGrid className="h-7 w-7" aria-hidden />} />
        )}
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <Card className="p-4 sm:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-fg">{pluralize(kept.length, 'page')} in the new PDF{pages.length !== kept.length ? ` (${pages.length - kept.length} removed)` : ''}</h2>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={() => update((ps) => ps.map((p) => ({ ...p, rotate: (p.rotate + 90) % 360 })))} icon={<RotateCw className="h-4 w-4" aria-hidden />}>Rotate all</Button>
            <Button variant="ghost" size="sm" onClick={() => update((ps) => ps.map((_, i) => ({ index: i, rotate: 0, deleted: false })))} disabled={!changed} icon={<Undo2 className="h-4 w-4" aria-hidden />}>Undo all</Button>
          </div>
        </div>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
          {pages.map((p, i) => (
            <li key={p.index} className={cn('rounded-xl border p-2 transition-all', p.deleted ? 'border-danger/40 bg-danger-soft opacity-60' : 'border-line bg-surface-2')}>
              <div className="relative flex aspect-[3/4] items-center justify-center overflow-hidden rounded-lg bg-white ring-1 ring-line">
                {thumbs[p.index] ? (
                  <img src={thumbs[p.index]} alt={`Page ${p.index + 1}`} className="max-h-full max-w-full object-contain transition-transform duration-200" style={{ transform: `rotate(${p.rotate}deg)${p.rotate % 180 ? ' scale(0.75)' : ''}` }} />
                ) : (
                  <span className="h-4 w-4 animate-pulse rounded-full bg-slate-200" aria-hidden />
                )}
                {p.deleted && <span className="absolute inset-0 flex items-center justify-center bg-white/60 text-sm font-semibold text-danger">Removed</span>}
              </div>
              <p className="mt-1.5 text-center text-xs text-fg-muted">Page {p.index + 1}{p.rotate ? ` · ${p.rotate}°` : ''}</p>
              <div className="mt-1 grid grid-cols-4">
                <Button variant="ghost" size="icon" className="h-8 w-full" onClick={() => move(i, i - 1)} disabled={i === 0} aria-label={`Move page ${p.index + 1} earlier`} icon={<ArrowLeft className="h-4 w-4" />} />
                <Button variant="ghost" size="icon" className="h-8 w-full" onClick={() => rotate(i, 90)} disabled={p.deleted} aria-label={`Rotate page ${p.index + 1}`} icon={<RotateCw className="h-4 w-4" />} />
                <Button variant="ghost" size="icon" className="h-8 w-full" onClick={() => toggleDelete(i)} aria-label={p.deleted ? `Restore page ${p.index + 1}` : `Remove page ${p.index + 1}`} icon={p.deleted ? <Undo2 className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />} />
                <Button variant="ghost" size="icon" className="h-8 w-full" onClick={() => move(i, i + 1)} disabled={i === pages.length - 1} aria-label={`Move page ${p.index + 1} later`} icon={<ArrowRight className="h-4 w-4" />} />
              </div>
            </li>
          ))}
        </ul>
      </Card>
      <Card className="h-fit space-y-5 p-5 lg:sticky lg:top-24">
        <FileChip file={file} kind="pdf" meta={pluralize(pages.length, 'page')} onRemove={reset} />
        <p className="text-sm text-fg-muted">Use the arrows to reorder, <RotateCw className="inline h-3.5 w-3.5" aria-label="rotate" /> to rotate and <Trash2 className="inline h-3.5 w-3.5" aria-label="delete" /> to remove pages.</p>
        <Button size="lg" className="w-full" onClick={save} loading={saving} disabled={saving || !kept.length || !changed}>
          {saving ? 'Saving…' : !kept.length ? 'Keep at least one page' : 'Save new PDF'}
        </Button>
        {result && (
          <div className="animate-fade-up space-y-3 rounded-xl border border-success/30 bg-success-soft p-4">
            <p className="text-sm text-fg"><strong>{outName}</strong> · {formatBytes(result.size)}</p>
            <Button className="w-full" onClick={() => downloadBlob(result, outName)} icon={<Download className="h-4 w-4" aria-hidden />}>Download PDF</Button>
          </div>
        )}
        <Button variant="ghost" className="w-full" onClick={reset} icon={<RotateCcw className="h-4 w-4" aria-hidden />}>Organize another PDF</Button>
      </Card>
    </div>
  );
}
