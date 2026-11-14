import { useState } from 'react';
import { ListOrdered } from 'lucide-react';
import { validatePdf } from '../lib/pdfInput';
import { limits } from '../config/limits';
import { baseName } from '../utils/download';
import { formatBytes } from '../utils/format';
import { Checkbox, Input, Select } from '../components/ui/Form';
import { ConvertShell } from './ConvertShell';
import type { NumberPosition } from '../lib/pdfStamp';

export default function PdfPageNumbers() {
  const [position, setPosition] = useState<NumberPosition>('bottom-center');
  const [format, setFormat] = useState<'n' | 'page-n' | 'n-of-total' | 'page-n-of-total'>('n');
  const [start, setStart] = useState('1');
  const [size, setSize] = useState('11');
  const [skipFirst, setSkipFirst] = useState(false);
  return (
    <ConvertShell
      accept=".pdf,application/pdf"
      dropTitle="Drop a PDF to number its pages"
      dropHint={`One PDF · up to ${formatBytes(limits.pdfMaxFileBytes)}`}
      icon={<ListOrdered className="h-7 w-7" aria-hidden />}
      validate={validatePdf}
      actionLabel="Add page numbers"
      workingLabel="Adding numbers"
      options={
        <div className="space-y-4">
          <Select label="Position" value={position} onChange={(e) => setPosition(e.target.value as NumberPosition)}>
            <option value="bottom-center">Bottom centre</option>
            <option value="bottom-right">Bottom right</option>
            <option value="bottom-left">Bottom left</option>
            <option value="top-center">Top centre</option>
            <option value="top-right">Top right</option>
            <option value="top-left">Top left</option>
          </Select>
          <Select label="Style" value={format} onChange={(e) => setFormat(e.target.value as typeof format)}>
            <option value="n">1</option>
            <option value="page-n">Page 1</option>
            <option value="n-of-total">1 / 10</option>
            <option value="page-n-of-total">Page 1 of 10</option>
          </Select>
          <div className="grid grid-cols-2 gap-2">
            <Input label="Start at" inputMode="numeric" value={start} onChange={(e) => setStart(e.target.value)} />
            <Input label="Text size" inputMode="numeric" value={size} onChange={(e) => setSize(e.target.value)} />
          </div>
          <Checkbox checked={skipFirst} onChange={setSkipFirst} label="Don’t number the first page" description="Useful for a cover page." />
        </div>
      }
      convert={async (file) => {
        const { addPageNumbers } = await import('../lib/pdfStamp');
        const blob = await addPageNumbers(file, {
          position, format, skipFirst,
          start: Math.max(0, Math.round(Number(start)) || 1),
          size: Math.min(36, Math.max(6, Number(size) || 11)),
          margin: 24,
        });
        return { blob, name: `${baseName(file.name)}-numbered.pdf`, summary: 'Page numbers added' };
      }}
      limitsNote={<>Numbers are added on top of each page in a clean, standard font. Everything else in the PDF stays exactly the same.</>}
    />
  );
}
