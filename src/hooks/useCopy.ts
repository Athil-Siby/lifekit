import { useCallback, useEffect, useRef, useState } from 'react';
import { useToast } from '../components/ui/Toast';

async function writeClipboard(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  // Fallback for older browsers / insecure contexts.
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.setAttribute('readonly', '');
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  const ok = document.execCommand('copy');
  ta.remove();
  if (!ok) throw new Error('Copy failed');
}

export function useCopy() {
  const toast = useToast();
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = useCallback(
    async (text: string, message = 'Copied to clipboard') => {
      if (!text) {
        toast.error('Nothing to copy yet.');
        return false;
      }
      try {
        await writeClipboard(text);
        setCopied(true);
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setCopied(false), 1800);
        toast.success(message);
        return true;
      } catch {
        toast.error('Your browser blocked clipboard access. Select the text and copy it manually.');
        return false;
      }
    },
    [toast],
  );
  return { copy, copied };
}
