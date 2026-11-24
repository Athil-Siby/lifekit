/**
 * Site-wide configuration. Values that differ between deployments come from
 * environment variables (see README → "Environment variables").
 */
export const siteConfig = {
  name: 'LifeKit',
  tagline: 'Everyday tools, beautifully simple.',
  description:
    '90 free, fast and private everyday tools: PDF, image, student, money and time tools that run in your browser.',
  /** Public URL without trailing slash, e.g. https://www.example.com. Used for canonical and Open Graph URLs. */
  url: (import.meta.env.VITE_SITE_URL ?? '').replace(/\/+$/, ''),
  /** Optional public contact address shown on the contact page. Leave unset to hide it. */
  contactEmail: import.meta.env.VITE_CONTACT_EMAIL || 'athilsiby@gmail.com',
  /** Optional form endpoint (Formspree-compatible: accepts JSON POST). Leave unset to disable sending. */
  contactEndpoint: import.meta.env.VITE_CONTACT_ENDPOINT ?? '',
  /** Optional Instagram profile URL shown in the footer, e.g. https://instagram.com/yourname. */
  instagram: import.meta.env.VITE_INSTAGRAM_URL ?? '',
} as const;

/** Absolute URL for a path, falling back to the current origin when VITE_SITE_URL is not set. */
export function absoluteUrl(path: string): string {
  const base = siteConfig.url || (typeof window !== 'undefined' ? window.location.origin : '');
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}
