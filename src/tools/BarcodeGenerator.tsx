import { useEffect, useRef, useState } from 'react';
import { Download } from 'lucide-react';
import { downloadBlob, downloadText } from '../utils/download';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Checkbox, Input, Range, Select } from '../components/ui/Form';
import { Notice } from '../components/ui/Notice';

const FORMATS = [
  { id: 'CODE128', label: 'Code 128 (any text)', hint: 'Letters, numbers and symbols', sample: 'LIFEKIT-2026' },
  { id: 'EAN13', label: 'EAN-13 (products)', hint: '12 or 13 digits', sample: '590123412345' },
  { id: 'UPC', label: 'UPC-A (US products)', hint: '11 or 12 digits', sample: '01234567890' },
  { id: 'EAN8', label: 'EAN-8', hint: '7 or 8 digits', sample: '9638507' },
  { id: 'CODE39', label: 'Code 39', hint: 'Capital letters, numbers, - . $ / + % space', sample: 'ABC-123' },
  { id: 'ITF14', label: 'ITF-14 (cartons)', hint: '13 or 14 digits', sample: '1540014128876' },
];

export default function BarcodeGenerator() {
  const [format, setFormat] = useState('CODE128');
  const [value, setValue] = useState('LIFEKIT-2026');
  const [height, setHeight] = useState(90);
  const [width, setWidth] = useState(2);
  const [showText, setShowText] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { default: JsBarcode } = await import('jsbarcode');
      if (cancelled || !svgRef.current) return;
      try {
        let ok = true;
        JsBarcode(svgRef.current, value || ' ', { format, height, width, displayValue: showText, margin: 12, background: '#ffffff', lineColor: '#000000', font: 'monospace', valid: (v: boolean) => { ok = v; } });
        setError(ok && value ? null : `This value isn’t valid for ${FORMATS.find((f) => f.id === format)?.label}. ${FORMATS.find((f) => f.id === format)?.hint}.`);
      } catch {
        setError(`This value isn’t valid for ${FORMATS.find((f) => f.id === format)?.label}.`);
      }
    })();
    return () => { cancelled = true; };
  }, [format, value, height, width, showText]);

  const svgText = () => new XMLSerializer().serializeToString(svgRef.current!);
  const downloadPng = async () => {
    const svg = svgRef.current!;
    const w = parseFloat(svg.getAttribute('width') ?? '0'), h = parseFloat(svg.getAttribute('height') ?? '0');
    if (!w || !h) return;
    const img = new Image();
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgText());
    await img.decode();
    const c = document.createElement('canvas');
    c.width = w * 3; c.height = h * 3;
    const ctx = c.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, 0, 0, c.width, c.height);
    c.toBlob((b) => b && downloadBlob(b, `barcode-${value}.png`), 'image/png');
  };

  const f = FORMATS.find((x) => x.id === format)!;
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <Card className="flex min-w-0 flex-col items-center justify-center gap-5 p-6">
        <div className="w-full max-w-full overflow-x-auto rounded-xl bg-white p-2 text-center ring-1 ring-line"><svg ref={svgRef} className={`mx-auto h-auto max-w-full ${error ? 'opacity-30' : ''}`} /></div>
        {error && <Notice tone="warning">{error}</Notice>}
        <div className="flex flex-wrap justify-center gap-2">
          <Button onClick={downloadPng} disabled={!!error} icon={<Download className="h-4 w-4" aria-hidden />}>Download PNG</Button>
          <Button variant="outline" onClick={() => downloadText(svgText(), `barcode-${value}.svg`, 'image/svg+xml')} disabled={!!error} icon={<Download className="h-4 w-4" aria-hidden />}>Download SVG</Button>
        </div>
      </Card>
      <Card className="h-fit space-y-5 p-5">
        <Select label="Barcode type" value={format} onChange={(e) => { setFormat(e.target.value); setValue(FORMATS.find((x) => x.id === e.target.value)!.sample); }}>
          {FORMATS.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}
        </Select>
        <Input label="Value" value={value} onChange={(e) => setValue(e.target.value)} hint={f.hint} maxLength={80} />
        <Range label="Height" min={30} max={200} value={height} onChange={setHeight} />
        <Range label="Bar width" min={1} max={4} value={width} onChange={setWidth} />
        <Checkbox checked={showText} onChange={setShowText} label="Show the number under the barcode" />
        <p className="text-xs text-fg-subtle">For products sold in shops you need official numbers from GS1. These barcodes are great for inventory, labels and events.</p>
      </Card>
    </div>
  );
}
