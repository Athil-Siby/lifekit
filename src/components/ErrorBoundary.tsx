import { Component, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface State {
  error: Error | null;
}

/** Catches unexpected rendering errors (and failed lazy chunk loads) so one tool can't take down the page. */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (!this.state.error) return this.props.children;
    const chunkError = /dynamically imported module|Loading chunk|Failed to fetch/i.test(this.state.error.message);
    return (
      <div className="flex flex-col items-center rounded-2xl border border-line bg-surface-2 px-6 py-12 text-center" role="alert">
        <AlertTriangle className="h-8 w-8 text-warning" aria-hidden />
        <p className="mt-3 font-semibold text-fg">{chunkError ? 'This tool could not be loaded' : 'Something went wrong'}</p>
        <p className="mt-1 max-w-md text-sm text-fg-muted">
          {chunkError
            ? 'Check your internet connection, or the site may have just been updated. Reloading the page usually fixes this.'
            : 'An unexpected error occurred. Reloading the page should get things working again.'}
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-5 rounded-xl bg-accent px-4 py-2 text-sm font-medium text-accent-fg hover:bg-accent-hover"
        >
          Reload page
        </button>
      </div>
    );
  }
}
