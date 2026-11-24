/** Helpers for writing simple text PDFs with pdf-lib's built-in Helvetica (WinAnsi characters only). */
import type { PDFFont } from 'pdf-lib';

const MAP: Record<string, string> = { '₹': 'Rs.', '‘': "'", '’': "'", '“': '"', '”': '"', '–': '-', '—': '-', '…': '...', ' ': ' ', '•': '-', '→': '->', '✓': 'v' };

/** Replace characters Helvetica can't encode so pdf-lib never throws. */
export function winAnsi(s: string): string {
  return Array.from(s).map((c) => MAP[c] ?? (/[\x20-\x7E\xA0-\xFF€£©®™]/.test(c) ? c : c === '\n' ? '\n' : '?')).join('');
}

export function wrap(text: string, font: PDFFont, size: number, maxW: number): string[] {
  const out: string[] = [];
  for (const para of winAnsi(text).split('\n')) {
    let cur = '';
    for (const w of para.split(/\s+/)) {
      if (!w) continue;
      const t = cur ? cur + ' ' + w : w;
      if (font.widthOfTextAtSize(t, size) > maxW && cur) { out.push(cur); cur = w; } else cur = t;
    }
    out.push(cur);
  }
  return out;
}
