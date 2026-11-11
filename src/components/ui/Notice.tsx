import type { ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Info, ShieldCheck, XCircle } from 'lucide-react';
import { cn } from '../../lib/cn';

type Tone = 'info' | 'success' | 'warning' | 'error' | 'privacy';

const tones: Record<Tone, { cls: string; Icon: typeof Info }> = {
  info: { cls: 'bg-accent-soft text-fg border-accent/20', Icon: Info },
  success: { cls: 'bg-success-soft text-fg border-success/25', Icon: CheckCircle2 },
  warning: { cls: 'bg-warning-soft text-fg border-warning/25', Icon: AlertTriangle },
  error: { cls: 'bg-danger-soft text-fg border-danger/25', Icon: XCircle },
  privacy: { cls: 'bg-surface-2 text-fg border-line', Icon: ShieldCheck },
};

const iconColor: Record<Tone, string> = {
  info: 'text-accent-text',
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-danger',
  privacy: 'text-success',
};

export function Notice({ tone = 'info', title, children, className }: { tone?: Tone; title?: ReactNode; children?: ReactNode; className?: string }) {
  const { cls, Icon } = tones[tone];
  return (
    <div role={tone === 'error' ? 'alert' : undefined} className={cn('flex gap-3 rounded-xl border px-4 py-3 text-sm', cls, className)}>
      <Icon className={cn('mt-0.5 h-4.5 w-4.5 shrink-0', iconColor[tone])} aria-hidden />
      <div className="min-w-0 flex-1">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={cn('text-fg-muted', title ? 'mt-0.5' : undefined)}>{children}</div>}
      </div>
    </div>
  );
}
