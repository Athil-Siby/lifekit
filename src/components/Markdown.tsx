import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { Lightbulb } from 'lucide-react';
import type { Block, Inline } from '../lib/markdown';

function Inlines({ items }: { items: Inline[] }) {
  return (
    <>
      {items.map((x, i) => {
        if (x.type === 'bold') return <strong key={i}>{x.text}</strong>;
        if (x.type === 'code') return <code key={i} className="rounded bg-surface-3 px-1.5 py-0.5 text-[0.9em] text-fg">{x.text}</code>;
        if (x.type === 'link') {
          return x.href.startsWith('/') ? (
            <Link key={i} to={x.href}>{x.text}</Link>
          ) : (
            <a key={i} href={x.href} target="_blank" rel="noopener noreferrer">{x.text}</a>
          );
        }
        return <Fragment key={i}>{x.text}</Fragment>;
      })}
    </>
  );
}

/** Renders parsed guide content. Uses the shared .prose-lk typography styles. */
export function Markdown({ blocks }: { blocks: Block[] }) {
  return (
    <div className="prose-lk">
      {blocks.map((b, i) => {
        switch (b.type) {
          case 'h2':
            return <h2 key={i} id={b.id}><Inlines items={b.text} /></h2>;
          case 'h3':
            return <h3 key={i}><Inlines items={b.text} /></h3>;
          case 'p':
            return <p key={i}><Inlines items={b.text} /></p>;
          case 'ul':
            return <ul key={i}>{b.items.map((it, j) => <li key={j}><Inlines items={it} /></li>)}</ul>;
          case 'ol':
            return <ol key={i} className="mb-4 list-decimal space-y-1.5 pl-6">{b.items.map((it, j) => <li key={j}><Inlines items={it} /></li>)}</ol>;
          case 'tip':
            return (
              <div key={i} className="my-6 flex gap-3 rounded-xl border border-accent/20 bg-accent-soft px-4 py-3 text-fg">
                <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-accent-text" aria-hidden />
                <p className="!mb-0"><Inlines items={b.text} /></p>
              </div>
            );
        }
      })}
    </div>
  );
}
