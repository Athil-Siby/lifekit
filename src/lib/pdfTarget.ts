/** Shrink a PDF until it is at or below a target size, by re-rendering pages at lower resolution/quality. */
import { optimizePdf, rasterCompressPdf } from './pdf';

export async function compressPdfToTarget(
  file: File,
  targetBytes: number,
  opts: { grayscale: boolean },
  onStep?: (label: string, p: number) => void,
): Promise<{ blob: Blob; reached: boolean; dpi: number | null; quality: number | null }> {
  onStep?.('Checking the file', 0.02);
  const lossless = await optimizePdf(file, { stripMetadata: true });
  if (lossless.size <= targetBytes) return { blob: lossless, reached: true, dpi: null, quality: null };
  const dpis = [150, 120, 100, 85, 72, 60, 50];
  let smallest: { blob: Blob; dpi: number; quality: number } | null = null;
  for (let i = 0; i < dpis.length; i++) {
    const dpi = dpis[i];
    const tryQ = async (q: number) => {
      onStep?.(`Trying ${dpi} DPI at ${Math.round(q * 100)}% quality`, (i + 0.5) / dpis.length);
      const b = await rasterCompressPdf(file, { dpi, quality: q, grayscale: opts.grayscale });
      if (!smallest || b.size < smallest.blob.size) smallest = { blob: b, dpi, quality: q };
      return b;
    };
    const mid = await tryQ(0.7);
    if (mid.size <= targetBytes) {
      // Fits: see if better quality also fits.
      const hi = await tryQ(0.85);
      return hi.size <= targetBytes ? { blob: hi, reached: true, dpi, quality: 0.85 } : { blob: mid, reached: true, dpi, quality: 0.7 };
    }
    // Only try lower quality at this DPI if it's plausibly close.
    if (mid.size <= targetBytes * 1.8) {
      const lo = await tryQ(0.45);
      if (lo.size <= targetBytes) return { blob: lo, reached: true, dpi, quality: 0.45 };
    }
  }
  const s = smallest as { blob: Blob; dpi: number; quality: number } | null;
  return { blob: s?.blob ?? lossless, reached: false, dpi: s?.dpi ?? null, quality: s?.quality ?? null };
}
