/**
 * A tiny, safe Markdown subset used for guide articles. It produces a plain
 * data structure (no HTML strings), so content can never inject markup.
 *
 * Supported:
 *   ## Heading 2        ### Heading 3
 *   - bullet item       1. numbered item
 *   > Tip or note (callout)
 *   Blank lines separate paragraphs.
 *   Inline: **bold**, `code`, [link text](/tools/pdf-merger or https://…)
 *
 * Kept free of imports so the build script can also read it with Node.
 */
export type Inline =
  | { type: 'text'; text: string }
  | { type: 'bold'; text: string }
  | { type: 'code'; text: string }
  | { type: 'link'; text: string; href: string };

export type Block =
  | { type: 'h2'; text: Inline[]; id: string }
  | { type: 'h3'; text: Inline[] }
  | { type: 'p'; text: Inline[] }
  | { type: 'ul'; items: Inline[][] }
  | { type: 'ol'; items: Inline[][] }
  | { type: 'tip'; text: Inline[] };

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

const INLINE = /\*\*(.+?)\*\*|`([^`]+)`|\[([^\]]+)\]\(([^)\s]+)\)/g;

export function parseInline(text: string): Inline[] {
  const out: Inline[] = [];
  let last = 0;
  for (const m of text.matchAll(INLINE)) {
    const i = m.index ?? 0;
    if (i > last) out.push({ type: 'text', text: text.slice(last, i) });
    if (m[1] !== undefined) out.push({ type: 'bold', text: m[1] });
    else if (m[2] !== undefined) out.push({ type: 'code', text: m[2] });
    else {
      const href = m[4];
      // Only allow site-relative links and http(s) URLs.
      if (/^(\/|https?:\/\/)/.test(href)) out.push({ type: 'link', text: m[3], href });
      else out.push({ type: 'text', text: m[3] });
    }
    last = i + m[0].length;
  }
  if (last < text.length) out.push({ type: 'text', text: text.slice(last) });
  return out;
}

export function parseMarkdown(src: string): Block[] {
  const blocks: Block[] = [];
  const lines = src.replace(/\r\n/g, '\n').split('\n');
  let para: string[] = [];
  let list: { type: 'ul' | 'ol'; items: string[] } | null = null;

  const flushPara = () => {
    if (para.length) blocks.push({ type: 'p', text: parseInline(para.join(' ')) });
    para = [];
  };
  const flushList = () => {
    if (list) blocks.push({ type: list.type, items: list.items.map(parseInline) });
    list = null;
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flushPara();
      flushList();
      continue;
    }
    let m: RegExpMatchArray | null;
    if ((m = line.match(/^##\s+(.+)$/)) && !line.startsWith('###')) {
      flushPara();
      flushList();
      blocks.push({ type: 'h2', text: parseInline(m[1]), id: slugify(m[1]) });
    } else if ((m = line.match(/^###\s+(.+)$/))) {
      flushPara();
      flushList();
      blocks.push({ type: 'h3', text: parseInline(m[1]) });
    } else if ((m = line.match(/^>\s?(.*)$/))) {
      flushPara();
      flushList();
      blocks.push({ type: 'tip', text: parseInline(m[1]) });
    } else if ((m = line.match(/^[-*]\s+(.+)$/))) {
      flushPara();
      if (!list || list.type !== 'ul') {
        flushList();
        list = { type: 'ul', items: [] };
      }
      list.items.push(m[1]);
    } else if ((m = line.match(/^\d+[.)]\s+(.+)$/))) {
      flushPara();
      if (!list || list.type !== 'ol') {
        flushList();
        list = { type: 'ol', items: [] };
      }
      list.items.push(m[1]);
    } else {
      flushList();
      para.push(line);
    }
  }
  flushPara();
  flushList();
  return blocks;
}

export function inlineToPlain(inl: Inline[]): string {
  return inl.map((x) => x.text).join('');
}

export function countWords(src: string): number {
  return src.replace(/[#>*`\-[\]()]/g, ' ').split(/\s+/).filter(Boolean).length;
}
