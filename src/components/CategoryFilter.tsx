import { categories, tools, type CategoryId } from '../config/tools';
import { cn } from '../lib/cn';

export function CategoryFilter({ value, onChange }: { value: CategoryId | 'all'; onChange: (v: CategoryId | 'all') => void }) {
  const items: { id: CategoryId | 'all'; name: string; count: number }[] = [
    { id: 'all', name: 'All tools', count: tools.length },
    ...categories.map((c) => ({ id: c.id, name: c.name, count: tools.filter((t) => t.category === c.id).length })),
  ];
  return (
    <div role="group" aria-label="Filter by category" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
      {items.map((c) => {
        const active = value === c.id;
        return (
          <button
            key={c.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(c.id)}
            className={cn(
              'inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all',
              active
                ? 'border-fg bg-fg text-bg'
                : 'border-line bg-surface text-fg-muted hover:border-line-strong hover:text-fg',
            )}
          >
            {c.name}
            <span className={cn('rounded-full px-1.5 text-xs tabular-nums', active ? 'bg-bg/20' : 'bg-surface-3')}>{c.count}</span>
          </button>
        );
      })}
    </div>
  );
}
