import { FileType } from 'lucide-react';
import { validatePdf } from '../lib/pdfInput';
import { limits } from '../config/limits';
import { baseName } from '../utils/download';
import { formatBytes, pluralize } from '../utils/format';
import { ConvertShell } from './ConvertShell';

export default function PdfToWord() {
  return (
    <ConvertShell
      accept=".pdf,application/pdf"
      dropTitle="Drop a PDF to convert to Word"
      dropHint={`One PDF · up to ${formatBytes(limits.pdfMaxFileBytes)}`}
      icon={<FileType className="h-7 w-7" aria-hidden />}
      validate={validatePdf}
      actionLabel="Convert to Word"
      workingLabel="Reading text"
      convert={async (file, onProgress) => {
        const { pdfToWord } = await import('../lib/office');
        const r = await pdfToWord(file, onProgress);
        return {
          blob: r.blob,
          name: `${baseName(file.name)}.docx`,
          summary: `${pluralize(r.pages, 'page')} converted`,
          warning: r.emptyPages ? `${pluralize(r.emptyPages, 'page')} had no selectable text (probably images or scans) and came out blank.` : undefined,
        };
      }}
      limitsNote={
        <>The Word file contains the PDF’s <strong>text, paragraphs and headings</strong>, ready to edit. Images, columns, tables and exact fonts are not kept. Scanned PDFs have no text to extract.</>
      }
    />
  );
}
