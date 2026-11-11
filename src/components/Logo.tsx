import { Link } from 'react-router-dom';

export function LogoMark({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <rect width="64" height="64" rx="16" className="fill-accent" />
      <path d="M20 18v28h24" fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="42" cy="22" r="5" fill="#c7d2fe" />
    </svg>
  );
}

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5 rounded-lg" aria-label="LifeKit home">
      <LogoMark />
      <span className="text-lg font-bold tracking-tight text-fg">
        Life<span className="text-accent-text">Kit</span>
      </span>
    </Link>
  );
}
