import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import { ImagePlus, Pipette } from 'lucide-react';
import { parseColor, readableText, rgbToCmyk, rgbToHsl, shades, toHex, type RGB } from '../lib/color';
import { decodeImage, releaseImage } from '../lib/image';
import { checkFile, IMAGE_ACCEPT } from '../utils/files';
import { limits } from '../config/limits';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { CopyButton } from '../components/ui/CopyButton';
import { Input } from '../components/ui/Form';
import { useToast } from '../components/ui/Toast';
import { IMAGE_INPUT } from './imageShared';

declare global {
  interface Window { EyeDropper?: new () => { open: () => Promise<{ sRGBHex: string }> } }
}

export default function ColorPicker() {
  const toast = useToast();
  const [rgb, setRgb] = useState<RGB>({ r: 79, g: 70, b: 229 });
  const [input, setInput] = useState('#4F46E5');
  const [hasImage, setHasImage] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const hex = toHex(rgb);
  const hsl = rgbToHsl(rgb);
  const cmyk = rgbToCmyk(rgb);
  const palette = useMemo(() => shades(rgb), [rgb]);

  const pick = (c: RGB) => {
    setRgb(c);
    setInput(toHex(c));
    setRecent((r) => [toHex(c), ...r.filter((x) => x !== toHex(c))].slice(0, 12));
  };

  useEffect(() => {
    const c = parseColor(input);
    if (c) setRgb(c);
  }, [input]);

  const loadImage = async (f: File | undefined) => {
    if (!f) return;
    const chk = checkFile(f, { accept: IMAGE_ACCEPT, maxBytes: limits.imageMaxFileBytes, label: 'image' });
    if (!chk.ok) return toast.error(chk.error!);
    try {
      const img = await decodeImage(f);
      const canvas = canvasRef.current!;
      const scale = Math.min(1, 1600 / Math.max(img.width, img.height));
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d', { willReadFrequently: true })!.drawImage(img.source, 0, 0, canvas.width, canvas.height);
      releaseImage(img);
      setHasImage(true);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'This image could not be opened.');
    }
  };

  const sampleAt = (e: MouseEvent<HTMLCanvasElement>, commit: boolean) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(((e.clientX - rect.left) / rect.width) * canvas.width);
    const y = Math.floor(((e.clientY - rect.top) / rect.height) * canvas.height);
    const d = canvas.getContext('2d', { willReadFrequently: true })!.getImageData(Math.max(0, x), Math.max(0, y), 1, 1).data;
    const c = { r: d[0], g: d[1], b: d[2] };
    if (commit) pick(c);
    else setRgb(c);
  };

  const screenPick = async () => {
    try {
      const r = await new window.EyeDropper!().open();
      pick(parseColor(r.sRGBHex)!);
    } catch { /* cancelled */ }
  };

  const formats = [
    { label: 'HEX', value: hex },
    { label: 'RGB', value: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` },
    { label: 'HSL', value: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` },
    { label: 'CMYK', value: `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)` },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <Card className="space-y-4 p-4 sm:p-5">
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => fileRef.current?.click()} icon={<ImagePlus className="h-4 w-4" aria-hidden />}>{hasImage ? 'Choose another image' : 'Pick colours from an image'}</Button>
          {typeof window !== 'undefined' && window.EyeDropper && <Button variant="outline" onClick={screenPick} icon={<Pipette className="h-4 w-4" aria-hidden />}>Pick from screen</Button>}
          <input ref={fileRef} type="file" accept={IMAGE_INPUT} className="sr-only" onChange={(e) => { void loadImage(e.target.files?.[0]); e.target.value = ''; }} />
        </div>
        <div className={hasImage ? 'overflow-hidden rounded-xl ring-1 ring-line' : 'hidden'}>
          <canvas ref={canvasRef} className="block h-auto w-full cursor-crosshair" onMouseMove={(e) => sampleAt(e, false)} onClick={(e) => sampleAt(e, true)} aria-label="Click the image to pick a colour" />
        </div>
        {!hasImage && (
          <label className="flex flex-col items-center gap-4 rounded-xl bg-surface-2 p-6 text-center">
            <span className="text-sm text-fg-muted">Choose a colour below, type a code, or open an image and click anywhere on it.</span>
            <input type="color" value={hex} onChange={(e) => pick(parseColor(e.target.value)!)} className="h-28 w-28 cursor-pointer rounded-2xl border border-line bg-surface" aria-label="Colour picker" />
          </label>
        )}
        {recent.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-medium text-fg">Picked colours</p>
            <div className="flex flex-wrap gap-2">
              {recent.map((c) => <button key={c} type="button" onClick={() => setInput(c)} className="h-9 w-9 rounded-lg ring-1 ring-line" style={{ background: c }} aria-label={c} title={c} />)}
            </div>
          </div>
        )}
      </Card>
      <Card className="h-fit space-y-5 p-5 lg:sticky lg:top-24">
        <div className="flex h-28 items-center justify-center rounded-xl text-xl font-bold ring-1 ring-line" style={{ background: hex, color: readableText(rgb) }}>{hex}</div>
        <Input label="Colour code" value={input} onChange={(e) => setInput(e.target.value)} hint="Type HEX, rgb() or hsl()" error={input && !parseColor(input) ? 'Not a colour code I recognise.' : null} />
        <ul className="space-y-2">
          {formats.map((f) => (
            <li key={f.label} className="flex items-center gap-2 rounded-xl bg-surface-2 px-3 py-2">
              <span className="w-12 text-xs font-semibold text-fg-subtle">{f.label}</span>
              <code className="min-w-0 flex-1 truncate text-sm text-fg">{f.value}</code>
              <CopyButton text={f.value} size="icon" variant="ghost" label={`Copy ${f.label}`} />
            </li>
          ))}
        </ul>
        <div>
          <p className="mb-2 text-sm font-medium text-fg">Tints and shades</p>
          <div className="grid grid-cols-9 overflow-hidden rounded-xl ring-1 ring-line">
            {palette.map((c) => <button key={c} type="button" onClick={() => setInput(c)} className="h-10" style={{ background: c }} aria-label={c} title={c} />)}
          </div>
        </div>
      </Card>
    </div>
  );
}
