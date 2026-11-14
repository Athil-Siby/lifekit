/**
 * Draw on existing PDF pages: page numbers, watermarks and signatures.
 * Positions are given in "visual" coordinates (as the page appears on screen, origin bottom-left),
 * then mapped to PDF coordinates so rotated pages come out right.
 */
import type { PDFDocument, PDFPage } from 'pdf-lib';
import { loadPdf } from './pdf';

export interface VisualPoint { x: number; y: number; rotate: number }

/** Size of the page as it is displayed (after /Rotate). */
export function visualSize(page: PDFPage): { width: number; height: number; rotation: number } {
  const { width, height } = page.getSize();
  const rotation = ((page.getRotation().angle % 360) + 360) % 360;
  return rotation === 90 || rotation === 270 ? { width: height, height: width, rotation } : { width, height, rotation };
}

/** Map a visual point (and an extra visual rotation, degrees CCW) to PDF space for drawText/drawImage. */
export function toPageSpace(W: number, H: number, rotation: number, vx: number, vy: number, extra = 0): VisualPoint {
  switch (rotation) {
    case 90: return { x: W - vy, y: vx, rotate: 90 + extra };
    case 180: return { x: W - vx, y: H - vy, rotate: 180 + extra };
    case 270: return { x: vy, y: H - vx, rotate: 270 + extra };
    default: return { x: vx, y: vy, rotate: extra };
  }
}

function toBlob(bytes: Uint8Array): Blob {
  return new Blob([bytes as Uint8Array<ArrayBuffer>], { type: 'application/pdf' });
}

function hexToRgb01(hex: string) {
  const h = hex.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255) as [number, number, number];
}

export type NumberPosition = 'bottom-center' | 'bottom-right' | 'bottom-left' | 'top-center' | 'top-right' | 'top-left';

export async function addPageNumbers(
  file: File,
  opts: { position: NumberPosition; format: 'n' | 'page-n' | 'n-of-total' | 'page-n-of-total'; start: number; size: number; margin: number; skipFirst: boolean },
): Promise<Blob> {
  const { StandardFonts, rgb, degrees } = await import('pdf-lib');
  const doc = await loadPdf(file);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const pages = doc.getPages();
  const numbered = opts.skipFirst ? pages.length - 1 : pages.length;
  pages.forEach((page, i) => {
    if (opts.skipFirst && i === 0) return;
    const n = opts.start + i - (opts.skipFirst ? 1 : 0);
    const total = opts.start + numbered - 1;
    const label =
      opts.format === 'n' ? `${n}` : opts.format === 'page-n' ? `Page ${n}` : opts.format === 'n-of-total' ? `${n} / ${total}` : `Page ${n} of ${total}`;
    const { width: W, height: H } = page.getSize();
    const v = visualSize(page);
    const tw = font.widthOfTextAtSize(label, opts.size);
    const [vert, horiz] = opts.position.split('-') as ['top' | 'bottom', 'left' | 'center' | 'right'];
    const vx = horiz === 'left' ? opts.margin : horiz === 'right' ? v.width - opts.margin - tw : (v.width - tw) / 2;
    const vy = vert === 'bottom' ? opts.margin : v.height - opts.margin - opts.size;
    const p = toPageSpace(W, H, v.rotation, vx, vy);
    page.drawText(label, { x: p.x, y: p.y, size: opts.size, font, color: rgb(0.2, 0.2, 0.2), rotate: degrees(p.rotate) });
  });
  return toBlob(await doc.save({ useObjectStreams: true }));
}

export async function watermarkPdf(
  file: File,
  opts: { text: string; size: number; opacity: number; color: string; angle: number; layout: 'center' | 'tile' },
): Promise<Blob> {
  const { StandardFonts, rgb, degrees } = await import('pdf-lib');
  const doc = await loadPdf(file);
  const font = await doc.embedFont(StandardFonts.HelveticaBold);
  const [r, g, b] = hexToRgb01(opts.color);
  const text = opts.text.replace(/[^\x20-\x7E -ÿ]/g, '?');
  const tw = font.widthOfTextAtSize(text, opts.size);
  const th = opts.size * 0.7;
  const a = (opts.angle * Math.PI) / 180;
  for (const page of doc.getPages()) {
    const { width: W, height: H } = page.getSize();
    const v = visualSize(page);
    const drawAt = (cx: number, cy: number) => {
      // Anchor so the text's centre sits at (cx, cy) after rotating by `angle`.
      const ax = cx - (Math.cos(a) * tw) / 2 + (Math.sin(a) * th) / 2;
      const ay = cy - (Math.sin(a) * tw) / 2 - (Math.cos(a) * th) / 2;
      const p = toPageSpace(W, H, v.rotation, ax, ay, opts.angle);
      page.drawText(text, { x: p.x, y: p.y, size: opts.size, font, color: rgb(r, g, b), opacity: opts.opacity, rotate: degrees(p.rotate) });
    };
    if (opts.layout === 'center') drawAt(v.width / 2, v.height / 2);
    else {
      const stepX = tw * Math.abs(Math.cos(a)) + opts.size * 3;
      const stepY = opts.size * 5;
      for (let y = stepY / 2, row = 0; y < v.height + stepY; y += stepY, row++) {
        for (let x = (row % 2) * (stepX / 2); x < v.width + stepX; x += stepX) drawAt(x, y);
      }
    }
  }
  return toBlob(await doc.save({ useObjectStreams: true }));
}

export interface Placement {
  page: number; // 0-based
  /** Position and size as fractions of the visual page (top-left origin, like the screen). */
  fx: number;
  fy: number;
  fw: number;
  fh: number;
  png: Uint8Array;
}

export async function stampImages(doc: PDFDocument, placements: Placement[]): Promise<Blob> {
  const { degrees } = await import('pdf-lib');
  const cache = new Map<Uint8Array, Awaited<ReturnType<PDFDocument['embedPng']>>>();
  const pages = doc.getPages();
  for (const pl of placements) {
    const page = pages[pl.page];
    if (!page) continue;
    let img = cache.get(pl.png);
    if (!img) {
      img = await doc.embedPng(pl.png);
      cache.set(pl.png, img);
    }
    const { width: W, height: H } = page.getSize();
    const v = visualSize(page);
    const w = pl.fw * v.width;
    const h = pl.fh * v.height;
    const vx = pl.fx * v.width;
    const vy = v.height - pl.fy * v.height - h; // bottom-left corner in visual space
    const p = toPageSpace(W, H, v.rotation, vx, vy);
    page.drawImage(img, { x: p.x, y: p.y, width: w, height: h, rotate: degrees(p.rotate) });
  }
  return toBlob(await doc.save({ useObjectStreams: true }));
}
