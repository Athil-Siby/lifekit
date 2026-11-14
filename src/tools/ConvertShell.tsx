import { useState, type ReactNode } from 'react';
import { Download, RotateCcw } from 'lucide-react';
import { downloadBlob } from '../utils/download';
import { formatBytes } from '../utils/format';
import { Card } from '../components/ui/Card';
import { Dropzone } from '../components/ui/Dropzone';
import { Button } from '../components/ui/Button';
import { Notice } from '../components/ui/Notice';
import { Progress } from '../components/ui/Misc';
import { FileChip } from '../components/FileChip';
import { useToast } from '../components/ui/Toast';

export interface ConvertResult {
  blob: Blob;
  name: string;
  summary: ReactNode;
  warning?: ReactNode;
}

/** Shared layout for "drop one file → convert → download" tools. */
export function ConvertShell({
  accept,
  dropTitle,
  dropHint,
  icon,
  validate,
  convert,
  actionLabel,
  workingLabel,
  options,
  limitsNote,
  kind = 'pdf',
}: {
  accept: string;
  dropTitle: string;
  dropHint: string;
  icon: ReactNode;
  validate: (f: File) => Promise<string | null>;
  convert: (f: File, onProgress: (done: number, total: number) => void) => Promise<ConvertResult>;
  actionLabel: string;
  workingLabel: string;
  options?: ReactNode;
  limitsNote: ReactNode;
  kind?: 'pdf' | 'image';
}) {
  const toast = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [working, setWorking] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [result, setResult] = useState<ConvertResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const select = async (files: File[]) => {
    const f = files[0];
    if (!f) return;
    const err = await validate(f);
    if (err) {
      toast.error(err);
      return;
    }
    setFile(f);
    setResult(null);
    setError(null);
  };

  const run = async () => {
    if (!file) return;
    setWorking(true);
    setProgress(null);
    setResult(null);
    setError(null);
    try {
      const r = await convert(file, (d, t) => setProgress(d / t));
      setResult(r);
      toast.success('Your file is ready');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'The file could not be converted.');
    } finally {
      setWorking(false);
    }
  };

  const reset = () => {
    setFile(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <Card className="p-4 sm:p-6">
        {!file ? (
          <Dropzone onFiles={select} accept={accept} title={dropTitle} hint={dropHint} icon={icon} />
        ) : (
          <div className="space-y-5">
            <FileChip file={file} kind={kind} onRemove={working ? undefined : reset} />
            {working && <Progress value={progress ?? 0.05} label={workingLabel} />}
            {error && <Notice tone="error" title="Couldn’t convert this file">{error}</Notice>}
            {result && (
              <div className="animate-fade-up space-y-4 rounded-2xl border border-success/30 bg-success-soft p-5">
                <div>
                  <p className="font-semibold text-fg">{result.name}</p>
                  <p className="text-sm text-fg-muted">{result.summary} · {formatBytes(result.blob.size)}</p>
                </div>
                {result.warning && <Notice tone="warning">{result.warning}</Notice>}
                <Button size="lg" className="w-full sm:w-auto" onClick={() => downloadBlob(result.blob, result.name)} icon={<Download className="h-5 w-5" aria-hidden />}>
                  Download
                </Button>
              </div>
            )}
            {!result && (
              <Button size="lg" className="w-full" onClick={run} loading={working} disabled={working}>
                {working ? workingLabel + '…' : actionLabel}
              </Button>
            )}
            <Button variant="ghost" className="w-full" onClick={reset} disabled={working} icon={<RotateCcw className="h-4 w-4" aria-hidden />}>
              Convert another file
            </Button>
          </div>
        )}
      </Card>
      <Card className="h-fit space-y-4 p-5">
        {options}
        <Notice tone="info" title="Good to know">{limitsNote}</Notice>
        <p className="text-xs text-fg-subtle">Converted on your device. Your file is never uploaded.</p>
      </Card>
    </div>
  );
}
