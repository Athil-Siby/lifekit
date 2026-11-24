import { useState } from 'react';
import { FileDown } from 'lucide-react';
import { validatePdf } from '../lib/pdfInput';
import { limits } from '../config/limits';
import { baseName } from '../utils/download';
import { formatBytes } from '../utils/format';
import { Checkbox, Input } from '../components/ui/Form';
import { ConvertShell } from './ConvertShell';
import { Chips } from './shared';

const SIZES = [100, 200, 300, 500, 1000, 2000];

export default function CompressPdfToKb() {
  const [kb, setKb] = useState('200');
  const [gray, setGray] = useState(false);
  const target = Math.round(Number(kb));
  return (
    <ConvertShell
      accept=".pdf,application/pdf"
      dropTitle="Drop a PDF to shrink to a set size"
      dropHint={`One PDF · up to ${formatBytes(limits.pdfMaxFileBytes)}`}
      icon={<FileDown className="h-7 w-7" aria-hidden />}
      validate={validatePdf}
      actionLabel={`Compress to ${target > 0 ? (target >= 1000 ? `${target / 1000} MB` : `${target} KB`) : '…'}`}
      workingLabel="Compressing"
      options={
        <div className="space-y-4">
          <div><p className="mb-2 text-sm font-medium text-fg">Target size</p><Chips label="Target size" options={SIZES} value={SIZES.includes(target) ? target : null} onChange={(v) => setKb(String(v))} format={(v) => (v >= 1000 ? `${v / 1000} MB` : `${v} KB`)} /></div>
          <Input label="Or type a size (KB)" inputMode="numeric" value={kb} onChange={(e) => setKb(e.target.value)} />
          <Checkbox checked={gray} onChange={setGray} label="Black & white" description="Makes scanned documents much smaller." />
        </div>
      }
      convert={async (file, onProgress) => {
        if (!(target >= 20)) throw new Error('Enter a target of at least 20 KB.');
        const { compressPdfToTarget } = await import('../lib/pdfTarget');
        const r = await compressPdfToTarget(file, target * 1000, { grayscale: gray }, (_l, p) => onProgress(p * 100, 100));
        return {
          blob: r.blob,
          name: `${baseName(file.name)}-${target}kb.pdf`,
          summary: `was ${formatBytes(file.size)}`,
          warning: r.reached ? (r.dpi ? 'Pages were turned into images to reach this size, so text can no longer be selected or searched.' : undefined) : `Couldn’t get under ${target} KB – this is the smallest possible version. Try a larger target or Black & white.`,
        };
      }}
      limitsNote={<>Perfect for forms that say “PDF must be under 200 KB”. To reach small sizes, pages are saved as images (text won’t be selectable). Files that are already small are only cleaned up.</>}
    />
  );
}
