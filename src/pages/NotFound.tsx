import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { useSeo } from '../hooks/useSeo';
import { buttonClasses } from '../components/ui/Button';
import { SearchBar } from '../components/SearchBar';

export default function NotFound() {
  useSeo({ title: 'Page not found – LifeKit', description: 'The page you were looking for does not exist.', path: '/404', noindex: true });
  return (
    <div className="container-page flex flex-col items-center py-24 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-3 text-fg-subtle">
        <Compass className="h-7 w-7" aria-hidden />
      </span>
      <h1 className="mt-6 text-3xl font-semibold tracking-tight text-fg">Page not found</h1>
      <p className="mt-2 max-w-md text-fg-muted">The page may have moved or the link might be mistyped. Try searching for the tool you need.</p>
      <div className="mt-8 w-full max-w-lg">
        <SearchBar size="md" />
      </div>
      <Link to="/" className={buttonClasses('outline', 'md', 'mt-6')}>Back to home</Link>
    </div>
  );
}
