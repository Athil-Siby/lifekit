import { useEffect, useState } from 'react';
import { FileDown, ImagePlus, Plus, RotateCcw, X } from 'lucide-react';
import { invoicePdf, invoiceTotals, type Invoice } from '../lib/docPdf';
import { readStorage, writeStorage } from '../lib/storage';
import { downloadBlob } from '../utils/download';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Form';
import { useToast } from '../components/ui/Toast';

const today = () => new Date().toISOString().slice(0, 10);
const blank = (): Invoice => ({ from: 'Your Business Name\nAddress line\nPhone / email\nGSTIN (if any)', to: 'Client Name\nClient address', number: 'INV-001', date: today(), due: '', currency: 'Rs.', items: [{ desc: 'Website design', qty: 1, rate: 15000 }, { desc: 'Logo design', qty: 1, rate: 5000 }], taxPct: 18, taxLabel: 'GST', discount: 0, notes: 'Thank you for your business! Payment by UPI or bank transfer within 15 days.', accent: '#7457d6' });
const ta = 'w-full rounded-xl border border-line bg-surface-2 p-3 text-sm text-fg focus:border-accent focus:outline-none';

export default function InvoiceGenerator() {
  const toast = useToast();
  const [inv, setInv] = useState<Invoice>(() => ({ ...blank(), ...readStorage<Partial<Invoice>>('invoice', {}), logo: null }));
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { const { logo: _l, ...rest } = inv; void _l; writeStorage('invoice', rest); }, [inv]);
  const set = <K extends keyof Invoice>(k: K, v: Invoice[K]) => setInv((x) => ({ ...x, [k]: v }));
  const setItem = (i: number, k: 'desc' | 'qty' | 'rate', v: string) => setInv((x) => ({ ...x, items: x.items.map((it, j) => (j === i ? { ...it, [k]: k === 'desc' ? v : Number(v) || 0 } : it)) }));
  const t = invoiceTotals(inv);
  const money = (n: number) => `${inv.currency} ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const download = async () => { setBusy(true); try { downloadBlob(await invoicePdf(inv), `${inv.number || 'invoice'}.pdf`); } catch { toast.error('The PDF could not be created.'); } finally { setBusy(false); } };
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <Card className="min-w-0 space-y-5 p-4 sm:p-6">
        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-line px-3 py-2 text-sm text-fg hover:bg-surface-2">{logoUrl ? <img src={logoUrl} alt="Logo" className="h-8 max-w-[120px] object-contain" /> : <><ImagePlus className="h-4 w-4" aria-hidden /> Add logo (PNG/JPG)</>}
            <input type="file" accept="image/png,image/jpeg" className="sr-only" onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; set('logo', new Uint8Array(await f.arrayBuffer())); set('logoType', f.type); setLogoUrl(URL.createObjectURL(f)); e.target.value = ''; }} /></label>
          <label className="flex items-center gap-2 text-sm text-fg">Colour <input type="color" value={inv.accent} onChange={(e) => set('accent', e.target.value)} className="h-9 w-12 rounded-lg border border-line" /></label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block"><span className="mb-1.5 block text-sm font-medium text-fg">From (you)</span><textarea rows={4} className={ta} value={inv.from} onChange={(e) => set('from', e.target.value)} /></label>
          <label className="block"><span className="mb-1.5 block text-sm font-medium text-fg">Bill to</span><textarea rows={4} className={ta} value={inv.to} onChange={(e) => set('to', e.target.value)} /></label>
        </div>
        <div className="grid gap-3 sm:grid-cols-4">
          <Input label="Invoice #" value={inv.number} onChange={(e) => set('number', e.target.value)} />
          <Input label="Date" type="date" value={inv.date} onChange={(e) => set('date', e.target.value)} />
          <Input label="Due date" type="date" value={inv.due} onChange={(e) => set('due', e.target.value)} />
          <Select label="Currency" value={inv.currency} onChange={(e) => set('currency', e.target.value)}>{['Rs.', 'AED', '$', '€', '£', 'SAR', 'QAR', 'CAD', 'AUD'].map((c) => <option key={c}>{c}</option>)}</Select>
        </div>
        <div className="space-y-2">
          <div className="hidden grid-cols-[minmax(0,1fr)_70px_110px_36px] gap-2 px-1 text-xs font-medium text-fg-subtle sm:grid"><span>Item</span><span>Qty</span><span>Rate</span><span /></div>
          {inv.items.map((it, i) => (
            <div key={i} className="grid grid-cols-[minmax(0,1fr)_56px_84px_36px] gap-1.5 sm:grid-cols-[minmax(0,1fr)_70px_110px_36px] sm:gap-2">
              <input className="h-10 w-full min-w-0 rounded-lg border border-line bg-surface px-2 text-sm text-fg" value={it.desc} onChange={(e) => setItem(i, 'desc', e.target.value)} placeholder="Description" aria-label="Item description" />
              <input className="h-10 w-full min-w-0 rounded-lg border border-line bg-surface px-2 text-sm text-fg" inputMode="decimal" value={it.qty || ''} onChange={(e) => setItem(i, 'qty', e.target.value)} aria-label="Quantity" />
              <input className="h-10 w-full min-w-0 rounded-lg border border-line bg-surface px-2 text-sm text-fg" inputMode="decimal" value={it.rate || ''} onChange={(e) => setItem(i, 'rate', e.target.value)} aria-label="Rate" />
              <Button variant="ghost" size="icon" className="h-10 w-9" onClick={() => set('items', inv.items.filter((_, j) => j !== i))} aria-label="Remove item" icon={<X className="h-4 w-4" />} />
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={() => set('items', [...inv.items, { desc: '', qty: 1, rate: 0 }])} icon={<Plus className="h-4 w-4" aria-hidden />}>Add item</Button>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Input label="Tax name" value={inv.taxLabel} onChange={(e) => set('taxLabel', e.target.value)} />
          <Input label="Tax %" inputMode="decimal" value={String(inv.taxPct)} onChange={(e) => set('taxPct', Number(e.target.value) || 0)} />
          <Input label="Discount (amount)" inputMode="decimal" value={String(inv.discount)} onChange={(e) => set('discount', Number(e.target.value) || 0)} />
        </div>
        <label className="block"><span className="mb-1.5 block text-sm font-medium text-fg">Notes / payment details</span><textarea rows={3} className={ta} value={inv.notes} onChange={(e) => set('notes', e.target.value)} /></label>
      </Card>
      <Card className="h-fit space-y-4 p-5 lg:sticky lg:top-24">
        <h2 className="text-sm font-semibold text-fg">Summary</h2>
        <div className="space-y-1.5 text-sm"><div className="flex justify-between text-fg-muted"><span>Subtotal</span><span>{money(t.sub)}</span></div>{inv.discount > 0 && <div className="flex justify-between text-fg-muted"><span>Discount</span><span>− {money(inv.discount)}</span></div>}{inv.taxPct > 0 && <div className="flex justify-between text-fg-muted"><span>{inv.taxLabel} ({inv.taxPct}%)</span><span>{money(t.tax)}</span></div>}<div className="flex justify-between border-t border-line pt-2 text-lg font-bold text-fg"><span>Total</span><span>{money(t.total)}</span></div></div>
        <Button size="lg" className="w-full" onClick={download} loading={busy} icon={<FileDown className="h-5 w-5" aria-hidden />}>Download invoice PDF</Button>
        <Button variant="ghost" className="w-full" onClick={() => { if (confirm('Start a new blank invoice?')) { setInv(blank()); setLogoUrl(null); } }} icon={<RotateCcw className="h-4 w-4" aria-hidden />}>New invoice</Button>
        <p className="text-xs text-fg-subtle">Your details are saved on this device for next time (not the logo). Nothing is uploaded. Check the tax rules that apply to your business.</p>
      </Card>
    </div>
  );
}
