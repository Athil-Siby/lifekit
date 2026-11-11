import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen } from 'lucide-react';
import type { Guide } from '../config/guides';
import { readingMinutes } from '../lib/guideMeta';

export function GuideCard({ guide }: { guide: Guide }) {
  return (
    <Link
      to={`/guides/${guide.slug}`}
      className="group flex h-full flex-col rounded-2xl border border-line bg-surface p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-lg hover:shadow-black/[0.04]"
    >
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-fg-subtle">
        <BookOpen className="h-3.5 w-3.5" aria-hidden /> Guide · {readingMinutes(guide.body)} min read
      </span>
      <h3 className="mt-3 font-semibold leading-snug text-fg">{guide.title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-fg-muted">{guide.description}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent-text">
        Read guide <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
      </span>
    </Link>
  );
}
