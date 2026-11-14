import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CalendarDays, ChevronRight, Clock } from 'lucide-react';
import { guides, guidesBySlug } from '../config/guides';
import { toolsBySlug } from '../config/tools';
import { useSeo } from '../hooks/useSeo';
import { absoluteUrl } from '../config/site';
import { parseMarkdown } from '../lib/markdown';
import { formatGuideDate, readingMinutes } from '../lib/guideMeta';
import { Markdown } from '../components/Markdown';
import { ToolCard } from '../components/ToolCard';
import { GuideCard } from '../components/GuideCard';
import { AdSlot } from '../components/AdSlot';
import NotFound from './NotFound';

export default function GuidePage() {
  const { slug = '' } = useParams();
  const guide = guidesBySlug[slug];
  const blocks = useMemo(() => (guide ? parseMarkdown(guide.body) : []), [guide]);

  useSeo({
    title: guide ? `${guide.title} | LifeKit` : 'Guide not found – LifeKit',
    description: guide?.description ?? 'This guide could not be found.',
    path: `/guides/${slug}`,
    noindex: !guide,
    jsonLd: guide
      ? [
          {
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: guide.title,
            description: guide.description,
            datePublished: guide.date,
            dateModified: guide.date,
            mainEntityOfPage: absoluteUrl(`/guides/${guide.slug}`),
            author: { '@type': 'Organization', name: 'LifeKit' },
            publisher: { '@type': 'Organization', name: 'LifeKit' },
          },
        ]
      : [],
  });

  if (!guide) return <NotFound />;
  const tools = guide.tools.map((s) => toolsBySlug[s]).filter(Boolean);
  const more = guides.filter((g) => g.slug !== guide.slug).slice(0, 3);
  const toc = blocks.filter((b) => b.type === 'h2');

  return (
    <article>
      <div className="border-b border-line bg-surface-2">
        <div className="container-page max-w-6xl py-10 sm:py-14">
          <div className="max-w-3xl">
          <nav aria-label="Breadcrumb" className="mb-5">
            <ol className="flex flex-wrap items-center gap-1 text-sm text-fg-subtle">
              <li><Link to="/" className="hover:text-fg">Home</Link></li>
              <li aria-hidden><ChevronRight className="h-3.5 w-3.5" /></li>
              <li><Link to="/guides" className="hover:text-fg">Guides</Link></li>
            </ol>
          </nav>
          <h1 className="text-3xl font-semibold tracking-tight text-fg sm:text-4xl">{guide.title}</h1>
          <p className="mt-3 text-lg text-fg-muted">{guide.description}</p>
          <p className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-fg-subtle">
            <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4" aria-hidden />{formatGuideDate(guide.date)}</span>
            <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" aria-hidden />{readingMinutes(guide.body)} min read</span>
          </p>
          </div>
        </div>
      </div>

      <div className="container-page grid max-w-6xl gap-10 py-10 lg:grid-cols-[1fr_260px]">
        <div className="min-w-0 max-w-3xl">
          <Markdown blocks={blocks} />
          <AdSlot placement="tool" />
        </div>
        <aside className="space-y-6 lg:sticky lg:top-24 lg:h-fit">
          {toc.length > 2 && (
            <nav aria-label="In this guide" className="hidden rounded-2xl border border-line bg-surface p-5 lg:block">
              <p className="text-xs font-semibold uppercase tracking-wide text-fg-subtle">In this guide</p>
              <ul className="mt-3 space-y-2 text-sm">
                {toc.map((h) => h.type === 'h2' && (
                  <li key={h.id}><a href={`#${h.id}`} className="text-fg-muted hover:text-fg">{h.text.map((t) => t.text).join('')}</a></li>
                ))}
              </ul>
            </nav>
          )}
        </aside>
      </div>

      {tools.length > 0 && (
        <section className="container-page max-w-6xl" aria-labelledby="try-tools">
          <h2 id="try-tools" className="text-xl font-semibold text-fg">Free tools for this</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map((t) => <ToolCard key={t.slug} tool={t} />)}
          </div>
        </section>
      )}

      <section className="container-page mt-16 max-w-6xl" aria-labelledby="more-guides">
        <h2 id="more-guides" className="text-xl font-semibold text-fg">More guides</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {more.map((g) => <GuideCard key={g.slug} guide={g} />)}
        </div>
      </section>
    </article>
  );
}
