import { FileText } from 'lucide-react';
import { checkFile } from '../utils/files';
import { baseName } from '../utils/download';
import { formatBytes } from '../utils/format';
import { ConvertShell } from './ConvertShell';

const MAX = 50 * 1024 * 1024;

export default function WordToPdf() {
  return (
    <ConvertShell
      accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      dropTitle="Drop a Word document (.docx)"
      dropHint={`One .docx file · up to ${formatBytes(MAX)}`}
      icon={<FileText className="h-7 w-7" aria-hidden />}
      validate={async (f) => {
        if (/\.doc$/i.test(f.name)) return 'Old .doc files aren’t supported. Open it in Word or Google Docs and save as .docx first.';
        const c = checkFile(f, { accept: { mime: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'], ext: ['docx'] }, maxBytes: MAX, label: 'Word (.docx)' });
        return c.ok ? null : c.error!;
      }}
      actionLabel="Convert to PDF"
      workingLabel="Creating PDF"
      convert={async (file) => {
        const { wordToPdf } = await import('../lib/office');
        const r = await wordToPdf(file);
        return {
          blob: r.blob,
          name: `${baseName(file.name)}.pdf`,
          summary: 'PDF created',
          warning: r.warnings ? 'Some content (such as unusual images or shapes) couldn’t be included.' : undefined,
        };
      }}
      limitsNote={
        <>Keeps <strong>headings, bold and italic text, lists, tables and pictures</strong> on A4 pages. Your document’s exact fonts, page layout, headers, footers and text boxes aren’t copied, so check the result before sending something important. For a pixel-perfect copy, use “Save as PDF” in Word or Google Docs.</>
      }
    />
  );
}
