/** Resize, crop, rotate and target-size compression on a canvas. */
import { ImageError, type DecodedImage } from './image';

export interface CropRect { x: number; y: number; w: number; h: number }

function canvas(w: number, h: number) {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(w));
  c.height = Math.max(1, Math.round(h));
  const ctx = c.getContext('2d');
  if (!ctx) throw new ImageError('Your browser could not create a drawing canvas.');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  return { c, ctx };
}

export function toBlob(c: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => c.toBlob((b) => (b ? resolve(b) : reject(new ImageError('The image could not be encoded.'))), type, quality));
}

/**
 * Draw the image with optional rotation (0/90/180/270), flips and crop (crop is in rotated-image pixels),
 * scaled to outW × outH. `fit` controls what happens when the aspect ratio differs.
 */
export function renderImage(
  img: DecodedImage,
  o: { rotate?: number; flipH?: boolean; flipV?: boolean; crop?: CropRect; outW?: number; outH?: number; background?: string; fit?: 'stretch' | 'contain' | 'cover' },
): HTMLCanvasElement {
  const rot = (((o.rotate ?? 0) % 360) + 360) % 360;
  const rw = rot % 180 ? img.height : img.width;
  const rh = rot % 180 ? img.width : img.height;
  // 1) rotated + flipped full image
  const { c: full, ctx: f } = canvas(rw, rh);
  f.translate(rw / 2, rh / 2);
  f.rotate((rot * Math.PI) / 180);
  f.scale(o.flipH ? -1 : 1, o.flipV ? -1 : 1);
  f.drawImage(img.source, -img.width / 2, -img.height / 2);
  // 2) crop + scale
  const cr = o.crop ?? { x: 0, y: 0, w: rw, h: rh };
  const outW = o.outW ?? cr.w;
  const outH = o.outH ?? cr.h;
  const { c: out, ctx } = canvas(outW, outH);
  if (o.background) {
    ctx.fillStyle = o.background;
    ctx.fillRect(0, 0, out.width, out.height);
  }
  let dx = 0, dy = 0, dw = out.width, dh = out.height;
  let { x: sx, y: sy, w: sw, h: sh } = cr;
  if (o.fit === 'contain') {
    const s = Math.min(out.width / sw, out.height / sh);
    dw = sw * s; dh = sh * s; dx = (out.width - dw) / 2; dy = (out.height - dh) / 2;
  } else if (o.fit === 'cover') {
    const s = Math.max(out.width / sw, out.height / sh);
    const nw = out.width / s, nh = out.height / s;
    sx += (sw - nw) / 2; sy += (sh - nh) / 2; sw = nw; sh = nh;
  }
  ctx.drawImage(full, sx, sy, sw, sh, dx, dy, dw, dh);
  full.width = 0;
  full.height = 0;
  return out;
}

/**
 * Compress to at most `targetBytes` as JPEG: binary-search the quality, and if even low quality is too big,
 * shrink the dimensions step by step. Returns the best (largest still under target) result.
 */
export async function compressToTarget(
  img: DecodedImage,
  targetBytes: number,
  opts: { maxW?: number; maxH?: number; minQuality?: number } = {},
  onProgress?: (p: number) => void,
): Promise<{ blob: Blob; width: number; height: number; quality: number; reached: boolean }> {
  let w = img.width, h = img.height;
  const limitScale = Math.min(1, opts.maxW ? opts.maxW / w : 1, opts.maxH ? opts.maxH / h : 1);
  w = Math.max(1, Math.round(w * limitScale));
  h = Math.max(1, Math.round(h * limitScale));
  const minQ = opts.minQuality ?? 0.3;
  let best: { blob: Blob; width: number; height: number; quality: number } | null = null;
  let smallest: { blob: Blob; width: number; height: number; quality: number } | null = null;
  for (let attempt = 0; attempt < 14; attempt++) {
    const c = renderImage(img, { outW: w, outH: h, background: '#ffffff' });
    let lo = minQ, hi = 0.95;
    let found: Blob | null = null, foundQ = 0;
    for (let i = 0; i < 7; i++) {
      const q = (lo + hi) / 2;
      const b = await toBlob(c, 'image/jpeg', q);
      if (!smallest || b.size < smallest.blob.size) smallest = { blob: b, width: c.width, height: c.height, quality: q };
      if (b.size <= targetBytes) { found = b; foundQ = q; lo = q; } else hi = q;
    }
    // Try top quality too, in case it already fits.
    if (!found || foundQ > 0.85) {
      const b = await toBlob(c, 'image/jpeg', 0.95);
      if (b.size <= targetBytes) { found = b; foundQ = 0.95; }
    }
    c.width = 0;
    c.height = 0;
    onProgress?.(Math.min(0.95, (attempt + 1) / 8));
    if (found) {
      best = { blob: found, width: w, height: h, quality: foundQ };
      break;
    }
    w = Math.max(1, Math.round(w * 0.82));
    h = Math.max(1, Math.round(h * 0.82));
    if (w < 16 || h < 16) break;
  }
  onProgress?.(1);
  if (best) return { ...best, reached: true };
  return { ...smallest!, reached: false };
}
