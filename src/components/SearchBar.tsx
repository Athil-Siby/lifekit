import { useId, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { CornerDownLeft, Search, X } from 'lucide-react';
import { searchTools } from '../lib/search';
import { getCategory } from '../config/tools';
import { cn } from '../lib/cn';
import { ToolIcon } from './ToolIcon';

/**
 * Search box with a live suggestion list (ARIA combobox pattern).
 * Arrow keys move through suggestions, Enter opens the selected tool,
 * or submits to the directory when nothing is selected.
 */
export function SearchBar({
  size = 'lg',
  autoFocus,
  onNavigate,
  placeholder = 'Search tools, e.g. merge PDF',
  inline,
}: {
  size?: 'md' | 'lg';
  autoFocus?: boolean;
  onNavigate?: () => void;
  placeholder?: string;
  /** Render results inline (for the modal) instead of as a floating dropdown. */
  inline?: boolean;
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const navigate = useNavigate();
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => (query.trim() ? searchTools(query).slice(0, 6) : []), [query]);
  const showList = (open || inline) && query.trim().length > 0;

  const go = (path: string) => {
    setOpen(false);
    setQuery('');
    setActive(-1);
    onNavigate?.();
    navigate(path);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (active >= 0 && results[active]) go(`/tools/${results[active].slug}`);
    else if (results.length === 1) go(`/tools/${results[0].slug}`);
    else go(query.trim() ? `/tools?q=${encodeURIComponent(query.trim())}` : '/tools');
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActive((a) => Math.min(results.length - 1, a + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(-1, a - 1));
    } else if (e.key === 'Escape' && !inline) {
      setOpen(false);
      setActive(-1);
    }
  };

  return (
    <form role="search" onSubmit={onSubmit} className="relative w-full">
      <div className="relative">
        <Search
          className={cn('pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-fg-subtle', size === 'lg' ? 'h-5 w-5' : 'h-4 w-4')}
          aria-hidden
        />
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
          aria-label="Search tools"
          autoFocus={autoFocus}
          data-autofocus={autoFocus ? '' : undefined}
          value={query}
          placeholder={placeholder}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActive(-1);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 150)}
          onKeyDown={onKeyDown}
          autoComplete="off"
          className={cn(
            'w-full border border-line bg-surface text-fg placeholder:text-fg-subtle transition-all',
            'focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/15 [&::-webkit-search-cancel-button]:hidden',
            size === 'lg' ? 'h-14 rounded-2xl pl-12 pr-24 text-base shadow-sm' : 'h-11 rounded-xl pl-11 pr-20 text-sm',
            inline && 'border-0 shadow-none focus:ring-0 rounded-none border-b border-line',
          )}
        />
        <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="rounded-lg p-1.5 text-fg-subtle hover:bg-surface-3 hover:text-fg"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          {!inline && (
            <button
              type="submit"
              className={cn(
                'rounded-xl bg-accent font-medium text-accent-fg hover:bg-accent-hover',
                size === 'lg' ? 'px-4 py-2 text-sm' : 'px-3 py-1.5 text-xs',
              )}
            >
              Search
            </button>
          )}
        </div>
      </div>

      {showList && (
        <ul
          id={listId}
          role="listbox"
          aria-label="Matching tools"
          className={cn(
            'overflow-hidden bg-surface text-left',
            inline ? 'max-h-[50vh] overflow-y-auto p-2' : 'absolute z-40 mt-2 w-full rounded-2xl border border-line p-2 shadow-xl shadow-black/10',
          )}
        >
          {results.length === 0 ? (
            <li className="px-3 py-6 text-center text-sm text-fg-muted">
              No tools match “{query}”. Try a broader word like “PDF” or “image”.
            </li>
          ) : (
            results.map((t, i) => (
              <li
                key={t.slug}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === active}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => go(`/tools/${t.slug}`)}
                onMouseEnter={() => setActive(i)}
                className={cn('flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5', i === active && 'bg-surface-3')}
              >
                <ToolIcon name={t.icon} category={t.category} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-fg">{t.name}</span>
                  <span className="block truncate text-xs text-fg-subtle">{getCategory(t.category).name}</span>
                </span>
                {i === active && <CornerDownLeft className="h-4 w-4 text-fg-subtle" aria-hidden />}
              </li>
            ))
          )}
        </ul>
      )}
    </form>
  );
}
