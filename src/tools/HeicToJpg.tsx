import { useState } from 'react';
import { Archive, Download, Smartphone, X } from 'lucide-react';
import { downloadBlob } from '../utils/download';
import { formatBytes } from '../utils/format';
import { Card } from '../components/ui/Card';
import { Dropzone } from '../components/ui/Dropzone';
import { Button } from '../components/ui/Button';
import { Range } from '../components/ui/Form';
import { Segmented } from '../components/ui/Segmented';
import { Progress } from '../components/ui/Misc';
import { useToast } from '../components/ui/Toast';

interface Out { name: string; blob: Blob; from: number }

export default function HeicToJpg() {
  const toast = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [format, setFormat] = useState<'image/jpeg' | 'image/png'>('image/jpeg');
  const [quality, setQuality] = useState(90);
  const [outs, setOuts] = useState<Out[]>([]);
  const [prog, setProg] = useState<number | null>(null);
  const add = (fs: File[]) => {
    const ok = fs.filter((f) => /\.(heic|heif)$/i.test(f.name) || /hei[cf]/i.test(f.type));
    if (ok.length < fs.length) toast.error('Only .heic and .heif files can be added here.');
    setFiles((x) => [...x, ...ok.filter((f) => f.size <= 60 * 1024 * 1024)].slice(0, 50));
    setOuts([]);
  };
  const convert = async () => {
    setProg(0); setOuts([]);
    try {
      const { default: heic2any } = await import('heic2any');
      const res: Out[] = [];
      for (let i = 0; i < files.length; i++) {
        try {
          const r = await heic2any({ blob: files[i], toType: format, quality: quality / 100 });
          const blob = Array.isArray(r) ? r[0] : r;
          res.push({ name: files[i].name.replace(/\.(heic|heif)$/i, '') + (format === 'image/png' ? '.png' : '.jpg'), blob, from: files[i].size });
        } catch { toast.error(`“${files[i].name}” couldn’t be converted.`); }
        setProg((i + 1) / files.length);
      }
      setOuts(res);
    } finally { setProg(null); }
  };
  const zip = async () => {
    const { zipSync } = await import('fflate');
    const e: Record<string, [Uint8Array, { level: 0 }]> = {};
    for (const o of outs) e[o.name] = [new Uint8Array(await o.blob.arrayBuffer()), { level: 0 }];
    downloadBlob(new Blob([zipSync(e) as Uint8Array<ArrayBuffer>], { type: 'application/zip' }), 'converted-photos.zip');
  };
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <Card className="space-y-4 p-4 sm:p-6">
        <Dropzone onFiles={add} multiple accept=".heic,.heif,image/heic,image/heif" title={files.length ? 'Add more iPhone photos' : 'Drop iPhone photos (.HEIC)'} hint="Up to 50 photos" compact={files.length > 0} icon={<Smartphone className="h-7 w-7" aria-hidden />} />
        {files.length > 0 && <ul className="divide-y divide-line rounded-xl border border-line">{files.map((f, i) => {
          const o = outs.find((x) => x.name.startsWith(f.name.replace(/\.(heic|heif)$/i, '')));
          return <li key={i} className="flex items-center gap-3 px-3 py-2 text-sm"><span className="min-w-0 flex-1 truncate text-fg">{f.name}</span><span className="text-fg-subtle">{formatBytes(f.size)}{o ? ` → ${formatBytes(o.blob.size)}` : ''}</span>
            {o ? <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => downloadBlob(o.blob, o.name)} aria-label={`Download ${o.name}`} icon={<Download className="h-4 w-4" />} /> : <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setFiles((x) => x.filter((_, j) => j !== i))} aria-label={`Remove ${f.name}`} icon={<X className="h-4 w-4" />} />}</li>;
        })}</ul>}
      </Card>
      <Card className="h-fit space-y-5 p-5">
        <Segmented label="Convert to" value={format} onChange={setFormat} options={[{ value: 'image/jpeg', label: 'JPG' }, { value: 'image/png', label: 'PNG' }]} className="w-full" />
        {format === 'image/jpeg' && <Range label="Quality" min={50} max={100} value={quality} onChange={setQuality} display={`${quality}%`} />}
        {prog !== null && <Progress value={prog} label="Converting" />}
        <Button size="lg" className="w-full" disabled={!files.length || prog !== null} onClick={convert}>Convert {files.length || ''} photo{files.length === 1 ? '' : 's'}</Button>
        {outs.length > 1 && <Button className="w-full" variant="outline" onClick={zip} icon={<Archive className="h-4 w-4" aria-hidden />}>Download all (ZIP)</Button>}
        <p className="text-xs text-fg-subtle">Converted on your device. The converter (about 1 MB) loads the first time you press Convert.</p>
      </Card>
    </div>
  );
}
