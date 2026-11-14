import { useState } from 'react';
import { Stamp } from 'lucide-react';
import { validatePdf } from '../lib/pdfInput';
import { limits } from '../config/limits';
import { baseName } from '../utils/download';
import { formatBytes } from '../utils/format';
import { Input, Range } from '../components/ui/Form';
import { Segmented } from '../components/ui/Segmented';
import { ConvertShell } from './ConvertShell';

export default function WatermarkPdf() {
  const [text, setText] = useState('CONFIDENTIAL');
  const [size, setSize] = useState(60);
  const [opacity, setOpacity] = useState(20);
  const [color, setColor] = useState('#dc2626');
  const [angle, setAngle] = useState<'45' | '0'>('45');
  const [layout, setLayout] = useState<'center' | 'tile'>('center');
  const preview = (
    <div className="relative flex aspect-[3/4] w-28 items-center justify-center overflow-hidden rounded-md bg-white shadow ring-1 ring-line" aria-hidden>
      <span className="whitespace-nowrap font-bold" style={{ color, opacity: opacity / 100, transform: `rotate(-${angle}deg)`, fontSize: Math.max(6, size / 6) }}>{text || ' '}</span>
    </div>
  );
  return (
    <ConvertShell
      accept=".pdf,application/pdf"
      dropTitle="Drop a PDF to watermark"
      dropHint={`One PDF · up to ${formatBytes(limits.pdfMaxFileBytes)}`}
      icon={<Stamp className="h-7 w-7" aria-hidden />}
      validate={validatePdf}
      actionLabel="Add watermark"
      workingLabel="Adding watermark"
      options={
        <div className="space-y-4">
          <div className="flex justify-center">{preview}</div>
          <Input label="Watermark text" value={text} onChange={(e) => setText(e.target.value)} maxLength={60} placeholder="e.g. DRAFT, COPY, your name" />
          <Range label="Size" min={16} max={140} value={size} onChange={setSize} />
          <Range label="Transparency" min={5} max={80} value={opacity} onChange={setOpacity} display={`${opacity}%`} />
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-fg" htmlFor="wm-color">Colour</label>
            <input id="wm-color" type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-9 w-14 cursor-pointer rounded-lg border border-line bg-surface" />
          </div>
          <Segmented label="Angle" value={angle} onChange={setAngle} options={[{ value: '45', label: 'Diagonal' }, { value: '0', label: 'Straight' }]} className="w-full" />
          <Segmented label="Layout" value={layout} onChange={setLayout} options={[{ value: 'center', label: 'Once, centred' }, { value: 'tile', label: 'Repeated' }]} className="w-full" />
        </div>
      }
      convert={async (file) => {
        if (!text.trim()) throw new Error('Type the watermark text first.');
        const { watermarkPdf } = await import('../lib/pdfStamp');
        const blob = await watermarkPdf(file, { text: text.trim(), size, opacity: opacity / 100, color, angle: Number(angle), layout });
        return { blob, name: `${baseName(file.name)}-watermarked.pdf`, summary: 'Watermark added to every page' };
      }}
      limitsNote={<>The watermark is drawn on top of every page. Use plain letters and numbers: special symbols and non-Latin scripts aren’t supported by the built-in font.</>}
    />
  );
}
