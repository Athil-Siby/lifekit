import { useEffect } from 'react';
import { absoluteUrl, siteConfig } from '../config/site';

interface SeoOptions {
  title: string;
  description: string;
  path: string;
  /** JSON-LD objects to inject for this page. */
  jsonLd?: object[];
  noindex?: boolean;
}

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/** Keeps title, description, canonical, Open Graph and structured data in sync with the current route. */
export function useSeo({ title, description, path, jsonLd, noindex }: SeoOptions): void {
  const ld = JSON.stringify(jsonLd ?? []);
  useEffect(() => {
    const url = absoluteUrl(path);
    document.title = title;
    setMeta('name', 'description', description);
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', url);
    setMeta('property', 'og:site_name', siteConfig.name);
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'robots', noindex ? 'noindex, follow' : 'index, follow');

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = url;

    document.head.querySelectorAll('script[data-lk-jsonld]').forEach((s) => s.remove());
    for (const obj of JSON.parse(ld) as object[]) {
      const s = document.createElement('script');
      s.type = 'application/ld+json';
      s.dataset.lkJsonld = '';
      s.textContent = JSON.stringify(obj);
      document.head.appendChild(s);
    }
  }, [title, description, path, ld, noindex]);
}
