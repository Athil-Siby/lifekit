/**
 * Post-build step:
 *  1. Writes dist/sitemap.xml and dist/robots.txt.
 *  2. Writes dist/<route>/index.html for every page with the correct <title>,
 *     meta description, canonical URL, Open Graph tags and JSON-LD, so search
 *     engines and link previews see page-specific metadata without running JS.
 *
 * Reads VITE_SITE_URL from the environment or .env files. Run after `vite build`.
 * Requires Node 22.18+ (imports TypeScript config files via type stripping).
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');

function readEnvFile(name) {
  const p = join(root, name);
  if (!existsSync(p)) return {};
  return Object.fromEntries(
    readFileSync(p, 'utf8')
      .split(/\r?\n/)
      .map((l) => l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/))
      .filter(Boolean)
      .map((m) => [m[1], m[2].replace(/^['"]|['"]$/g, '')]),
  );
}

const env = { ...readEnvFile('.env'), ...readEnvFile('.env.production'), ...process.env };
let siteUrl = (env.VITE_SITE_URL || '').replace(/\/+$/, '');
if (!siteUrl) {
  console.warn('\n⚠  VITE_SITE_URL is not set. Sitemap and canonical URLs will use relative paths / a placeholder.');
  console.warn('   Set VITE_SITE_URL=https://your-domain.com before building for production.\n');
}
const abs = (path) => `${siteUrl}${path}`;

const { tools, categories } = await import(join(root, 'src/config/tools.ts'));
const { staticPages } = await import(join(root, 'src/config/pages.ts'));

const today = new Date().toISOString().slice(0, 10);
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// ---------- Pages ----------
const pages = [
  ...staticPages.map((p) => ({ ...p, jsonLd: [] })),
  ...tools.map((t) => ({
    path: `/tools/${t.slug}`,
    title: `${t.name} – Free Online Tool | LifeKit`,
    description: t.metaDescription,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: t.name,
        description: t.metaDescription,
        url: abs(`/tools/${t.slug}`),
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Any (runs in a web browser)',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: t.faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
      },
    ],
    // Crawlable fallback content shown before JavaScript runs.
    body: `<h1>${esc(t.name)}</h1><p>${esc(t.intro)}</p><h2>How to use</h2><ol>${t.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol><h2>FAQ</h2>${t.faqs.map((f) => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`).join('')}`,
  })),
];

// ---------- sitemap.xml ----------
if (siteUrl) {
  const urls = pages.map((p) => {
    const priority = p.path === '/' ? '1.0' : p.path.startsWith('/tools/') ? '0.9' : p.path === '/tools' ? '0.8' : '0.4';
    return `  <url>\n    <loc>${esc(abs(p.path))}</loc>\n    <lastmod>${today}</lastmod>\n    <priority>${priority}</priority>\n  </url>`;
  });
  writeFileSync(
    join(dist, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`,
  );
} else {
  console.warn('   Skipping sitemap.xml (requires absolute URLs).');
}

// ---------- robots.txt ----------
writeFileSync(join(dist, 'robots.txt'), `User-agent: *\nAllow: /\n${siteUrl ? `\nSitemap: ${abs('/sitemap.xml')}\n` : ''}`);

// ---------- per-route HTML ----------
const template = readFileSync(join(dist, 'index.html'), 'utf8');

function render(page) {
  const url = siteUrl ? abs(page.path) : page.path;
  let html = template
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(page.title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(")/, `$1${esc(page.description)}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${esc(page.title)}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${esc(page.description)}$2`)
    .replace('</head>', `<link rel="canonical" href="${esc(url)}" />\n    <meta property="og:url" content="${esc(url)}" />\n  </head>`);
  if (siteUrl) html = html.replace(/(<meta property="og:image" content=")\/([^"]*")/, `$1${siteUrl}/$2`);
  const ld = page.jsonLd.map((o) => `<script type="application/ld+json" data-lk-jsonld>${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`).join('');
  html = html.replace('</head>', `${ld}</head>`);
  if (page.body) html = html.replace('<div id="root"></div>', `<div id="root"><div style="max-width:720px;margin:40px auto;padding:0 16px;font-family:system-ui,sans-serif">${page.body}</div></div>`);
  return html;
}

for (const page of pages) {
  const out = page.path === '/' ? join(dist, 'index.html') : join(dist, page.path.slice(1), 'index.html');
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, render(page));
}

console.log(`✓ Generated ${pages.length} page entries, robots.txt${siteUrl ? ' and sitemap.xml' : ''} (${categories.length} categories).`);
