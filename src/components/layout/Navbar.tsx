import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Menu, Search, X } from 'lucide-react';
import { Logo } from '../Logo';
import { ThemeToggle } from './ThemeToggle';
import { Kbd } from '../ui/Misc';
import { cn } from '../../lib/cn';

const links = [
  { to: '/tools', label: 'All tools' },
  { to: '/tools?category=pdf', label: 'PDF' },
  { to: '/tools?category=image', label: 'Images' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export function Navbar({ onSearch }: { onSearch: () => void }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => setOpen(false), [location.pathname, location.search]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isActive = (to: string) => {
    const [path, query] = to.split('?');
    if (query) return location.pathname === path && location.search === `?${query}`;
    if (path === '/tools') return location.pathname.startsWith('/tools') && !location.search.includes('category=');
    return location.pathname === path;
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-50 border-b transition-colors duration-200',
        scrolled ? 'border-line bg-bg/85 backdrop-blur-lg' : 'border-transparent bg-bg',
      )}
    >
      <nav className="container-page flex h-16 items-center justify-between gap-4" aria-label="Main">
        <Logo />
        <ul className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <li key={l.to}>
              <NavLink
                to={l.to}
                className={cn(
                  'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive(l.to) ? 'text-fg bg-surface-3' : 'text-fg-muted hover:text-fg',
                )}
              >
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onSearch}
            className="hidden h-9 items-center gap-2 rounded-lg border border-line bg-surface-2 pl-3 pr-1.5 text-sm text-fg-subtle transition-colors hover:border-line-strong hover:text-fg sm:inline-flex"
            aria-label="Search tools"
          >
            <Search className="h-4 w-4" aria-hidden />
            <span className="mr-4">Search…</span>
            <Kbd>Ctrl K</Kbd>
          </button>
          <button
            type="button"
            onClick={onSearch}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-fg-muted hover:bg-surface-3 hover:text-fg sm:hidden"
            aria-label="Search tools"
          >
            <Search className="h-[18px] w-[18px]" />
          </button>
          <ThemeToggle />
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-fg-muted hover:bg-surface-3 hover:text-fg md:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>
      {open && (
        <div id="mobile-nav" className="animate-fade-up border-t border-line bg-bg md:hidden">
          <ul className="container-page flex flex-col py-3">
            {links.map((l) => (
              <li key={l.to}>
                <NavLink
                  to={l.to}
                  className={cn(
                    'block rounded-lg px-3 py-2.5 text-base font-medium',
                    isActive(l.to) ? 'bg-surface-3 text-fg' : 'text-fg-muted hover:text-fg',
                  )}
                >
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
