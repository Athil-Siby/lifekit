import { useEffect, useRef } from 'react';
import { adsConfig, type AdPlacement } from '../config/ads';
import { useConsent } from '../hooks/useConsent';
import { cn } from '../lib/cn';

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

let scriptRequested = false;

function loadAdScript(client: string) {
  if (scriptRequested) return;
  scriptRequested = true;
  const s = document.createElement('script');
  s.async = true;
  s.crossOrigin = 'anonymous';
  s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(client)}`;
  document.head.appendChild(s);
}

/**
 * Responsive ad placement. Renders nothing unless advertising is enabled in
 * config, the placement has a slot ID, and the visitor consented to advertising.
 * Only place between content sections — never next to tool controls.
 */
export function AdSlot({ placement, className }: { placement: AdPlacement; className?: string }) {
  const { consent } = useConsent();
  const slot = adsConfig.slots[placement];
  const active = adsConfig.enabled && Boolean(slot) && consent.advertising;
  const pushed = useRef(false);

  useEffect(() => {
    if (!active || pushed.current) return;
    loadAdScript(adsConfig.client);
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      /* ad blockers or script failures must never break the page */
    }
  }, [active]);

  if (!active) return null;
  return (
    <aside aria-label="Advertisement" className={cn('my-10', className)}>
      <p className="mb-1 text-center text-[10px] uppercase tracking-widest text-fg-subtle">Advertisement</p>
      <ins
        className="adsbygoogle block min-h-[100px]"
        style={{ display: 'block' }}
        data-ad-client={adsConfig.client}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
}
