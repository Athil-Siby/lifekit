import { Link } from 'react-router-dom';
import { ArrowRight, Ban, Cpu, Gift, Lock, ShieldCheck, Smartphone, UserX, Zap } from 'lucide-react';
import { categories, tools } from '../config/tools';
import { staticPages } from '../config/pages';
import { useSeo } from '../hooks/useSeo';
import { absoluteUrl } from '../config/site';
import { SearchBar } from '../components/SearchBar';
import { ToolCard } from '../components/ToolCard';
import { ToolIcon } from '../components/ToolIcon';
import { FaqList } from '../components/Faq';
import { AdSlot } from '../components/AdSlot';
import { buttonClasses } from '../components/ui/Button';

const homeFaqs = [
  {
    q: 'Is LifeKit really free?',
    a: 'Yes. Every tool is free to use with no account and no usage limits beyond what your device can handle. In the future we may show ads to cover running costs, which will never be placed inside a tool’s controls.',
  },
  {
    q: 'Are my files uploaded anywhere?',
    a: 'No. The PDF and image tools read your files with your browser and process them on your own device. Files are not sent to LifeKit’s servers or any third party.',
  },
  {
    q: 'Do I need to install anything?',
    a: 'No. LifeKit works in any modern browser on desktop, tablet or phone. Bookmark the tools you use most to get back to them quickly.',
  },
  {
    q: 'Does LifeKit work offline?',
    a: 'Once a tool page has loaded, the processing itself does not need a connection. You do need to be online to load the page the first time.',
  },
  {
    q: 'Can I suggest a new tool?',
    a: 'Please do. Use the contact page to tell us what would make your day easier, and we will consider it for a future update.',
  },
];

const benefits = [
  { icon: Zap, title: 'Instant results', text: 'No queues or waiting for uploads. Tools respond as you type or the moment you drop a file.' },
  { icon: UserX, title: 'No sign-up', text: 'Open a tool and use it. No account, email address or trial period required.' },
  { icon: Smartphone, title: 'Works everywhere', text: 'Designed for phones, tablets and desktops, in light or dark mode.' },
  { icon: Gift, title: 'Free to use', text: 'Every tool is free, without watermarks, daily limits or locked features.' },
];

