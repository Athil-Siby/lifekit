import { useEffect, useState } from 'react';
import { Archive } from 'lucide-react';
import { decodeImage, releaseImage, type DecodedImage } from '../lib/image';
import { downloadBlob } from '../utils/download';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { CopyButton } from '../components/ui/CopyButton';
import { Input, Range } from '../components/ui/Form';
import { Segmented } from '../components/ui/Segmented';
import { IMAGE_INPUT } from './imageShared';

const SIZES = [16, 32, 48, 180, 192, 512];
const SNIPPET = `<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">`;

/** Build an .ico file containing PNG images (supported by all modern browsers). */
function buildIco(pngs: Uint8Array[], sizes: number[]): Uint8Array {
  const head = 6 + 16 * pngs.length;
  const total = head + pngs.reduce((s, p) => s + p.length, 0);
  const out = new Uint8Array(total); const dv = new DataView(out.buffer);
  dv.setUint16(2, 1, true); dv.setUint16(4, pngs.length, true);
  let off = head;
  pngs.forEach((p, i) => {
    const e = 6 + i * 16;
    out[e] = sizes[i] >= 256 ? 0 : sizes[i]; out[e + 1] = sizes[i] >= 256 ? 0 : sizes[i];
    dv.setUint16(e + 4, 1, true); dv.setUint16(e + 6, 32, true); dv.setUint32(e + 8, p.length, true); dv.setUint32(e + 12, off, true);
    out.set(p, off); off += p.length;
  });
  return out;
}

export default function FaviconGenerator() {
  const [mode, setMode] = useState<'text' | 'image'>('text');
  const [text, setText] = useState('L');
  const [bg, setBg] = useState('#b7a3ff');
  const [fg, setFg] = useState('#170f2c');
  const [round, setRound] = useState(28);
  const [img, setImg] = useState<DecodedImage | null>(null);
  const [preview, setPreview] = useState('');
  useEffect(() => () => releaseImage(img), [img]);

  const draw = (s: number) => {
    const c = document.createElement('canvas'); c.width = c.height = s;
    const ctx = c.getContext('2d')!; const r = (round / 100) * s;
    ctx.beginPath(); ctx.roundRect(0, 0, s, s, r); ctx.clip();
    if (mode === 'image' && img) { const k = Math.max(s / img.width, s / img.height); ctx.drawImage(img.source, (s - img.width * k) / 2, (s - img.height * k) / 2, img.width * k, img.height * k); }
    else { ctx.fillStyle = bg; ctx.fillRect(0, 0, s, s); ctx.fillStyle = fg; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; const t = text.slice(0, 2) || ' '; ctx.font = `700 ${s * (Array.from(t).length > 1 ? 0.48 : 0.62)}px "Inter Variable", system-ui, sans-serif`; ctx.fillText(t, s / 2, s * 0.54); }
    return c;
  };
  useEffect(() => setPreview(draw(192).toDataURL()), [mode, text, bg, fg, round, img]); // eslint-disable-line react-hooks/exhaustive-deps

  const zip = async () => {
    const { zipSync, strToU8 } = await import('fflate');
    const png = async (s: number) => new Uint8Array(await (await new Promise<Blob>((r) => draw(s).toBlob((b) => r(b!), 'image/png'))).arrayBuffer());
    const p = Object.fromEntries(await Promise.all(SIZES.map(async (s) => [s, await png(s)] as const)));
    const files: Record<string, Uint8Array> = {
      'favicon.ico': buildIco([p[16], p[32], p[48]], [16, 32, 48]), 'favicon-16x16.png': p[16], 'favicon-32x32.png': p[32], 'apple-touch-icon.png': p[180],
      'android-chrome-192x192.png': p[192], 'android-chrome-512x512.png': p[512],
      'site.webmanifest': strToU8(JSON.stringify({ name: '', short_name: '', icons: [{ src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' }, { src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' }], theme_color: bg, background_color: '#ffffff', display: 'standalone' }, null, 2)),
      'README.txt': strToU8(`Put these files in the root of your website, then add this to <head>:\n\n${SNIPPET}\n`),
    };
    downloadBlob(new Blob([zipSync(files) as Uint8Array<ArrayBuffer>], { type: 'application/zip' }), 'favicons.zip');
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <Card className="min-w-0 space-y-5 p-5">
        <div className="flex flex-wrap items-end justify-center gap-4">{[16, 32, 64, 128].map((s) => <div key={s} className="text-center">{preview && <img src={preview} alt="" style={{ width: s, height: s }} className="mx-auto" />}<p className="mt-1 text-xs text-fg-subtle">{s}px</p></div>)}</div>
        <div><div className="mb-2 flex items-center justify-between"><span className="text-sm font-medium text-fg">HTML to add to your site</span><CopyButton text={SNIPPET} /></div><pre className="overflow-x-auto rounded-xl bg-surface-2 p-3 text-xs text-fg">{SNIPPET}</pre></div>
      </Card>
      <Card className="h-fit space-y-4 p-5">
        <Segmented label="Make it from" value={mode} onChange={setMode} options={[{ value: 'text', label: 'Letter / emoji' }, { value: 'image', label: 'Image' }]} className="w-full" />
        {mode === 'text' ? (<>
          <Input label="1–2 letters or an emoji" value={text} onChange={(e) => setText(e.target.value)} maxLength={4} />
          <div className="flex gap-4"><label className="flex items-center gap-2 text-sm text-fg">Background <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="h-9 w-12 rounded-lg border border-line" /></label><label className="flex items-center gap-2 text-sm text-fg">Text <input type="color" value={fg} onChange={(e) => setFg(e.target.value)} className="h-9 w-12 rounded-lg border border-line" /></label></div>
        </>) : (
          <label className="block cursor-pointer rounded-xl border-2 border-dashed border-line-strong p-4 text-center text-sm text-fg-muted">{img ? 'Choose a different image' : 'Choose a square logo image'}<input type="file" accept={IMAGE_INPUT} className="sr-only" onChange={async (e) => { const f = e.target.files?.[0]; if (f) setImg(await decodeImage(f)); e.target.value = ''; }} /></label>
        )}
        <Range label="Rounded corners" min={0} max={50} value={round} onChange={setRound} display={`${round}%`} />
        <Button size="lg" className="w-full" onClick={zip} disabled={mode === 'image' && !img} icon={<Archive className="h-5 w-5" aria-hidden />}>Download favicon pack</Button>
        <p className="text-xs text-fg-subtle">Includes favicon.ico, PNG icons for browsers, iPhone and Android, and a web manifest.</p>
      </Card>
    </div>
  );
}
