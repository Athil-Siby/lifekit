import { Link } from 'react-router-dom';

/** Minimal mark: a lavender tile with a single thin “L”. */
export function LogoMark({ className = 'h-7 w-7' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <rect width="32" height="32" rx="9" fill="var(--accent)" />
      <path d="M12 9v14h9" fill="none" stroke="var(--accent-fg)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 rounded-lg" aria-label="LifeKit home">
      <LogoMark />
      <span className="text-[17px] font-semibold tracking-tight text-fg">lifekit</span>
    </Link>
  );
}
