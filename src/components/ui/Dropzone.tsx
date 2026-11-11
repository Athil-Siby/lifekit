import { useId, useRef, useState, type DragEvent, type KeyboardEvent, type ReactNode } from 'react';
import { UploadCloud } from 'lucide-react';
import { cn } from '../../lib/cn';

/** Click-or-drop file picker. Keyboard accessible (Enter/Space opens the file dialog). */
export function Dropzone({
  onFiles,
  accept,
  multiple,
  title,
  hint,
  disabled,
  compact,
  icon,
}: {
  onFiles: (files: File[]) => void;
  accept: string;
  multiple?: boolean;
  title: string;
  hint?: ReactNode;
  disabled?: boolean;
  compact?: boolean;
  icon?: ReactNode;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const depth = useRef(0);
  const hintId = useId();

  const open = () => !disabled && input.current?.click();

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    depth.current = 0;
    setDragging(false);
    if (disabled) return;
    const files = Array.from(e.dataTransfer.files);
    if (files.length) onFiles(multiple ? files : files.slice(0, 1));
  };

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      open();
    }
  };

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled || undefined}
      aria-describedby={hint ? hintId : undefined}
      onClick={open}
      onKeyDown={onKey}
      onDragEnter={(e) => {
        e.preventDefault();
        depth.current++;
        setDragging(true);
      }}
      onDragOver={(e) => e.preventDefault()}
      onDragLeave={() => {
        depth.current = Math.max(0, depth.current - 1);
        if (depth.current === 0) setDragging(false);
      }}
      onDrop={onDrop}
      className={cn(
        'group flex flex-col items-center justify-center rounded-2xl border-2 border-dashed text-center transition-all',
        compact ? 'px-4 py-6' : 'px-6 py-12 sm:py-16',
        dragging ? 'border-accent bg-accent-soft scale-[1.01]' : 'border-line-strong bg-surface-2 hover:border-accent hover:bg-accent-soft/50',
        disabled && 'opacity-50 cursor-not-allowed',
      )}
    >
      <div
        className={cn(
          'mb-3 flex items-center justify-center rounded-2xl bg-surface text-accent-text shadow-sm ring-1 ring-line transition-transform group-hover:-translate-y-0.5',
          compact ? 'h-10 w-10' : 'h-14 w-14',
        )}
      >
        {icon ?? <UploadCloud className={compact ? 'h-5 w-5' : 'h-7 w-7'} aria-hidden />}
      </div>
      <p className={cn('font-semibold text-fg', compact ? 'text-sm' : 'text-base')}>
        {dragging ? 'Drop to add' : title}
      </p>
      <p className="mt-1 text-sm text-fg-muted">
        or <span className="font-medium text-accent-text underline underline-offset-2">browse your device</span>
      </p>
      {hint && (
        <p id={hintId} className="mt-2 text-xs text-fg-subtle">
          {hint}
        </p>
      )}
      <input
        ref={input}
        type="file"
        accept={accept}
        multiple={multiple}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          if (files.length) onFiles(files);
          e.target.value = '';
        }}
      />
    </div>
  );
}
