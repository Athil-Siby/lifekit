/**
 * Advertising configuration.
 *
 * Advertising is OFF unless BOTH of these are set at build time:
 *   VITE_ADS_ENABLED=true
 *   VITE_ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXX   (your real publisher ID)
 *
 * Each placement also needs its own ad unit (slot) ID. A placement without a
 * slot ID renders nothing. Ads are also never rendered until the visitor has
 * consented to advertising cookies (see ConsentProvider).
 *
 * Placement rule: ad slots are only placed between content sections, never
 * inside a tool's interface or next to upload/download/copy buttons.
 */
const client = (import.meta.env.VITE_ADSENSE_CLIENT ?? '').trim();

export type AdPlacement = 'home' | 'tool' | 'directory';

export const adsConfig = {
  enabled: import.meta.env.VITE_ADS_ENABLED === 'true' && /^ca-pub-\d{10,20}$/.test(client),
  client,
  slots: {
    home: import.meta.env.VITE_AD_SLOT_HOME ?? '',
    tool: import.meta.env.VITE_AD_SLOT_TOOL ?? '',
    directory: import.meta.env.VITE_AD_SLOT_DIRECTORY ?? '',
  } satisfies Record<AdPlacement, string>,
} as const;

/** A consent banner is only needed once something non-essential (ads/analytics) is switched on. */
export const consentRequired = adsConfig.enabled;