export default function Home() {
  const meta = staticPages[0];
  useSeo({
    title: meta.title,
    description: meta.description,
    path: '/',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'LifeKit',
        url: absoluteUrl('/'),
        potentialAction: {
          '@type': 'SearchAction',
          target: { '@type': 'EntryPoint', urlTemplate: `${absoluteUrl('/tools')}?q={search_term_string}` },
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: homeFaqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
      },
    ],
  });

  const popular = tools.filter((t) => t.badge === 'popular');

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 [background-image:radial-gradient(circle_at_1px_1px,var(--line)_1px,transparent_0)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_70%)]"
        />
        <div className="container-page relative pb-16 pt-14 text-center sm:pb-24 sm:pt-24">
          <p className="mx-auto inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-1.5 text-xs font-medium text-fg-muted shadow-sm">
            <ShieldCheck className="h-3.5 w-3.5 text-success" aria-hidden />
            {tools.length} free tools · Files never leave your device
          </p>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold tracking-tight text-fg sm:text-6xl sm:leading-[1.05]">
            Everything You Need, <span className="text-accent-text">All in One Place.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-fg-muted">
            LifeKit brings together the everyday tools you reach for: merge PDFs, shrink photos, create QR codes and
            strong passwords, convert units and time zones, and tidy up text. Fast, free and private by design.
          </p>
          <div className="mx-auto mt-9 max-w-2xl">
            <SearchBar />
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-sm">
            <span className="text-fg-subtle">Try:</span>
            {['pdf-merger', 'image-compressor', 'qr-code-generator', 'password-generator'].map((slug) => {
              const t = tools.find((x) => x.slug === slug)!;
              return (
                <Link key={slug} to={`/tools/${slug}`} className="rounded-full border border-line bg-surface px-3 py-1 text-fg-muted transition-colors hover:border-line-strong hover:text-fg">
                  {t.name}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Popular */}
      <section className="container-page" aria-labelledby="popular-heading">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 id="popular-heading" className="text-2xl font-bold tracking-tight text-fg">Popular tools</h2>
            <p className="mt-1 text-fg-muted">The tools people use most, one click away.</p>
          </div>
          <Link to="/tools" className="hidden items-center gap-1 text-sm font-medium text-accent-text hover:underline sm:inline-flex">
            View all <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {popular.map((t) => (
            <ToolCard key={t.slug} tool={t} />
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="container-page mt-20" aria-labelledby="categories-heading">
        <h2 id="categories-heading" className="text-2xl font-bold tracking-tight text-fg">Browse by category</h2>
        <p className="mt-1 text-fg-muted">Find the right tool by what you are working with.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => {
            const count = tools.filter((t) => t.category === c.id).length;
            return (
              <Link
                key={c.id}
                to={`/tools?category=${c.id}`}
                className="group flex items-center gap-4 rounded-2xl border border-line bg-surface p-5 transition-all hover:-translate-y-0.5 hover:border-line-strong hover:shadow-lg hover:shadow-black/[0.04]"
              >
                <ToolIcon name={c.icon} category={c.id} size="lg" />
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-fg">{c.name}</h3>
                  <p className="text-sm text-fg-muted">{c.description}</p>
                  <p className="mt-1 text-xs font-medium text-fg-subtle">{count} tool{count === 1 ? '' : 's'}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-fg-subtle transition-transform group-hover:translate-x-1" aria-hidden />
              </Link>
            );
          })}
        </div>
      </section>

      <div className="container-page">
        <AdSlot placement="home" />
      </div>

      {/* Directory */}
      <section className="container-page mt-20" aria-labelledby="all-heading">
        <h2 id="all-heading" className="text-2xl font-bold tracking-tight text-fg">All tools</h2>
        <p className="mt-1 text-fg-muted">Every LifeKit tool, grouped by category.</p>
        <div className="mt-8 space-y-10">
          {categories.map((c) => (
            <div key={c.id}>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-fg-subtle">{c.name}</h3>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {tools.filter((t) => t.category === c.id).map((t) => (
                  <li key={t.slug}>
                    <Link to={`/tools/${t.slug}`} className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-surface-3">
                      <ToolIcon name={t.icon} category={t.category} size="sm" />
                      <span className="text-sm font-medium text-fg">{t.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Why */}
      <section className="container-page mt-24" aria-labelledby="why-heading">
        <div className="text-center">
          <h2 id="why-heading" className="text-2xl font-bold tracking-tight text-fg sm:text-3xl">Why choose LifeKit</h2>
          <p className="mx-auto mt-2 max-w-xl text-fg-muted">Simple tools that do one job well, without the usual friction.</p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-2xl border border-line bg-surface p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent-text">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="mt-4 font-semibold text-fg">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-fg-muted">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Privacy */}
      <section className="container-page mt-24" aria-labelledby="privacy-heading">
        <div className="overflow-hidden rounded-3xl bg-slate-900 px-6 py-12 text-white dark:bg-surface-2 dark:ring-1 dark:ring-line sm:px-12 sm:py-16">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                <Lock className="h-6 w-6" aria-hidden />
              </span>
              <h2 id="privacy-heading" className="mt-5 text-2xl font-bold tracking-tight sm:text-3xl">Privacy built in, not bolted on</h2>
              <p className="mt-3 leading-relaxed text-slate-300 dark:text-fg-muted">
                Most online converters upload your documents to their servers. LifeKit does the work inside your
                browser instead, so contracts, IDs, photos and passwords never leave your device.
              </p>
              <Link to="/privacy" className={buttonClasses('secondary', 'md', 'mt-6 bg-white text-slate-900 hover:bg-slate-100 dark:bg-surface-3 dark:text-fg')}>
                Read our privacy policy
              </Link>
            </div>
            <ul className="space-y-4">
              {[
                { icon: Cpu, title: 'Processed on your device', text: 'PDF and image tools use JavaScript running in your browser tab.' },
                { icon: Ban, title: 'No file storage', text: 'Files are held in memory only while you use them, then released.' },
                { icon: ShieldCheck, title: 'No accounts or tracking profiles', text: 'There is nothing to sign up for, and we do not run analytics today.' },
              ].map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex gap-4 rounded-2xl bg-white/5 p-4 dark:bg-surface">
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" aria-hidden />
                  <div>
                    <p className="font-semibold">{title}</p>
                    <p className="text-sm text-slate-300 dark:text-fg-muted">{text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container-page mt-24 max-w-3xl" aria-labelledby="faq-heading">
        <h2 id="faq-heading" className="text-center text-2xl font-bold tracking-tight text-fg sm:text-3xl">Frequently asked questions</h2>
        <div className="mt-8">
          <FaqList items={homeFaqs} />
        </div>
      </section>
    </>
  );
}
