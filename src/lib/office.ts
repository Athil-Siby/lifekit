/**
 * Document conversions that run entirely in the browser.
 * Heavy libraries are imported on demand so they only load on these tool pages.
 */
import { openForRendering, renderPage, PdfError } from './pdf';
import { groupIntoParagraphs, type TextFrag } from './pdfLayout';
import { buildDocx, type DocBlock } from './docx';

type Progress = (done: number, total: number) => void;

interface PdfTextItem {
  str?: string;
  transform?: number[];
  width?: number;
}

/** PDF → editable Word document (text and headings; layout is simplified). */
export async function pdfToWord(file: File, onProgress?: Progress) {
  const handle = await openForRendering(file);
  try {
    const { doc } = handle;
    const blocks: DocBlock[] = [];
    let chars = 0;
    let emptyPages = 0;
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      const frags: TextFrag[] = (content.items as PdfTextItem[])
        .filter((it) => typeof it.str === 'string' && it.transform)
        .map((it) => {
          const [a, b, c, d, e, f] = it.transform!;
          return { str: it.str!, x: e, y: f, size: Math.hypot(c, d) || Math.hypot(a, b), width: it.width ?? 0 };
        });
      const paras = groupIntoParagraphs(frags);
      if (!paras.length) emptyPages++;
      if (i > 1) blocks.push({ type: 'pageBreak' });
      for (const p of paras) {
        chars += p.text.length;
        blocks.push({ type: 'p', text: p.text, bold: p.heading, size: p.heading ? Math.min(28, Math.round(p.size)) : 11 });
      }
      page.cleanup();
      onProgress?.(i, doc.numPages);
    }
    if (chars === 0) {
      throw new PdfError('This PDF has no selectable text. It is probably a scan (a photo of pages). Try the Image to Text tool on a screenshot of the page instead.');
    }
    return { blob: await buildDocx(blocks), pages: doc.numPages, emptyPages };
  } finally {
    await handle.destroy();
  }
}

/** PDF → PowerPoint: every page becomes a full-slide image. */
export async function pdfToPowerPoint(file: File, opts: { dpi: number }, onProgress?: Progress) {
  const [{ default: PptxGenJS }, handle] = await Promise.all([import('pptxgenjs'), openForRendering(file)]);
  try {
    const { doc } = handle;
    const first = (await doc.getPage(1)).getViewport({ scale: 1 });
    const W = first.width / 72;
    const H = first.height / 72;
    const pres = new PptxGenJS();
    pres.defineLayout({ name: 'PDF', width: W, height: H });
    pres.layout = 'PDF';
    pres.title = file.name.replace(/\.pdf$/i, '');
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const vp = page.getViewport({ scale: 1 });
      const canvas = await renderPage(doc, i, opts.dpi / 72);
      const data = canvas.toDataURL('image/jpeg', 0.88);
      canvas.width = 0;
      canvas.height = 0;
      // Fit pages with a different shape inside the slide, centred.
      const scale = Math.min(W / (vp.width / 72), H / (vp.height / 72));
      const w = (vp.width / 72) * scale;
      const h = (vp.height / 72) * scale;
      const slide = pres.addSlide();
      slide.background = { color: 'FFFFFF' };
      slide.addImage({ data, x: (W - w) / 2, y: (H - h) / 2, w, h });
      page.cleanup();
      onProgress?.(i, doc.numPages);
    }
    const blob = (await pres.write({ outputType: 'blob' })) as Blob;
    return { blob, pages: doc.numPages };
  } finally {
    await handle.destroy();
  }
}

type PdfNode = Record<string, unknown> | PdfNode[] | string;

