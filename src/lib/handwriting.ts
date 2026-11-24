/** Render text as handwriting on ruled paper pages (canvas). Fonts are self-hosted OFL/Apache fonts. */
import caveat from '@fontsource/caveat/files/caveat-latin-400-normal.woff2?url';
import kalamLatin from '@fontsource/kalam/files/kalam-latin-400-normal.woff2?url';
import kalamDeva from '@fontsource/kalam/files/kalam-devanagari-400-normal.woff2?url';
import homemade from '@fontsource/homemade-apple/files/homemade-apple-latin-400-normal.woff2?url';
import indie from '@fontsource/indie-flower/files/indie-flower-latin-400-normal.woff2?url';

export const HAND_FONTS = [
  { id: 'Kalam', label: 'Kalam (neat, also Hindi)', files: [[kalamLatin, 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+2000-206F,U+20AC,U+2122'], [kalamDeva, 'U+0900-097F,U+1CD0-1CF9,U+200C-200D,U+20A8,U+20B9,U+25CC,U+A830-A839,U+A8E0-A8FF']] },
  { id: 'Caveat', label: 'Caveat (casual)', files: [[caveat, '']] },
  { id: 'Indie Flower', label: 'Indie Flower (round)', files: [[indie, '']] },
  { id: 'Homemade Apple', label: 'Homemade Apple (cursive)', files: [[homemade, '']] },
] as const;

const loaded = new Set<string>();
export async function loadHandFont(id: string) {
  if (loaded.has(id)) return;
  const f = HAND_FONTS.find((x) => x.id === id)!;
  await Promise.all(f.files.map(async ([url, range]) => {
    const face = new FontFace(`LK ${id}`, `url(${url})`, range ? { unicodeRange: range } : {});
    await face.load();
    document.fonts.add(face);
  }));
  loaded.add(id);
}

export interface PaperOpts {
  font: string; size: number; ink: string; paper: 'ruled' | 'plain' | 'grid'; margin: boolean; jitter: number;
}

const W = 1240, H = 1754; // A4 at 150 DPI

/** Word-wrap with the canvas font, then draw lines with slight random wobble so it looks hand-written. */
export function renderPages(text: string, o: PaperOpts): HTMLCanvasElement[] {
  const lineH = Math.round(o.size * 1.55);
  const top = 150, left = o.margin ? 190 : 90, right = W - 80;
  const linesPerPage = Math.floor((H - top - 90) / lineH);
  const measure = document.createElement('canvas').getContext('2d')!;
  measure.font = `${o.size}px "LK ${o.font}"`;
  const lines: string[] = [];
  for (const para of text.replace(/\r/g, '').split('\n')) {
    if (!para.trim()) { lines.push(''); continue; }
    let cur = '';
    for (const word of para.split(/\s+/)) {
      const test = cur ? cur + ' ' + word : word;
      if (measure.measureText(test).width > right - left && cur) { lines.push(cur); cur = word; } else cur = test;
    }
    lines.push(cur);
  }
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) - 0.5;
  const pages: HTMLCanvasElement[] = [];
  for (let p = 0; p * linesPerPage < Math.max(1, lines.length); p++) {
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#fdfdf8'; ctx.fillRect(0, 0, W, H);
    if (o.paper === 'ruled') {
      ctx.strokeStyle = '#b9d0ea'; ctx.lineWidth = 2;
      for (let y = top + lineH * 0.3; y < H - 40; y += lineH) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    } else if (o.paper === 'grid') {
      ctx.strokeStyle = '#dbe6f2'; ctx.lineWidth = 1.5;
      for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    }
    if (o.margin) { ctx.strokeStyle = '#e8a0a0'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(left - 30, 0); ctx.lineTo(left - 30, H); ctx.stroke(); }
    ctx.fillStyle = o.ink;
    ctx.textBaseline = 'alphabetic';
    lines.slice(p * linesPerPage, (p + 1) * linesPerPage).forEach((ln, i) => {
      const y = top + i * lineH + rnd() * o.jitter * 3;
      let x = left + rnd() * o.jitter * 6;
      for (const word of ln.split(' ')) {
        ctx.save();
        const size = o.size * (1 + rnd() * o.jitter * 0.06);
        ctx.font = `${size}px "LK ${o.font}"`;
        ctx.translate(x, y + rnd() * o.jitter * 2);
        ctx.rotate(rnd() * o.jitter * 0.012);
        ctx.fillText(word, 0, 0);
        const advance = ctx.measureText(word + ' ').width; // measure with this word's font, before restore()
        ctx.restore();
        x += advance + rnd() * o.jitter * 2;
      }
    });
    pages.push(c);
  }
  return pages;
}
