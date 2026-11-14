import { useState } from 'react';
import { Presentation } from 'lucide-react';
import { validatePdf } from '../lib/pdfInput';
import { limits } from '../config/limits';
import { baseName } from '../utils/download';
import { formatBytes, pluralize } from '../utils/format';
import { Segmented } from '../components/ui/Segmented';
import { ConvertShell } from './ConvertShell';

export default function PdfToPowerPoint() {
  const [dpi, setDpi] = useState<'110' | '150' | '220'>('150');
  return (
    <ConvertShell
      accept=".pdf,application/pdf"
      dropTitle="Drop a PDF to turn into slides"
      dropHint={`One PDF · up to ${formatBytes(limits.pdfMaxFileBytes)}`}
      icon={<Presentation className="h-7 w-7" aria-hidden />}
      validate={validatePdf}
      actionLabel="Convert to PowerPoint"
      workingLabel="Creating slides"
      options={
        <Segmented
          label="Slide quality"
          value={dpi}
          onChange={setDpi}
          options={[
            { value: '110', label: 'Smaller' },
            { value: '150', label: 'Standard' },
            { value: '220', label: 'Sharp' },
          ]}
          className="w-full"
        />
      }
      convert={async (file, onProgress) => {
        const { pdfToPowerPoint } = await import('../lib/office');
        const r = await pdfToPowerPoint(file, { dpi: Number(dpi) }, onProgress);
        return { blob: r.blob, name: `${baseName(file.name)}.pptx`, summary: `${pluralize(r.pages, 'slide')}` };
      }}
      limitsNote={
        <>Each PDF page becomes one slide that <strong>looks exactly like the original</strong>. The slides are pictures, so the text can’t be edited directly. Add text boxes on top, or use PDF to Word to get editable text.</>
      }
    />
  );
}
