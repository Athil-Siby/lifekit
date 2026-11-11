import { Link } from 'react-router-dom';
import { categories, tools } from '../../config/tools';
import { useConsent } from '../../hooks/useConsent';
import { LogoMark } from '../Logo';

export function Footer() {
  const { required, openSettings } = useConsent();
  const year = new Date().getFullYear();
  return (
    <footer className="mt-24 border-t border-line bg-surface-2">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <LogoMark />
            <span className="text-lg font-bold tracking-tight text-fg">LifeKit</span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-fg-muted">
            Free everyday tools that run in your browser. No account, no clutter, and your files stay on your device.
          </p>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-fg">Popular tools</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {tools.filter((t) => t.badge === 'popular').slice(0, 6).map((t) => (
              <li key={t.slug}>
                <Link to={`/tools/${t.slug}`} className="text-fg-muted hover:text-fg">{t.name}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-fg">Categories</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {categories.map((c) => (
              <li key={c.id}>
                <Link to={`/tools?category=${c.id}`} className="text-fg-muted hover:text-fg">{c.name}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-fg">LifeKit</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link to="/guides" className="text-fg-muted hover:text-fg">Guides</Link></li>
            <li><Link to="/about" className="text-fg-muted hover:text-fg">About</Link></li>
            <li><Link to="/contact" className="text-fg-muted hover:text-fg">Contact</Link></li>
            <li><Link to="/privacy" className="text-fg-muted hover:text-fg">Privacy Policy</Link></li>
            <li><Link to="/terms" className="text-fg-muted hover:text-fg">Terms of Service</Link></li>
            <li><Link to="/cookies" className="text-fg-muted hover:text-fg">Cookie Policy</Link></li>
            {required && (
              <li>
                <button type="button" onClick={openSettings} className="text-fg-muted hover:text-fg">Cookie settings</button>
              </li>
            )}
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="container-page flex flex-col gap-2 py-6 text-xs text-fg-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} LifeKit. All rights reserved.</p>
          <p>Tools are provided as-is. Always keep a copy of important files.</p>
        </div>
      </div>
    </footer>
  );
}
