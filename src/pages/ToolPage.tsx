import { Suspense } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronRight, Lock, ShieldCheck } from 'lucide-react';
import { getCategory, toolsBySlug } from '../config/tools';
import { toolComponents } from '../tools';
import { useSeo } from '../hooks/useSeo';
import { absoluteUrl } from '../config/site';
import { ToolIcon } from '../components/ToolIcon';
import { ToolCard } from '../components/ToolCard';
import { FaqList } from '../components/Faq';
import { AdSlot } from '../components/AdSlot';
import { PageLoader } from '../components/PageLoader';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { guidesForTool } from '../config/guides';
import { GuideCard } from '../components/GuideCard';
import NotFound from './NotFound';

export default function ToolPage() {
  const { slug = '' } = useParams();
  const tool = toolsBySlug[slug];
  const Component = toolComponents[slug];

  useSeo({
    title: tool ? `${tool.name} – Free Online Tool | LifeKit` : 'Tool not found – LifeKit',
    description: tool?.metaDescription ?? 'This tool could not be found.',
    path: `/tools/${slug}`,
    noindex: !tool,
    jsonLd: tool
      ? [
          {
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: tool.name,
            description: tool.metaDescription,
            url: absoluteUrl(`/tools/${tool.slug}`),
            applicationCategory: 'UtilitiesApplication',
            operatingSystem: 'Any (runs in a web browser)',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          },
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: tool.faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') },
              { '@type': 'ListItem', position: 2, name: 'Tools', item: absoluteUrl('/tools') },
              { '@type': 'ListItem', position: 3, name: tool.name, item: absoluteUrl(`/tools/${tool.slug}`) },
            ],
          },
        ]
      : [],
  });

  if (!tool || !Component) return <NotFound />;
  const category = getCategory(tool.category);
  const related = tool.related.map((s) => toolsBySlug[s]).filter(Boolean);
  const toolGuides = guidesForTool(tool.slug).slice(0, 3);

  return (
    <article>
      <div className="border-b border-line bg-surface-2">
        <div className="container-page py-8 sm:py-10">
          <nav aria-label="Breadcrumb" className="mb-5">
            <ol className="flex flex-wrap items-center gap-1 text-sm text-fg-subtle">
              <li><Link to="/" className="hover:text-fg">Home</Link></li>
              <li aria-hidden><ChevronRight className="h-3.5 w-3.5" /></li>
              <li><Link to={`/tools?category=${category.id}`} className="hover:text-fg">{category.name}</Link></li>
              <li aria-hidden><ChevronRight className="h-3.5 w-3.5" /></li>
              <li aria-current="page" className="text-fg-muted">{tool.name}</li>
            </ol>
          </nav>
          <div className="flex items-start gap-4">
            <ToolIcon name={tool.icon} category={tool.category} size="lg" />
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-fg sm:text-3xl">{tool.name}</h1>
              <p className="mt-2 max-w-2xl text-fg-muted">{tool.intro}</p>
            </div>
          </div>
          <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-medium text-fg-muted">
            {tool.privacyNote ? (
              <>
                <Lock className="h-3.5 w-3.5 text-success" aria-hidden />
                {tool.privacyNote}
              </>
            ) : tool.handlesFiles ? (
              <>
                <ShieldCheck className="h-4 w-4 text-success" aria-hidden />
                Files are processed locally in your browser and are never uploaded.
              </>
            ) : (
              <>
                <Lock className="h-3.5 w-3.5 text-success" aria-hidden />
                Runs entirely in your browser. Nothing you enter is sent to a server.
              </>
            )}
          </p>
        </div>
      </div>

      <section className="container-page py-8 sm:py-10" aria-label={`${tool.name} tool`}>
        <ErrorBoundary>
          <Suspense fallback={<PageLoader label={`Loading ${tool.name}…`} />}>
            <Component />
          </Suspense>
        </ErrorBoundary>
      </section>

      <div className="container-page grid gap-12 pb-4 lg:grid-cols-3">
        <section className="lg:col-span-1" aria-labelledby="how-to">
          <h2 id="how-to" className="text-xl font-semibold text-fg">How to use the {tool.name}</h2>
          <ol className="mt-5 space-y-4">
            {tool.steps.map((s, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent-text">
                  {i + 1}
                </span>
                <p className="pt-0.5 text-sm leading-relaxed text-fg-muted">{s}</p>
              </li>
            ))}
          </ol>
          {tool.handlesFiles && (
            <div className="mt-8 rounded-2xl border border-line bg-surface-2 p-5">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-fg">
                <ShieldCheck className="h-4 w-4 text-success" aria-hidden /> Your files stay private
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-fg-muted">
                This tool reads your files using your browser and processes them on your device. They are not uploaded
                to LifeKit or anyone else, and they are released from memory when you clear them or leave the page.
              </p>
            </div>
          )}
        </section>
        <section className="lg:col-span-2" aria-labelledby="faq">
          <h2 id="faq" className="text-xl font-semibold text-fg">Frequently asked questions</h2>
          <div className="mt-5">
            <FaqList items={tool.faqs} />
          </div>
        </section>
      </div>

      <div className="container-page">
        <AdSlot placement="tool" />
      </div>

      {toolGuides.length > 0 && (
        <section className="container-page mt-16" aria-labelledby="guides">
          <h2 id="guides" className="text-xl font-semibold text-fg">Helpful guides</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {toolGuides.map((g) => (
              <GuideCard key={g.slug} guide={g} />
            ))}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="container-page mt-16" aria-labelledby="related">
          <h2 id="related" className="text-xl font-semibold text-fg">Related tools</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((t) => (
              <ToolCard key={t.slug} tool={t} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
