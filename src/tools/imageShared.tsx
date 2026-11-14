import { Download } from 'lucide-react';
import { useObjectUrl } from '../hooks/useObjectUrl';
import { downloadBlob } from '../utils/download';
import { formatBytes } from '../utils/format';
import { Button } from '../components/ui/Button';
import type { OutputFormat } from '../lib/image';

export const IMAGE_INPUT = 'image/jpeg,image/png,image/webp,image/gif,image/bmp,image/avif';

export function ResultImage({ blob, name, width, height, note }: { blob: Blob; name: string; width: number; height: number; note?: string }) {
  const url = useObjectUrl(blob);
  return (
    <div className="animate-fade-up space-y-3 rounded-2xl border border-success/30 bg-success-soft p-4">
      {url && (
        <div className={`${blob.type === 'image/jpeg' ? 'bg-surface-3' : 'checkerboard'} flex max-h-80 items-center justify-center overflow-hidden rounded-xl ring-1 ring-line`}>
          <img src={url} alt="Result preview" className="max-h-80 max-w-full object-contain" />
        </div>
      )}
      <p className="text-sm text-fg">
        <strong>{width} × {height}px</strong> · {formatBytes(blob.size)}
        {note && <span className="text-fg-muted"> · {note}</span>}
      </p>
      <Button className="w-full" onClick={() => downloadBlob(blob, name)} icon={<Download className="h-4 w-4" aria-hidden />}>
        Download
      </Button>
    </div>
  );
}

export const EXT: Record<OutputFormat, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
export const baseOf = (name: string) => name.replace(/\.[^.]+$/, '') || 'image';
