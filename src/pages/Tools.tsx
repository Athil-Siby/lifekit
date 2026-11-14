import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SearchX, X } from 'lucide-react';
import { categories, tools, type CategoryId } from '../config/tools';
import { staticPages } from '../config/pages';
import { searchTools } from '../lib/search';
import { useSeo } from '../hooks/useSeo';
import { ToolCard } from '../components/ToolCard';
import { CategoryFilter } from '../components/CategoryFilter';
import { EmptyState } from '../components/ui/Misc';
import { Button } from '../components/ui/Button';
import { AdSlot } from '../components/AdSlot';

export default function Tools() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const rawCat = params.get('category');
  const category: CategoryId | 'all' = categories.some((c) => c.id === rawCat) ? (rawCat as CategoryId) : 'all';
  const activeCategory = categories.find((c) => c.id === category);

  const meta = staticPages.find((p) => p.path === '/tools')!;
  useSeo({
    title: activeCategory ? `${activeCategory.name} – Free Online Tools | LifeKit` : meta.title,
    description: activeCategory ? `${activeCategory.description} Free, private and running in your browser.` : meta.description,
    path: activeCategory ? `/tools?category=${activeCategory.id}` : '/tools',
  });

  const results = useMemo(() => {
    const list = category === 'all' ? tools : tools.filter((t) => t.category === category);
    return searchTools(q, list);
  }, [q, category]);

  const update = (next: { q?: string; category?: CategoryId | 'all' }) => {
    const p = new URLSearchParams(params);
    if (next.q !== undefined) {
      if (next.q) p.set('q', next.q);
      else p.delete('q');
    }
    if (next.category !== undefined) {
      if (next.category === 'all') p.delete('category');
      else p.set('category', next.category);
    }
    setParams(p, { replace: true });
  };

  return (
    <>
      <div className="border-b border-line bg-surface-2">
        <div className="container-page py-12 sm:py-14">
          <h1 className="text-3xl font-semibold tracking-tight text-fg sm:text-4xl">{activeCategory ? activeCategory.name : 'All tools'}</h1>
          <p className="mt-2 max-w-2xl text-fg-muted">
            {activeCategory
              ? activeCategory.description
              : `${tools.length} free tools for PDFs, images, passwords, calculations, text and files. Search or filter to find what you need.`}
          </p>
          <div className="relative mt-7 max-w-xl">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-subtle" aria-hidden />
            <input
              type="search"
              value={q}
              onChange={(e) => update({ q: e.target.value })}
              placeholder="Filter tools by name or keyword…"
              aria-label="Filter tools"
              className="h-12 w-full rounded-xl border border-line bg-surface pl-11 pr-10 text-fg placeholder:text-fg-subtle focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/15 [&::-webkit-search-cancel-button]:hidden"
            />
            {q && (
              <button type="button" onClick={() => update({ q: '' })} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-fg-subtle hover:text-fg" aria-label="Clear filter">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="container-page py-8">
        <CategoryFilter value={category} onChange={(c) => update({ category: c })} />
        <p className="mt-6 text-sm text-fg-subtle" aria-live="polite">
          {results.length} tool{results.length === 1 ? '' : 's'}
          {q && <> matching “{q}”</>}
        </p>
        {results.length === 0 ? (
          <div className="mt-4">
            <EmptyState icon={<SearchX className="h-6 w-6" />} title="No tools found">
              <p>Try a different word, or browse all categories.</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => setParams({}, { replace: true })}>
                Reset filters
              </Button>
            </EmptyState>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((t) => (
              <ToolCard key={t.slug} tool={t} />
            ))}
          </div>
        )}
        <AdSlot placement="directory" />
      </div>
    </>
  );
}
