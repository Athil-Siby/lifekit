import { useEffect, useMemo, useRef, useState } from 'react';
import type { PDFDocument } from 'pdf-lib';
import { Archive, Check, Download, RotateCcw, Scissors } from 'lucide-react';
import { extractPages, loadPdf, openForRendering, renderThumbnail, type RenderHandle } from '../lib/pdf';
import { validatePdf } from '../lib/pdfInput';
import { compactPages, describeRange, parsePageRanges, rangeToIndices } from '../lib/pageRanges';
import { limits } from '../config/limits';
import { baseName, downloadBlob } from '../utils/download';
import { formatBytes, pluralize } from '../utils/format';
import { Card } from '../components/ui/Card';
import { Dropzone } from '../components/ui/Dropzone';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Form';
import { Segmented } from '../components/ui/Segmented';
import { Notice } from '../components/ui/Notice';
import { Progress } from '../components/ui/Misc';
import { FileChip } from '../components/FileChip';
import { PageLoader } from '../components/PageLoader';
import { useToast } from '../components/ui/Toast';
import { cn } from '../lib/cn';

type Mode = 'ranges' | 'extract' | 'every';
interface Output {
  name: string;
  blob: Blob;
  label: string;
}

const MAX_THUMBS = 300;

export default function PdfSplitter() {
  const toast = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [doc, setDoc] = useState<PDFDocument | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [thumbs, setThumbs] = useState<(string | undefined)[]>([]);
  const [mode, setMode] = useState<Mode>('ranges');
  const [rangesText, setRangesText] = useState('');
  const [extractText, setExtractText] = useState('');
  const [working, setWorking] = useState(false);
  const [progress, setProgress] = useState(0);
  const [outputs, setOutputs] = useState<Output[]>([]);
  const renderDoc = useRef<RenderHandle | null>(null);

  // Render thumbnails in the background; cancelled when the file changes.
  useEffect(() => {
    if (!file) return;
    let cancelled = false;
    (async () => {
      try {
        const rd = await openForRendering(file);
        if (cancelled) {
          void rd.destroy();
          return;
        }
        renderDoc.current = rd;
        const n = Math.min(rd.doc.numPages, MAX_THUMBS);
        for (let i = 1; i <= n && !cancelled; i++) {
          const url = await renderThumbnail(rd.doc, i, 140);
          if (cancelled) break;
          setThumbs((t) => {
            const copy = [...t];
            copy[i - 1] = url;
            return copy;
          });
        }
      } catch {
        /* thumbnails are optional; splitting still works without them */
      }
    })();
    return () => {
      cancelled = true;
      void renderDoc.current?.destroy();
      renderDoc.current = null;
    };
  }, [file]);

  const select = async (files: File[]) => {
    const f = files[0];
    if (!f) return;
    const err = await validatePdf(f);
    if (err) {
      toast.error(err);
      return;
    }
    setLoading(true);
    try {
      const d = await loadPdf(f);
      const n = d.getPageCount();
      setDoc(d);
      setPageCount(n);
      setFile(f);
      setThumbs([]);
      setOutputs([]);
      setRangesText(n > 1 ? `1-${Math.ceil(n / 2)}, ${Math.ceil(n / 2) + 1}-${n}`.replace(/(\d+)-\1(?!\d)/g, '$1') : '1');
      setExtractText('');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'This PDF could not be opened.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setDoc(null);
    setPageCount(0);
    setThumbs([]);
    setOutputs([]);
  };

  const rangesParsed = useMemo(() => (pageCount ? parsePageRanges(rangesText, pageCount) : null), [rangesText, pageCount]);
  const extractParsed = useMemo(() => (pageCount && extractText.trim() ? parsePageRanges(extractText, pageCount) : null), [extractText, pageCount]);
  const selectedPages = useMemo(() => {
    if (!extractParsed?.ok) return new Set<number>();
    return new Set(extractParsed.ranges.flatMap(rangeToIndices).map((i) => i + 1));
  }, [extractParsed]);

  const togglePage = (p: number) => {
    const next = new Set(selectedPages);
    if (next.has(p)) next.delete(p);
    else next.add(p);
    setExtractText(compactPages([...next]));
    setOutputs([]);
  };

  const base = file ? baseName(file.name) : 'document';

  const split = async () => {
    if (!doc) return;
    setWorking(true);
    setProgress(0);
    setOutputs([]);
    try {
      const jobs: { indices: number[]; name: string; label: string }[] = [];
      if (mode === 'ranges') {
        if (!rangesParsed?.ok) throw new Error(rangesParsed?.error ?? 'Enter page ranges.');
        rangesParsed.ranges.forEach((r, i) => {
          const pages = r.start === r.end ? `${r.start}` : `${r.start}-${r.end}`;
          jobs.push({ indices: rangeToIndices(r), name: `${base}-part${i + 1}-p${pages}.pdf`, label: describeRange(r) });
        });
      } else if (mode === 'extract') {
        if (!extractParsed?.ok) throw new Error(extractParsed?.error ?? 'Select at least one page.');
        const indices = extractParsed.ranges.flatMap(rangeToIndices);
        jobs.push({ indices, name: `${base}-extracted.pdf`, label: `${pluralize(indices.length, 'page')}: ${extractText}` });
      } else {
        for (let i = 0; i < pageCount; i++) jobs.push({ indices: [i], name: `${base}-page${String(i + 1).padStart(String(pageCount).length, '0')}.pdf`, label: `page ${i + 1}` });
      }
      const out: Output[] = [];
      for (let j = 0; j < jobs.length; j++) {
        const blob = await extractPages(doc, jobs[j].indices);
        out.push({ name: jobs[j].name, blob, label: jobs[j].label });
        setProgress((j + 1) / jobs.length);
      }
      setOutputs(out);
      toast.success(out.length === 1 ? 'Your PDF is ready' : `Created ${out.length} PDF files`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'The PDF could not be split.');
    } finally {
      setWorking(false);
    }
  };

  const downloadZip = async () => {
    const { zipSync } = await import('fflate');
    const entries: Record<string, [Uint8Array, { level: 0 }]> = {};
    for (const o of outputs) entries[o.name] = [new Uint8Array(await o.blob.arrayBuffer()), { level: 0 }];
    const zipped = zipSync(entries);
    downloadBlob(new Blob([zipped as Uint8Array<ArrayBuffer>], { type: 'application/zip' }), `${base}-split.zip`);
  };

  if (!file) {
    return (
      <Card className="p-4 sm:p-6">
        {loading ? (
          <PageLoader label="Opening PDF…" />
        ) : (
          <Dropzone onFiles={select} accept=".pdf,application/pdf" title="Drop a PDF to split" hint={`One PDF · up to ${formatBytes(limits.pdfMaxFileBytes)}`} icon={<Scissors className="h-7 w-7" aria-hidden />} />
        )}
      </Card>
    );
  }

  const canSplit =
    pageCount > 0 &&
    ((mode === 'ranges' && rangesParsed?.ok) || (mode === 'extract' && extractParsed?.ok) || (mode === 'every' && pageCount > 1));

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <Card className="p-4 sm:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-fg">{pluralize(pageCount, 'page')}</h2>
          {mode === 'extract' && (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setExtractText(`1-${pageCount}`)}>Select all</Button>
              <Button variant="ghost" size="sm" onClick={() => setExtractText('')} disabled={!extractText}>Clear selection</Button>
            </div>
          )}
        </div>
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: Math.min(pageCount, MAX_THUMBS) }, (_, i) => {
            const p = i + 1;
            const selected = mode === 'extract' && selectedPages.has(p);
            const inner = (
              <>
                <div className="relative flex aspect-[3/4] items-center justify-center overflow-hidden rounded-lg bg-white ring-1 ring-line">
                  {thumbs[i] ? (
                    <img src={thumbs[i]} alt={`Page ${p}`} className="h-full w-full object-contain" loading="lazy" />
                  ) : (
                    <span className="h-4 w-4 animate-pulse rounded-full bg-slate-200" aria-hidden />
                  )}
                  {selected && (
                    <span className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-accent-fg shadow">
                      <Check className="h-4 w-4" aria-hidden />
                    </span>
                  )}
                </div>
                <span className="mt-1.5 block text-center text-xs text-fg-muted">{p}</span>
              </>
            );
            return (
              <li key={p}>
                {mode === 'extract' ? (
                  <button
                    type="button"
                    onClick={() => togglePage(p)}
                    aria-pressed={selected}
                    aria-label={`Page ${p}`}
                    className={cn('w-full rounded-xl p-1.5 transition-all', selected ? 'bg-accent-soft ring-2 ring-accent' : 'hover:bg-surface-3')}
                  >
                    {inner}
                  </button>
                ) : (
                  <div className="p-1.5">{inner}</div>
                )}
              </li>
            );
          })}
        </ul>
        {pageCount > MAX_THUMBS && (
          <p className="mt-4 text-xs text-fg-subtle">Previews are shown for the first {MAX_THUMBS} pages. You can still type any page number.</p>
        )}
      </Card>

      <Card className="h-fit space-y-5 p-5 lg:sticky lg:top-24">
        <FileChip file={file} kind="pdf" meta={pluralize(pageCount, 'page')} onRemove={reset} />
        <Segmented
          label="Split mode"
          value={mode}
          onChange={(m) => {
            setMode(m);
            setOutputs([]);
          }}
          options={[
            { value: 'ranges', label: 'By ranges' },
            { value: 'extract', label: 'Extract' },
            { value: 'every', label: 'Every page' },
          ]}
          className="w-full"
        />
        {mode === 'ranges' && (
          <div>
            <Input
              label="Page ranges"
              value={rangesText}
              onChange={(e) => {
                setRangesText(e.target.value);
                setOutputs([]);
              }}
              placeholder="e.g. 1-3, 4-8, 9"
              error={rangesText.trim() && rangesParsed && !rangesParsed.ok ? rangesParsed.error : null}
              hint="Each range becomes a separate PDF."
            />
            {rangesParsed?.ok && (
              <ul className="mt-3 space-y-1 text-sm text-fg-muted">
                {rangesParsed.ranges.map((r, i) => (
                  <li key={i}>File {i + 1}: {describeRange(r)}</li>
                ))}
              </ul>
            )}
          </div>
        )}
        {mode === 'extract' && (
          <Input
            label="Pages to extract"
            value={extractText}
            onChange={(e) => {
              setExtractText(e.target.value);
              setOutputs([]);
            }}
            placeholder="Click pages or type e.g. 1, 3, 5-7"
            error={extractText.trim() && extractParsed && !extractParsed.ok ? extractParsed.error : null}
            hint={selectedPages.size ? `${pluralize(selectedPages.size, 'page')} selected → one PDF, in the order typed.` : 'All selected pages go into one PDF.'}
          />
        )}
        {mode === 'every' && (
          <Notice tone="info">{pageCount > 1 ? `Creates ${pageCount} single-page PDFs.` : 'This PDF only has one page.'}</Notice>
        )}
        {working && <Progress value={progress} label="Splitting" />}
        <Button size="lg" className="w-full" onClick={split} loading={working} disabled={!canSplit} icon={<Scissors className="h-4 w-4" aria-hidden />}>
          {working ? 'Splitting…' : 'Split PDF'}
        </Button>

        {outputs.length > 0 && (
          <div className="space-y-3 border-t border-line pt-5">
            <p className="text-sm font-semibold text-fg">{outputs.length === 1 ? 'Your file' : `${outputs.length} files ready`}</p>
            {outputs.length > 1 && (
              <Button className="w-full" onClick={downloadZip} icon={<Archive className="h-4 w-4" aria-hidden />}>
                Download all as ZIP
              </Button>
            )}
            <ul className="max-h-72 space-y-2 overflow-y-auto">
              {outputs.map((o) => (
                <li key={o.name} className="flex items-center gap-2 rounded-xl bg-surface-2 px-3 py-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-fg" title={o.name}>{o.name}</p>
                    <p className="text-xs text-fg-subtle">{o.label} · {formatBytes(o.blob.size)}</p>
                  </div>
                  <Button variant={outputs.length === 1 ? 'primary' : 'outline'} size="sm" onClick={() => downloadBlob(o.blob, o.name)} icon={<Download className="h-4 w-4" aria-hidden />}>
                    Download
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}
        <Button variant="ghost" className="w-full" onClick={reset} icon={<RotateCcw className="h-4 w-4" aria-hidden />}>
          Split another PDF
        </Button>
      </Card>
    </div>
  );
}
