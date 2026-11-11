import type { ReactNode } from 'react';
import { FileText, ImageIcon, X } from 'lucide-react';
import { formatBytes } from '../utils/format';

export function FileChip({ file, kind, meta, onRemove }: { file: File; kind: 'pdf' | 'image'; meta?: ReactNode; onRemove?: () => void }) {
  const Icon = kind === 'pdf' ? FileText : ImageIcon;
  return (
    <div className="flex items-center gap-3 rounded-xl border border-line bg-surface-2 px-4 py-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface text-fg-muted ring-1 ring-line">
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-fg" title={file.name}>{file.name}</p>
        <p className="text-xs text-fg-subtle">
          {formatBytes(file.size)}
          {meta && <> · {meta}</>}
        </p>
      </div>
      {onRemove && (
        <button type="button" onClick={onRemove} className="rounded-lg p-1.5 text-fg-subtle hover:bg-surface-3 hover:text-fg" aria-label={`Remove ${file.name}`}>
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
