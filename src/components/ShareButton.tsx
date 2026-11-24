import { useState } from 'react';
import { Check, Link2, Share2 } from 'lucide-react';
import { useCopy } from '../hooks/useCopy';

/** Native share sheet on phones; WhatsApp + copy link elsewhere. */
export function ShareButton({ title, text }: { title: string; text: string }) {
  const { copy, copied } = useCopy();
  const [open, setOpen] = useState(false);
  const url = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '';
  const share = async () => {
    if (navigator.share) {
      try { await navigator.share({ title, text, url }); } catch { /* cancelled */ }
    } else setOpen((o) => !o);
  };
  return (
    <div className="relative inline-block">
      <button type="button" onClick={share} className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-medium text-fg-muted hover:border-accent/50 hover:text-fg" aria-expanded={open}>
        <Share2 className="h-3.5 w-3.5" aria-hidden /> Share
      </button>
      {open && (
        <div className="absolute left-0 z-20 mt-2 w-52 rounded-xl border border-line bg-surface p-1.5 shadow-lg">
          <a href={`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-fg hover:bg-surface-2">💬 Share on WhatsApp</a>
          <button type="button" onClick={() => copy(url, 'Link copied')} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-fg hover:bg-surface-2">{copied ? <Check className="h-4 w-4 text-success" aria-hidden /> : <Link2 className="h-4 w-4" aria-hidden />} Copy link</button>
        </div>
      )}
    </div>
  );
}
