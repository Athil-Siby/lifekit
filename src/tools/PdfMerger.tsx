import { useRef, useState, type DragEvent } from 'react';
import { ArrowDown, ArrowUp, Download, FileStack, GripVertical, Plus, RotateCcw, Trash2, X } from 'lucide-react';
import { getPageCount, mergePdfs } from '../lib/pdf';
import { validatePdf } from '../lib/pdfInput';
import { limits } from '../config/limits';
import { downloadBlob, sanitizeFilename } from '../utils/download';
import { formatBytes, pluralize } from '../utils/format';
import { Card } from '../components/ui/Card';
import { Dropzone } from '../components/ui/Dropzone';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Form';
import { Notice } from '../components/ui/Notice';
import { Progress } from '../components/ui/Misc';
import { useToast } from '../components/ui/Toast';
import { cn } from '../lib/cn';

interface Item {
  id: number;
  file: File;
  pages: number;
}

export default function PdfMerger() {
  const toast = useToast();
  const [items, setItems] = useState<Item[]>([]);
  const [adding, setAdding] = useState(false);
  const [merging, setMerging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<Blob | null>(null);
  const [name, setName] = useState('merged');
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const nextId = useRef(1);

  const totalBytes = items.reduce((s, i) => s + i.file.size, 0);
  const totalPages = items.reduce((s, i) => s + i.pages, 0);

  const addFiles = async (files: File[]) => {
    setAdding(true);
    setResult(null);
    const added: Item[] = [];
    let runningBytes = totalBytes;
    for (const file of files) {
      if (items.length + added.length >= limits.pdfMergeMaxFiles) {
        toast.error(`You can merge up to ${limits.pdfMergeMaxFiles} files at once.`);
        break;
      }
      const err = await validatePdf(file);
      if (err) {
        toast.error(err);
        continue;
      }
      if (runningBytes + file.size > limits.pdfMergeMaxTotalBytes) {
        toast.error(`Adding “${file.name}” would exceed the ${formatBytes(limits.pdfMergeMaxTotalBytes)} total limit.`);
        continue;
      }
      try {
        const pages = await getPageCount(file);
        added.push({ id: nextId.current++, file, pages });
        runningBytes += file.size;
      } catch (e) {
        toast.error(e instanceof Error ? e.message : `“${file.name}” could not be read.`);
      }
    }
    if (added.length) setItems((xs) => [...xs, ...added]);
    setAdding(false);
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length || from === to) return;
    setResult(null);
    setItems((xs) => {
      const copy = [...xs];
      const [it] = copy.splice(from, 1);
      copy.splice(to, 0, it);
      return copy;
    });
  };

  const remove = (id: number) => {
    setResult(null);
    setItems((xs) => xs.filter((x) => x.id !== id));
  };

  const merge = async () => {
    setMerging(true);
    setProgress(0);
    try {
      const blob = await mergePdfs(
        items.map((i) => i.file),
        (d, t) => setProgress(d / t),
      );
      setResult(blob);
      toast.success(`Merged ${pluralize(items.length, 'file')} into one PDF`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'The PDFs could not be merged.');
    } finally {
      setMerging(false);
    }
  };

  const reset = () => {
    setItems([]);
    setResult(null);
    setName('merged');
  };

  const outName = `${sanitizeFilename(name) || 'merged'}.pdf`;

  const onDragStart = (i: number) => (e: DragEvent) => {
    setDragIndex(i);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(i));
  };

  if (items.length === 0) {
    return (
      <Card className="p-4 sm:p-6">
        <Dropzone
          onFiles={addFiles}
          multiple
          accept=".pdf,application/pdf"
          title={adding ? 'Reading files…' : 'Drop PDF files here'}
          disabled={adding}
          hint={`Add two or more PDFs · up to ${formatBytes(limits.pdfMaxFileBytes)} each`}
          icon={<FileStack className="h-7 w-7" aria-hidden />}
        />
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <Card className="p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-fg">
            {pluralize(items.length, 'file')} · {pluralize(totalPages, 'page')} · {formatBytes(totalBytes)}
          </h2>
          <Button variant="ghost" size="sm" onClick={reset} icon={<Trash2 className="h-4 w-4" aria-hidden />}>
            Remove all
          </Button>
        </div>
        <p className="mb-3 text-xs text-fg-subtle">Drag files to reorder, or use the arrow buttons. The merged PDF follows this order.</p>
        <ol className="space-y-2">
          {items.map((it, i) => (
            <li
              key={it.id}
              draggable
              onDragStart={onDragStart(i)}
              onDragOver={(e) => {
                e.preventDefault();
                setOverIndex(i);
              }}
              onDragLeave={() => setOverIndex((o) => (o === i ? null : o))}
              onDrop={(e) => {
                e.preventDefault();
                if (dragIndex !== null) move(dragIndex, i);
                setDragIndex(null);
                setOverIndex(null);
              }}
              onDragEnd={() => {
                setDragIndex(null);
                setOverIndex(null);
              }}
              className={cn(
                'flex items-center gap-2 rounded-xl border bg-surface-2 py-2.5 pl-2 pr-2 transition-all sm:gap-3',
                dragIndex === i ? 'opacity-40' : 'opacity-100',
                overIndex === i && dragIndex !== i ? 'border-accent ring-2 ring-accent/20' : 'border-line',
              )}
            >
              <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-fg-subtle active:cursor-grabbing" aria-hidden />
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-surface text-xs font-semibold text-fg-muted ring-1 ring-line">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-fg" title={it.file.name}>{it.file.name}</p>
                <p className="text-xs text-fg-subtle">{formatBytes(it.file.size)} · {pluralize(it.pages, 'page')}</p>
              </div>
              <div className="flex shrink-0 items-center">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => move(i, i - 1)} disabled={i === 0} aria-label={`Move ${it.file.name} up`} icon={<ArrowUp className="h-4 w-4" />} />
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => move(i, i + 1)} disabled={i === items.length - 1} aria-label={`Move ${it.file.name} down`} icon={<ArrowDown className="h-4 w-4" />} />
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => remove(it.id)} aria-label={`Remove ${it.file.name}`} icon={<X className="h-4 w-4" />} />
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-4">
          <Dropzone
            compact
            multiple
            onFiles={addFiles}
            accept=".pdf,application/pdf"
            disabled={adding || merging}
            title={adding ? 'Reading files…' : 'Add more PDFs'}
            icon={<Plus className="h-5 w-5" aria-hidden />}
          />
        </div>
      </Card>

      <Card className="h-fit space-y-5 p-5">
        <Input label="Output file name" value={name} onChange={(e) => setName(e.target.value)} hint={outName} />
        {items.length < 2 && <Notice tone="info">Add at least one more PDF to merge.</Notice>}
        {merging && <Progress value={progress} label="Merging" />}
        {!result ? (
          <Button size="lg" className="w-full" onClick={merge} loading={merging} disabled={items.length < 2 || adding} icon={<FileStack className="h-4 w-4" aria-hidden />}>
            {merging ? 'Merging…' : 'Merge PDFs'}
          </Button>
        ) : (
          <div className="space-y-3">
            <Notice tone="success" title="Your PDF is ready">
              {pluralize(totalPages, 'page')} · {formatBytes(result.size)}
            </Notice>
            <Button size="lg" className="w-full" onClick={() => downloadBlob(result, outName)} icon={<Download className="h-4 w-4" aria-hidden />}>
              Download merged PDF
            </Button>
            <Button variant="ghost" className="w-full" onClick={reset} icon={<RotateCcw className="h-4 w-4" aria-hidden />}>
              Start over
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
