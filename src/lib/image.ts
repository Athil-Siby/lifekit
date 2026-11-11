/** Image decoding and re-encoding with the Canvas API. Everything stays on the device. */
import { limits } from '../config/limits';

export type OutputFormat = 'image/jpeg' | 'image/png' | 'image/webp';

export const FORMAT_INFO: Record<OutputFormat, { label: string; ext: string; lossy: boolean; alpha: boolean }> = {
  'image/jpeg': { label: 'JPG', ext: 'jpg', lossy: true, alpha: false },
  'image/png': { label: 'PNG', ext: 'png', lossy: false, alpha: true },
  'image/webp': { label: 'WebP', ext: 'webp', lossy: true, alpha: true },
};

export class ImageError extends Error {}

export interface DecodedImage {
  source: ImageBitmap | HTMLImageElement;
  width: number;
  height: number;
}

async function decodeWithImgElement(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = 'async';
    img.src = url;
    await img.decode();
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function decodeImage(file: File): Promise<DecodedImage> {
  let source: ImageBitmap | HTMLImageElement;
  try {
    source =
      typeof createImageBitmap === 'function'
        ? await createImageBitmap(file, { imageOrientation: 'from-image' })
        : await decodeWithImgElement(file);
  } catch {
    try {
      source = await decodeWithImgElement(file);
    } catch {
      throw new ImageError(`“${file.name}” could not be opened. Your browser may not support this format, or the file is damaged.`);
    }
  }
  const width = 'naturalWidth' in source ? source.naturalWidth : source.width;
  const height = 'naturalHeight' in source ? source.naturalHeight : source.height;
  if (!width || !height) throw new ImageError(`“${file.name}” has no visible pixels.`);
  if (width * height > limits.imageMaxPixels) {
    throw new ImageError(
      `This image is ${width.toLocaleString()} × ${height.toLocaleString()} pixels, which is too large to process safely in the browser.`,
    );
  }
  return { source, width, height };
}

export function releaseImage(img: DecodedImage | null | undefined): void {
  if (img && 'close' in img.source) img.source.close();
}

export interface EncodeOptions {
  format: OutputFormat;
  /** 0–1. Ignored for PNG. */
  quality: number;
  /** Optional maximum width; the image is scaled down proportionally if wider. */
  maxWidth?: number;
  /** Background for formats without transparency. */
  background?: string;
}

export interface EncodeResult {
  blob: Blob;
  width: number;
  height: number;
  /** The browser could not encode the requested format and fell back to another. */
  actualFormat: string;
}

export async function encodeImage(img: DecodedImage, opts: EncodeOptions): Promise<EncodeResult> {
  let { width, height } = img;
  if (opts.maxWidth && opts.maxWidth > 0 && width > opts.maxWidth) {
    height = Math.max(1, Math.round((height * opts.maxWidth) / width));
    width = Math.round(opts.maxWidth);
  }
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new ImageError('Your browser could not create a drawing canvas.');
  if (!FORMAT_INFO[opts.format].alpha) {
    ctx.fillStyle = opts.background ?? '#ffffff';
    ctx.fillRect(0, 0, width, height);
  }
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img.source, 0, 0, width, height);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, opts.format, opts.quality));
  canvas.width = 0;
  canvas.height = 0;
  if (!blob) throw new ImageError('The image could not be encoded. Try a different format.');
  return { blob, width, height, actualFormat: blob.type };
}

export function outputFilename(original: string, format: OutputFormat, suffix = ''): string {
  const base = original.replace(/\.[^.]+$/, '') || 'image';
  return `${base}${suffix}.${FORMAT_INFO[format].ext}`;
}

export function formatFromMime(mime: string): OutputFormat {
  if (mime === 'image/png' || mime === 'image/webp' || mime === 'image/jpeg') return mime;
  return 'image/jpeg';
}
