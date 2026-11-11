import { useEffect, useState } from 'react';
import { Modal } from './ui/Modal';
import { SearchBar } from './SearchBar';
import { Kbd } from './ui/Misc';

/** Global quick-search dialog opened with Ctrl/⌘ + K or "/". */
export function useSearchPalette() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing = target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === '/' && !typing) {
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);
  return { open, setOpen };
}

export function SearchPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Search tools" hideHeader position="top" className="max-w-xl overflow-hidden">
      <SearchBar size="md" inline autoFocus onNavigate={onClose} placeholder="Search for a tool…" />
      <div className="flex items-center gap-3 border-t border-line px-4 py-2.5 text-xs text-fg-subtle">
        <span className="flex items-center gap-1"><Kbd>↑</Kbd><Kbd>↓</Kbd> to navigate</span>
        <span className="flex items-center gap-1"><Kbd>Enter</Kbd> to open</span>
        <span className="flex items-center gap-1"><Kbd>Esc</Kbd> to close</span>
      </div>
    </Modal>
  );
}
