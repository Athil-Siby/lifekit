import { useEffect, useState } from 'react';
import { Archive, Grid3x3 } from 'lucide-react';
import { useImageFile } from '../hooks/useImageFile';
import { renderImage, toBlob } from '../lib/imageOps';
import { IMAGE_ACCEPT } from '../utils/files';
import { downloadBlob } from '../utils/download';
import { Card } from '../components/ui/Card';
import { Dropzone } from '../components/ui/Dropzone';
import { Button } from '../components/ui/Button';
import { Segmented } from '../components/ui/Segmented';
import { PageLoader } from '../components/PageLoader';
import { IMAGE_INPUT, baseOf } from './imageShared';

export default function GridSplitter() {
  const { file, image, loading, select, clear } = useImageFile(IMAGE_ACCEPT);
  const [rows, setRows] = useState<'1' | '2' | '3'>('3');
  const [tile, setTile] = useState<'square' | 'portrait'>('portrait');
  const [tiles, setTiles] = useState<string[]>([]);
  const R = Number(rows), C = 3, tw = 1080, th = tile === 'square' ? 1080 : 1350;
  useEffect(() => {
    if (!image) return;
    const full = renderImage(image, { outW: tw * C, outH: th * R, fit: 'cover' });
    const out: string[] = [];
    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
      const t = document.createElement('canvas'); t.width = 360; t.height = (360 * th) / tw;
      t.getContext('2d')!.drawImage(full, c * tw, r * th, tw, th, 0, 0, t.width, t.height); out.push(t.toDataURL('image/jpeg', 0.8));
    }
    full.width = 0; setTiles(out);
  }, [image, R, th]); // eslint-disable-line react-hooks/exhaustive-deps
  const zip = async () => {
    const full = renderImage(image!, { outW: tw * C, outH: th * R, fit: 'cover' });
    const { zipSync } = await import('fflate');
    const e: Record<string, [Uint8Array, { level: 0 }]> = {};
    const total = R * C;
    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
      const t = document.createElement('canvas'); t.width = tw; t.height = th;
      t.getContext('2d')!.drawImage(full, c * tw, r * th, tw, th, 0, 0, tw, th);
      const idx = r * C + c, postOrder = total - idx; // post the last tile first
      e[`post-${String(postOrder).padStart(2, '0')}_row${r + 1}-col${c + 1}.jpg`] = [new Uint8Array(await (await toBlob(t, 'image/jpeg', 0.92)).arrayBuffer()), { level: 0 }];
    }
    downloadBlob(new Blob([zipSync(e) as Uint8Array<ArrayBuffer>], { type: 'application/zip' }), `${baseOf(file!.name)}-grid.zip`);
  };
  if (!file || !image) return <Card className="p-4 sm:p-6">{loading ? <PageLoader label="Opening image…" /> : <Dropzone onFiles={select} accept={IMAGE_INPUT} title="Drop a photo to split into an Instagram grid" icon={<Grid3x3 className="h-7 w-7" aria-hidden />} />}</Card>;
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <Card className="p-4 sm:p-5"><div className="mx-auto grid max-w-md grid-cols-3 gap-1">{tiles.map((t, i) => <div key={i} className="relative"><img src={t} alt={`Tile ${i + 1}`} className="w-full" /><span className="absolute left-1 top-1 rounded bg-black/60 px-1.5 text-xs font-semibold text-white">{tiles.length - i}</span></div>)}</div><p className="mt-3 text-center text-xs text-fg-subtle">Numbers show the posting order: post #1 first, finish with the top-left tile.</p></Card>
      <Card className="h-fit space-y-4 p-5">
        <Segmented label="Rows" value={rows} onChange={setRows} options={[{ value: '1', label: '3 × 1' }, { value: '2', label: '3 × 2' }, { value: '3', label: '3 × 3' }]} className="w-full" />
        <Segmented label="Tile shape" value={tile} onChange={setTile} options={[{ value: 'portrait', label: '4:5 (new grid)' }, { value: 'square', label: 'Square' }]} className="w-full" />
        <Button size="lg" className="w-full" onClick={zip} icon={<Archive className="h-5 w-5" aria-hidden />}>Download {R * C} tiles (ZIP)</Button>
        <Button variant="ghost" className="w-full" onClick={clear}>Use another photo</Button>
      </Card>
    </div>
  );
}
