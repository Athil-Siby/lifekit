/**
 * PDF processing in the browser. pdf-lib handles merging/splitting/re-saving;
 * pdf.js (loaded on demand) renders pages for thumbnails and image-based compression.
 * Both libraries are dynamically imported so they only load on PDF tool pages.
 */
import type { PDFDocument as PDFDocumentType } from 'pdf-lib';

export class PdfError extends Error {}

async function pdfLib() {
  return import('pdf-lib');
}

function friendlyLoadError(err: unknown, name: string): PdfError {
  const msg = err instanceof Error ? err.message : String(err);
  if (/encrypt/i.test(msg) || (err as { name?: string })?.name === 'EncryptedPDFError') {
    return new PdfError(`“${name}” is password-protected. Remove the password in a PDF reader, then try again.`);
  }
  return new PdfError(`“${name}” could not be read. It may be damaged or not a real PDF.`);
}

export async function loadPdf(file: File): Promise<PDFDocumentType> {
  const { PDFDocument } = await pdfLib();
  const bytes = await file.arrayBuffer();
  try {
    return await PDFDocument.load(bytes, { updateMetadata: false });
  } catch (err) {
    throw friendlyLoadError(err, file.name);
  }
}

export async function getPageCount(file: File): Promise<number> {
  return (await loadPdf(file)).getPageCount();
}

function toBlob(bytes: Uint8Array): Blob {
  return new Blob([bytes as Uint8Array<ArrayBuffer>], { type: 'application/pdf' });
}

export async function mergePdfs(files: File[], onProgress?: (done: number, total: number) => void): Promise<Blob> {
  const { PDFDocument } = await pdfLib();
  const out = await PDFDocument.create();
  for (let i = 0; i < files.length; i++) {
    const src = await loadPdf(files[i]);
    const pages = await out.copyPages(src, src.getPageIndices());
    pages.forEach((p) => out.addPage(p));
    onProgress?.(i + 1, files.length);
  }
  out.setProducer('LifeKit');
  out.setCreator('LifeKit PDF Merger');
  return toBlob(await out.save({ useObjectStreams: true }));
}

/** Create one PDF from the given 0-based page indices of a source document. */
export async function extractPages(src: PDFDocumentType, indices: number[]): Promise<Blob> {
  const { PDFDocument } = await pdfLib();
  const out = await PDFDocument.create();
  const pages = await out.copyPages(src, indices);
  pages.forEach((p) => out.addPage(p));
  out.setProducer('LifeKit');
  return toBlob(await out.save({ useObjectStreams: true }));
}

/** Lossless: re-save with object streams and without unused objects/metadata. */
export async function optimizePdf(file: File, opts: { stripMetadata: boolean }): Promise<Blob> {
  const { PDFDocument } = await pdfLib();
  const src = await loadPdf(file);
  // Copying pages into a fresh document drops unreferenced objects left behind by previous edits.
  const out = await PDFDocument.create();
  const pages = await out.copyPages(src, src.getPageIndices());
  pages.forEach((p) => out.addPage(p));
  if (!opts.stripMetadata) {
    const title = src.getTitle();
    const author = src.getAuthor();
    const subject = src.getSubject();
    if (title) out.setTitle(title);
    if (author) out.setAuthor(author);
    if (subject) out.setSubject(subject);
  }
  out.setProducer('LifeKit');
  return toBlob(await out.save({ useObjectStreams: true }));
}

// ---------- pdf.js (rendering) ----------

type PdfJs = typeof import('pdfjs-dist');
let pdfjsPromise: Promise<PdfJs> | null = null;

async function pdfjs(): Promise<PdfJs> {
  if (!pdfjsPromise) {
    pdfjsPromise = Promise.all([import('pdfjs-dist'), import('pdfjs-dist/build/pdf.worker.min.mjs?url')]).then(
      ([lib, worker]) => {
        lib.GlobalWorkerOptions.workerSrc = worker.default;
        return lib;
      },
    );
  }
  return pdfjsPromise;
}

export type RenderDoc = Awaited<ReturnType<PdfJs['getDocument']>['promise']>;

export interface RenderHandle {
  doc: RenderDoc;
  /** Releases the document and its worker resources. */
  destroy: () => Promise<void>;
}

export async function openForRendering(file: File): Promise<RenderHandle> {
  const lib = await pdfjs();
  const data = new Uint8Array(await file.arrayBuffer());
  const task = lib.getDocument({ data });
  try {
    const doc = await task.promise;
    return { doc, destroy: () => task.destroy() };
  } catch (err) {
    void task.destroy();
    throw friendlyLoadError(err, file.name);
  }
}

/** Render a page to a canvas at `scale` (1 = 72 DPI). */
export async function renderPage(doc: RenderDoc, pageNumber: number, scale: number): Promise<HTMLCanvasElement> {
  const page = await doc.getPage(pageNumber);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.floor(viewport.width));
  canvas.height = Math.max(1, Math.floor(viewport.height));
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new PdfError('Your browser could not create a drawing canvas.');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvas, canvasContext: ctx, viewport }).promise;
  page.cleanup();
  return canvas;
}

export async function renderThumbnail(doc: RenderDoc, pageNumber: number, width = 160): Promise<string> {
  const page = await doc.getPage(pageNumber);
  const base = page.getViewport({ scale: 1 });
  const canvas = await renderPage(doc, pageNumber, width / base.width);
  const url = canvas.toDataURL('image/jpeg', 0.7);
  canvas.width = 0;
  canvas.height = 0;
  return url;
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new PdfError('Could not encode page image.'))), type, quality);
  });
}

export interface RasterOptions {
  /** Rendering resolution in DPI. */
  dpi: number;
  /** JPEG quality 0–1. */
  quality: number;
  grayscale?: boolean;
}

/** Lossy: render each page to JPEG and rebuild the PDF with the original page sizes. */
export async function rasterCompressPdf(
  file: File,
  opts: RasterOptions,
  onProgress?: (done: number, total: number) => void,
  signal?: AbortSignal,
): Promise<Blob> {
  const { PDFDocument } = await pdfLib();
  const handle = await openForRendering(file);
  const doc = handle.doc;
  try {
    const out = await PDFDocument.create();
    for (let i = 1; i <= doc.numPages; i++) {
      if (signal?.aborted) throw new DOMException('Cancelled', 'AbortError');
      const page = await doc.getPage(i);
      const { width, height } = page.getViewport({ scale: 1 });
      const canvas = await renderPage(doc, i, opts.dpi / 72);
      if (opts.grayscale) {
        const ctx = canvas.getContext('2d')!;
        const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const d = img.data;
        for (let p = 0; p < d.length; p += 4) {
          const y = 0.299 * d[p] + 0.587 * d[p + 1] + 0.114 * d[p + 2];
          d[p] = d[p + 1] = d[p + 2] = y;
        }
        ctx.putImageData(img, 0, 0);
      }
      const jpg = await canvasToBlob(canvas, 'image/jpeg', opts.quality);
      canvas.width = 0;
      canvas.height = 0;
      const embedded = await out.embedJpg(await jpg.arrayBuffer());
      const p = out.addPage([width, height]);
      p.drawImage(embedded, { x: 0, y: 0, width, height });
      onProgress?.(i, doc.numPages);
    }
    out.setProducer('LifeKit');
    return toBlob(await out.save({ useObjectStreams: true }));
  } finally {
    await handle.destroy();
  }
}