/** Keep images inside the page width (pdfmake doesn't shrink them automatically). */
function fitImages(node: PdfNode, maxW: number): void {
  if (Array.isArray(node)) {
    node.forEach((n) => fitImages(n, maxW));
  } else if (node && typeof node === 'object') {
    if ('image' in node) {
      delete node.width;
      delete node.height;
      node.fit = [maxW, 700];
    }
    for (const k of ['stack', 'columns', 'ul', 'ol', 'text', 'table', 'body']) {
      if (k in node) fitImages(node[k] as PdfNode, maxW);
    }
    if (Array.isArray((node as { table?: { body?: PdfNode[] } }).table?.body)) {
      fitImages((node as { table: { body: PdfNode[] } }).table.body, maxW / 2);
    }
  }
}

/** Word (.docx) → PDF via HTML. Keeps headings, emphasis, lists, tables and images. */
export async function wordToPdf(file: File): Promise<{ blob: Blob; warnings: number }> {
  if (!/\.docx$/i.test(file.name)) {
    throw new PdfError('Only .docx files are supported. Open older .doc files in Word or Google Docs and save them as .docx first.');
  }
  const [mammothMod, pdfMakeMod, fontsMod, htmlToPdfmakeMod] = await Promise.all([
    import('mammoth/mammoth.browser'),
    import('pdfmake/build/pdfmake'),
    import('pdfmake/build/vfs_fonts'),
    import('html-to-pdfmake'),
  ]);
  const mammoth = (mammothMod as { default?: unknown }).default ?? mammothMod;
  const pdfMake = ((pdfMakeMod as { default?: unknown }).default ?? pdfMakeMod) as {
    vfs?: unknown;
    addVirtualFileSystem?: (v: unknown) => void;
    createPdf: (d: unknown) => { getBlob: (cb: (b: Blob) => void) => void };
  };
  const fonts = ((fontsMod as { default?: unknown }).default ?? fontsMod) as Record<string, unknown> & { pdfMake?: { vfs: unknown } };
  const vfs = fonts.pdfMake?.vfs ?? (fonts.vfs as unknown) ?? fonts;
  if (pdfMake.addVirtualFileSystem) pdfMake.addVirtualFileSystem(vfs);
  else pdfMake.vfs = vfs;
  const htmlToPdfmake = ((htmlToPdfmakeMod as { default?: unknown }).default ?? htmlToPdfmakeMod) as (
    html: string,
    opts: Record<string, unknown>,
  ) => PdfNode;

  let result: { value: string; messages: unknown[] };
  try {
    result = await (mammoth as { convertToHtml: (i: { arrayBuffer: ArrayBuffer }) => Promise<{ value: string; messages: unknown[] }> }).convertToHtml({
      arrayBuffer: await file.arrayBuffer(),
    });
  } catch {
    throw new PdfError(`“${file.name}” could not be read. Make sure it is a valid Word (.docx) document.`);
  }
  // pdfmake can only embed PNG and JPEG images.
  const html = result.value.replace(/<img[^>]+src="data:image\/(?!png|jpe?g)[^"]*"[^>]*>/gi, '');
  if (!html.replace(/<[^>]+>/g, '').trim() && !/<img/i.test(html)) {
    throw new PdfError('This document appears to be empty.');
  }
  const content = htmlToPdfmake(html, { window, tableAutoSize: true, removeExtraBlanks: true });
  fitImages(content, 483);
  const docDef = {
    pageSize: 'A4',
    pageMargins: [56, 56, 56, 56],
    content,
    defaultStyle: { fontSize: 11, lineHeight: 1.25 },
    styles: {
      'html-h1': { fontSize: 22, bold: true, marginBottom: 8 },
      'html-h2': { fontSize: 18, bold: true, marginBottom: 6 },
      'html-h3': { fontSize: 15, bold: true, marginBottom: 4 },
      'html-p': { marginBottom: 6 },
    },
    info: { title: file.name.replace(/\.docx$/i, ''), producer: 'LifeKit' },
  };
  const blob = await new Promise<Blob>((resolve, reject) => {
    try {
      pdfMake.createPdf(docDef).getBlob(resolve);
    } catch (e) {
      reject(e);
    }
  });
  return { blob, warnings: result.messages.length };
}
