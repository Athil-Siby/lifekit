import { formatBytes } from './format';

export interface FileCheck {
  ok: boolean;
  error?: string;
}

/** Check a file's type (by MIME type or extension) and size. */
export function checkFile(
  file: File,
  opts: { accept: { mime: string[]; ext: string[] }; maxBytes: number; label: string },
): FileCheck {
  const ext = file.name.toLowerCase().match(/\.([a-z0-9]+)$/)?.[1] ?? '';
  const typeOk = opts.accept.mime.includes(file.type) || opts.accept.ext.includes(ext);
  if (!typeOk) return { ok: false, error: `“${file.name}” is not a supported ${opts.label} file.` };
  if (file.size === 0) return { ok: false, error: `“${file.name}” is empty.` };
  if (file.size > opts.maxBytes) {
    return { ok: false, error: `“${file.name}” is ${formatBytes(file.size)}. The limit is ${formatBytes(opts.maxBytes)}.` };
  }
  return { ok: true };
}

/** Check the PDF signature ("%PDF-") near the start of the file. */
export async function looksLikePdf(file: File): Promise<boolean> {
  const head = new Uint8Array(await file.slice(0, 1024).arrayBuffer());
  const text = String.fromCharCode(...head);
  return text.includes('%PDF-');
}

export const PDF_ACCEPT = { mime: ['application/pdf'], ext: ['pdf'] };
export const IMAGE_ACCEPT = {
  mime: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp', 'image/avif'],
  ext: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'avif'],
};
export const COMPRESSIBLE_IMAGE_ACCEPT = {
  mime: ['image/jpeg', 'image/png', 'image/webp'],
  ext: ['jpg', 'jpeg', 'png', 'webp'],
};
