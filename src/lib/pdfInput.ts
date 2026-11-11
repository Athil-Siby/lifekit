import { limits } from '../config/limits';
import { checkFile, looksLikePdf, PDF_ACCEPT } from '../utils/files';

/** Validate a PDF by extension/MIME type, size and file signature. Returns an error message or null. */
export async function validatePdf(file: File): Promise<string | null> {
  const check = checkFile(file, { accept: PDF_ACCEPT, maxBytes: limits.pdfMaxFileBytes, label: 'PDF' });
  if (!check.ok) return check.error!;
  if (!(await looksLikePdf(file))) return `“${file.name}” doesn’t look like a valid PDF file.`;
  return null;
}
