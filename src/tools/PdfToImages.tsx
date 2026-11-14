import { useState } from 'react';
import { Archive, Download, FileImage, RotateCcw } from 'lucide-react';
import { validatePdf } from '../lib/pdfInput';
import { getPageCount } from '../lib/pdf';
import { parsePageRanges, rangeToIndices } from '../lib/pageRanges';
import { limits } from '../config/limits';
import { baseName, downloadBlob } from '../utils/download';
import { formatBytes, pluralize } from '../utils/format';
import { useObjectUrl } from '../hooks/useObjectUrl';
import { Card } from '../components/ui/Card';
import { Dropzone } from '../components/ui/Dropzone';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Form';
import { Segmented } from '../components/ui/Segmented';
import { Progress } from '../components/ui/Misc';
import { FileChip } from '../components/FileChip';
import { useToast } from '../components/ui/Toast';

interface Out { name: string; blob: Blob; page: number }

function Thumb({ blob, alt }: { blob: Blob; alt: string }) {
  const url = useObjectUrl(blob);
  return url ? <img src={url} alt={alt} className="h-full w-full object-contain" loading="lazy" /> : null;
}

export default function PdfToImages() {
  const toast = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState(0);
  const [format, setFormat] = useState<'image/jpeg' | 'image/png'>('image/jpeg');
  const [dpi, setDpi] = useState<'72' | '150' | '300'>('150');
  const [range, setRange] = useState('');
  const [working, setWorking] = useState(false);
  const [progress, setProgress] = useState(0);
  const [outputs, setOutputs] = useState<Out[]>([]);

  const select = async (files: File[]) => {
    const f = files[0];
    if (!f) return;
    const err = await validatePdf(f);
    if (err) return toast.error(err);
    try {
      setPages(await getPageCount(f));
      setFile(f);
      setOutputs([]);
      setRange('');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'This PDF could not be opened.');
    }
  };

  const parsed = range.trim() && pages ? parsePageRanges(range, pages) : null;
  const base = file ? baseName(file.name) : 'pages';

  const convert = async () => {
    if (!file) return;
    setWorking(true);
    setProgress(0);
    setOutputs([]);
    try {
      const { pdfToImages } = await import('../lib/pdf');
      const sel = parsed?.ok ? parsed.ranges.flatMap(rangeToIndices).map((i) => i + 1) : undefined;
      const out = await pdfToImages(file, { format, dpi: Number(dpi), pages: sel }, (d, t) => setProgress(d / t));
      setOutputs(out);
      toast.success(`Created ${pluralize(out.length, 'image')}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'The PDF could not be converted.');
    } finally {
      setWorking(false);
    }
  };

  const zip = async () => {
    const { zipSync } = await import('fflate');
    const entries: Record<string, [Uint8Array, { level: 0 }]> = {};
    for (const o of outputs) entries[o.name] = [new Uint8Array(await o.blob.arrayBuffer()), { level: 0 }];
    downloadBlob(new Blob([zipSync(entries) as Uint8Array<ArrayBuffer>], { type: 'application/zip' }), `${base}-images.zip`);
  };

  if (!file) {
    return (
      <Card className="p-4 sm:p-6">
        <Dropzone onFiles={select} accept=".pdf,application/pdf" title="Drop a PDF to convert to images" hint={`One PDF · up to ${formatBytes(limits.pdfMaxFileBytes)}`} icon={<FileImage className="h-7 w-7" aria-hidden />} />
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <Card className="p-4 sm:p-5">
        {outputs.length === 0 ? (
          <div className="flex min-h-[240px] flex-col items-center justify-center text-center text-fg-muted">
            <FileImage className="mb-3 h-10 w-10 text-fg-subtle" aria-hidden />
            <p>Choose your settings and press <strong>Convert</strong>.</p>
            {working && <div className="mt-6 w-full max-w-sm"><Progress value={progress} label="Rendering pages" /></div>}
          </div>
        ) : (
          <>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-fg">{pluralize(outputs.length, 'image')} ready</h2>
              {outputs.length > 1 && <Button size="sm" onClick={zip} icon={<Archive className="h-4 w-4" aria-hidden />}>Download all (ZIP)</Button>}
            </div>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {outputs.map((o) => (
                <li key={o.name} className="rounded-xl border border-line bg-surface-2 p-2">
                  <div className="flex aspect-[3/4] items-center justify-center overflow-hidden rounded-lg bg-white ring-1 ring-line"><Thumb blob={o.blob} alt={`Page ${o.page}`} /></div>
                  <div className="mt-2 flex items-center justify-between gap-1">
                    <span className="text-xs text-fg-muted">Page {o.page} · {formatBytes(o.blob.size)}</span>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => downloadBlob(o.blob, o.name)} aria-label={`Download page ${o.page}`} icon={<Download className="h-4 w-4" />} />
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </Card>
      <Card className="h-fit space-y-5 p-5 lg:sticky lg:top-24">
        <FileChip file={file} kind="pdf" meta={pluralize(pages, 'page')} onRemove={() => { setFile(null); setOutputs([]); }} />
        <Segmented label="Format" value={format} onChange={(v) => { setFormat(v); setOutputs([]); }} options={[{ value: 'image/jpeg', label: 'JPG' }, { value: 'image/png', label: 'PNG' }]} className="w-full" />
        <Segmented label="Quality" value={dpi} onChange={(v) => { setDpi(v); setOutputs([]); }} options={[{ value: '72', label: 'Screen' }, { value: '150', label: 'Standard' }, { value: '300', label: 'Print' }]} className="w-full" />
        <Input label="Pages (optional)" value={range} onChange={(e) => setRange(e.target.value)} placeholder={`All ${pages} pages, or e.g. 1-3, 5`} error={parsed && !parsed.ok ? parsed.error : null} />
        {working && <Progress value={progress} label="Rendering pages" />}
        <Button size="lg" className="w-full" onClick={convert} loading={working} disabled={working || (parsed !== null && !parsed.ok)}>
          {working ? 'Converting…' : 'Convert to images'}
        </Button>
        <Button variant="ghost" className="w-full" onClick={() => { setFile(null); setOutputs([]); }} icon={<RotateCcw className="h-4 w-4" aria-hidden />}>Convert another PDF</Button>
      </Card>
    </div>
  );
}
