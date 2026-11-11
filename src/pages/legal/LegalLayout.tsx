import type { ReactNode } from 'react';
import { PageHeader } from '../../components/PageHeader';
import { legalConfig } from '../../config/legal';

export function LegalLayout({ title, intro, toc, children }: { title: string; intro: ReactNode; toc: { id: string; label: string }[]; children: ReactNode }) {
  return (
    <>
      <PageHeader eyebrow="Legal" title={title}>
        <p>{intro}</p>
        <p className="mt-3 text-sm text-fg-subtle">Last updated: {legalConfig.lastUpdated}</p>
      </PageHeader>
      <div className="container-page grid gap-10 py-12 lg:grid-cols-[220px_1fr]">
        <nav aria-label="On this page" className="hidden lg:block">
          <div className="sticky top-24">
            <p className="text-xs font-semibold uppercase tracking-wide text-fg-subtle">On this page</p>
            <ul className="mt-3 space-y-2 text-sm">
              {toc.map((t) => (
                <li key={t.id}>
                  <a href={`#${t.id}`} className="text-fg-muted hover:text-fg">{t.label}</a>
                </li>
              ))}
            </ul>
          </div>
        </nav>
        <div className="prose-lk max-w-3xl">{children}</div>
      </div>
    </>
  );
}
