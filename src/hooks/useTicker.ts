import { useEffect, useState } from 'react';

/** Re-renders at the given interval while active (uses the device clock for accuracy). */
export function useTicker(active: boolean, ms = 100): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), ms);
    return () => window.clearInterval(id);
  }, [active, ms]);
  return now;
}

/** Temporarily replaces the page title; restores it on change/unmount. */
export function useDocumentTitle(title: string | null) {
  useEffect(() => {
    if (!title) return;
    const prev = document.title;
    document.title = title;
    return () => {
      document.title = prev;
    };
  }, [title]);
}
