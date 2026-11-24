import { useEffect, useState } from 'react';
import { Download, FileDown, PenTool } from 'lucide-react';
import { HAND_FONTS, loadHandFont, renderPages, type PaperOpts } from '../lib/handwriting';
import { downloadBlob } from '../utils/download';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Range, Select, Checkbox } from '../components/ui/Form';
import { Segmented } from '../components/ui/Segmented';
import { useToast } from '../components/ui/Toast';

const SAMPLE = 'Photosynthesis\n\nPhotosynthesis is the process by which green plants use sunlight, water and carbon dioxide to make their own food. It takes place in the chloroplasts, which contain a green pigment called chlorophyll.\n\nThe overall equation is:\n6CO2 + 6H2O → C6H12O6 + 6O2\n\nOxygen is released as a by-product, which is why plants are so important for life on Earth.';
const INKS = [['#1d3b8f', 'Blue'], ['#1a1a1a', 'Black'], ['#b3261e', 'Red'], ['#1f6f43', 'Green']];

export default function TextToHandwriting() {
  const toast = useToast();
  const [text, setText] = useState(SAMPLE);
  const [o, setO] = useState<PaperOpts>({ font: 'Kalam', size: 40, ink: '#1d3b8f', paper: 'ruled', margin: true, jitter: 1 });
  const [pages, setPages] = useState<string[]>([]);
  const [canvases, setCanvases] = useState<HTMLCanvasElement[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(async () => {
      await loadHandFont(o.font);
      if (cancelled) return;
      const cs = renderPages(text, o);
      setCanvases(cs);
      setPages(cs.map((c) => c.toDataURL('image/jpeg', 0.85)));
    }, 250);
    return () => { cancelled = true; clearTimeout(t); };
  }, [text, o]);

  const set = <K extends keyof PaperOpts>(k: K, v: PaperOpts[K]) => setO((x) => ({ ...x, [k]: v }));

  const pdf = async () => {
    setBusy(true);
    try {
      const { PDFDocument } = await import('pdf-lib');
      const doc = await PDFDocument.create();
      for (const c of canvases) {
        const blob = await new Promise<Blob>((r) => c.toBlob((b) => r(b!), 'image/jpeg', 0.9));
        const img = await doc.embedJpg(await blob.arrayBuffer());
        doc.addPage([595.28, 841.89]).drawImage(img, { x: 0, y: 0, width: 595.28, height: 841.89 });
      }
      downloadBlob(new Blob([(await doc.save()) as Uint8Array<ArrayBuffer>], { type: 'application/pdf' }), 'handwritten.pdf');
    } catch {
      toast.error('The PDF could not be created.');
    } finally { setBusy(false); }
  };
  const png = (i: number) => canvases[i].toBlob((b) => b && downloadBlob(b, `handwritten-page-${i + 1}.jpg`), 'image/jpeg', 0.92);

  return (
    <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
      <Card className="h-fit space-y-4 p-5">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-fg">Your text</span>
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={9} className="w-full resize-y rounded-xl border border-line bg-surface-2 p-3 text-sm text-fg focus:border-accent focus:outline-none" placeholder="Type or paste your assignment…" />
        </label>
        <Select label="Handwriting" value={o.font} onChange={(e) => set('font', e.target.value)}>
          {HAND_FONTS.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
        </Select>
        <div>
          <p className="mb-2 text-sm font-medium text-fg">Ink</p>
          <div className="flex gap-2">{INKS.map(([c, n]) => <button key={c} type="button" onClick={() => set('ink', c)} aria-label={`${n} ink`} aria-pressed={o.ink === c} className={`h-9 w-9 rounded-full ring-offset-2 ring-offset-surface ${o.ink === c ? 'ring-2 ring-accent' : ''}`} style={{ background: c }} />)}</div>
        </div>
        <Segmented label="Paper" value={o.paper} onChange={(v) => set('paper', v)} options={[{ value: 'ruled', label: 'Ruled' }, { value: 'plain', label: 'Plain' }, { value: 'grid', label: 'Grid' }]} className="w-full" />
        <Range label="Text size" min={28} max={56} value={o.size} onChange={(v) => set('size', v)} />
        <Range label="Messiness" min={0} max={3} step={0.5} value={o.jitter} onChange={(v) => set('jitter', v)} display={o.jitter === 0 ? 'Neat' : o.jitter >= 2.5 ? 'Very messy' : 'Natural'} />
        <Checkbox checked={o.margin} onChange={(v) => set('margin', v)} label="Red margin line" />
        <Button size="lg" className="w-full" onClick={pdf} loading={busy} disabled={!pages.length} icon={<FileDown className="h-5 w-5" aria-hidden />}>Download PDF ({pages.length} page{pages.length === 1 ? '' : 's'})</Button>
        <p className="text-xs text-fg-subtle">Made on your device. Please follow your school’s rules about how you use it.</p>
      </Card>
      <div className="space-y-4">
        {pages.length === 0 && <Card className="flex min-h-[400px] items-center justify-center p-6 text-fg-muted"><PenTool className="mr-2 h-5 w-5" aria-hidden /> Preparing the handwriting…</Card>}
        {pages.map((src, i) => (
          <Card key={i} className="overflow-hidden p-2">
            <img src={src} alt={`Handwritten page ${i + 1}`} className="w-full rounded-md" />
            <div className="flex items-center justify-between px-2 py-2 text-sm text-fg-muted">Page {i + 1}<Button variant="ghost" size="sm" onClick={() => png(i)} icon={<Download className="h-4 w-4" aria-hidden />}>Image</Button></div>
          </Card>
        ))}
      </div>
    </div>
  );
}
