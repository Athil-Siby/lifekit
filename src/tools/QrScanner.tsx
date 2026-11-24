import { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, ExternalLink, ImageUp } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { CopyButton } from '../components/ui/CopyButton';
import { Notice } from '../components/ui/Notice';
import { IMAGE_INPUT } from './imageShared';

type Decoder = (data: Uint8ClampedArray, w: number, h: number) => string | null;
async function getDecoder(): Promise<Decoder> {
  const { default: jsQR } = await import('jsqr');
  return (d, w, h) => jsQR(d, w, h, { inversionAttempts: 'attemptBoth' })?.data ?? null;
}

export default function QrScanner() {
  const [result, setResult] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const video = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const raf = useRef(0);
  const stop = () => { cancelAnimationFrame(raf.current); stream.current?.getTracks().forEach((t) => t.stop()); stream.current = null; setScanning(false); };
  useEffect(() => stop, []);

  const start = async () => {
    setError(null); setResult(null);
    try {
      const decode = await getDecoder();
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      stream.current = s; setScanning(true);
      const v = video.current!; v.srcObject = s; await v.play();
      const c = document.createElement('canvas'); const ctx = c.getContext('2d', { willReadFrequently: true })!;
      let frame = 0;
      const tick = () => {
        if (!stream.current) return;
        if (v.videoWidth && frame++ % 3 === 0) {
          const scale = Math.min(1, 640 / v.videoWidth);
          c.width = v.videoWidth * scale; c.height = v.videoHeight * scale;
          ctx.drawImage(v, 0, 0, c.width, c.height);
          const r = decode(ctx.getImageData(0, 0, c.width, c.height).data, c.width, c.height);
          if (r) { setResult(r); navigator.vibrate?.(60); stop(); return; }
        }
        raf.current = requestAnimationFrame(tick);
      };
      tick();
    } catch (e) {
      stop();
      setError((e as { name?: string }).name === 'NotAllowedError' ? 'Camera access was blocked. Allow the camera in your browser settings, or upload a screenshot instead.' : 'No camera could be started on this device. You can upload a picture of the QR code instead.');
    }
  };

  const fromFile = async (f?: File) => {
    if (!f) return;
    setError(null); setResult(null);
    try {
      const decode = await getDecoder();
      const img = await createImageBitmap(f);
      const scale = Math.min(1, 1600 / Math.max(img.width, img.height));
      const c = document.createElement('canvas'); c.width = img.width * scale; c.height = img.height * scale;
      const ctx = c.getContext('2d')!; ctx.drawImage(img, 0, 0, c.width, c.height); img.close();
      const r = decode(ctx.getImageData(0, 0, c.width, c.height).data, c.width, c.height);
      if (r) setResult(r); else setError('No QR code found in that image. Try a clearer or closer picture.');
    } catch { setError('That image couldn’t be read.'); }
  };

  const isUrl = result && /^https?:\/\//i.test(result);
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="space-y-4 p-5">
        <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-black">
          <video ref={video} playsInline muted className={scanning ? 'h-full w-full object-cover' : 'hidden'} />
          {scanning && <div className="pointer-events-none absolute inset-[18%] rounded-2xl border-4 border-white/80" aria-hidden />}
          {!scanning && <Camera className="h-14 w-14 text-white/40" aria-hidden />}
        </div>
        <div className="flex flex-wrap gap-2">
          {scanning ? <Button variant="outline" onClick={stop} icon={<CameraOff className="h-4 w-4" aria-hidden />}>Stop camera</Button> : <Button onClick={start} icon={<Camera className="h-4 w-4" aria-hidden />}>Scan with camera</Button>}
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-line px-4 py-2 text-sm font-medium text-fg hover:bg-surface-2"><ImageUp className="h-4 w-4" aria-hidden /> Upload screenshot<input type="file" accept={IMAGE_INPUT} className="sr-only" onChange={(e) => { void fromFile(e.target.files?.[0]); e.target.value = ''; }} /></label>
        </div>
        {error && <Notice tone="warning">{error}</Notice>}
      </Card>
      <Card className="h-fit space-y-4 p-5" aria-live="polite">
        <h2 className="text-sm font-semibold text-fg">Result</h2>
        {result ? (
          <>
            <p className="break-all rounded-xl bg-surface-2 p-4 text-lg text-fg">{result}</p>
            <div className="flex flex-wrap gap-2"><CopyButton text={result} variant="primary" />{isUrl && <a href={result} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center gap-1.5 rounded-xl border border-line px-3 py-1.5 text-sm font-medium text-fg hover:bg-surface-2"><ExternalLink className="h-4 w-4" aria-hidden /> Open link</a>}</div>
            {isUrl && <p className="text-xs text-fg-subtle">Check the address before opening: QR codes can lead to fake websites.</p>}
          </>
        ) : <p className="text-sm text-fg-subtle">Point your camera at a QR code, or upload a screenshot. Everything is scanned on your device.</p>}
      </Card>
    </div>
  );
}
