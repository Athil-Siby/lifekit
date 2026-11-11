import { Link } from 'react-router-dom';

export function LogoMark({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <defs>
        <linearGradient id="lk-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6d6ff5" />
          <stop offset="1" stopColor="#3f37c9" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="96" height="96" rx="24" fill="url(#lk-g)" />
      <path d="M30 24 V70 H70" fill="none" stroke="#fff" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="50" y="22" width="11" height="11" rx="3.5" fill="#fff" />
      <rect x="65" y="22" width="11" height="11" rx="3.5" fill="#c7d2fe" />
      <rect x="50" y="37" width="11" height="11" rx="3.5" fill="#c7d2fe" />
      <rect x="65" y="37" width="11" height="11" rx="3.5" fill="#fbbf24" />
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
