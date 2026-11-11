import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import type { Tool } from '../config/tools';
import { ToolIcon } from './ToolIcon';
import { Badge } from './ui/Misc';

export function ToolCard({ tool }: { tool: Tool }) {
  return (
    <Link
      to={`/tools/${tool.slug}`}
      className="group relative flex h-full flex-col rounded-2xl border border-line bg-surface p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-lg hover:shadow-black/[0.04] dark:hover:shadow-black/30"
    >
      <div className="flex items-start justify-between gap-3">
        <ToolIcon name={tool.icon} category={tool.category} />
        <div className="flex items-center gap-2">
          {tool.badge === 'popular' && <Badge tone="accent">Popular</Badge>}
          {tool.badge === 'new' && <Badge tone="success">New</Badge>}
          <ArrowUpRight className="h-4 w-4 text-fg-subtle opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
        </div>
      </div>
      <h3 className="mt-4 font-semibold text-fg">{tool.name}</h3>
      <p className="mt-1 text-sm leading-relaxed text-fg-muted">{tool.short}</p>
    </Link>
  );
}
