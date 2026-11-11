import { ChevronDown } from 'lucide-react';
import type { Faq as FaqItem } from '../config/tools';

export function FaqList({ items }: { items: FaqItem[] }) {
  return (
    <div className="divide-y divide-line rounded-2xl border border-line bg-surface">
      {items.map((f) => (
        <details key={f.q} className="group px-5 [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-medium text-fg">
            <h3 className="text-[15px]">{f.q}</h3>
            <ChevronDown className="h-4 w-4 shrink-0 text-fg-subtle transition-transform group-open:rotate-180" aria-hidden />
          </summary>
          <p className="-mt-1 pb-5 text-sm leading-relaxed text-fg-muted">{f.a}</p>
        </details>
      ))}
    </div>
  );
}
