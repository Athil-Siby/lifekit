import { ArrowRight, TrendingDown, TrendingUp } from 'lucide-react';
import { formatBytes } from '../utils/format';
import { cn } from '../lib/cn';

/** Shows original vs. new size and the honest percentage change. */
export function SizeComparison({ original, result }: { original: number; result: number }) {
  const change = ((original - result) / original) * 100;
  const smaller = result < original;
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-xl border border-line bg-surface-2 p-4">
      <div>
        <p className="text-xs uppercase tracking-wide text-fg-subtle">Original</p>
        <p className="mt-0.5 text-lg font-semibold tabular-nums text-fg">{formatBytes(original, { decimals: 2 })}</p>
      </div>
      <ArrowRight className="h-4 w-4 text-fg-subtle" aria-hidden />
      <div className="text-right">
        <p className="text-xs uppercase tracking-wide text-fg-subtle">New</p>
        <p className="mt-0.5 text-lg font-semibold tabular-nums text-fg">{formatBytes(result, { decimals: 2 })}</p>
      </div>
      <div
        className={cn(
          'col-span-3 flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold',
          smaller ? 'bg-success-soft text-success' : 'bg-warning-soft text-warning',
        )}
      >
        {smaller ? <TrendingDown className="h-4 w-4" aria-hidden /> : <TrendingUp className="h-4 w-4" aria-hidden />}
        {smaller
          ? `${change.toFixed(change < 1 ? 2 : 1)}% smaller (saved ${formatBytes(original - result)})`
          : result === original
            ? 'Same size as the original'
            : `${Math.abs(change).toFixed(1)}% larger than the original`}
      </div>
    </div>
  );
}
