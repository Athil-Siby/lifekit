import { Loader2 } from 'lucide-react';

export function PageLoader({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center" role="status">
      <Loader2 className="h-6 w-6 animate-spin text-accent-text" aria-hidden />
      <span className="sr-only">{label}</span>
    </div>
  );
}
