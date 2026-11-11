import type { ReactNode } from 'react';

export function PageHeader({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: ReactNode }) {
  return (
    <div className="border-b border-line bg-surface-2">
      <div className="container-page py-12 sm:py-16">
        {eyebrow && <p className="text-sm font-semibold text-accent-text">{eyebrow}</p>}
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-fg sm:text-4xl">{title}</h1>
        {children && <div className="mt-3 max-w-2xl text-fg-muted">{children}</div>}
      </div>
    </div>
  );
}
