/** Invoice and resume PDFs drawn with pdf-lib (A4, Helvetica). */
import { winAnsi, wrap } from './pdfText';

export interface InvoiceItem { desc: string; qty: number; rate: number }
export interface Invoice {
  from: string; to: string; number: string; date: string; due: string; currency: string;
  items: InvoiceItem[]; taxPct: number; taxLabel: string; discount: number; notes: string; accent: string; logo?: Uint8Array | null; logoType?: string;
}

export const invoiceTotals = (inv: Invoice) => {
  const sub = inv.items.reduce((s, i) => s + (i.qty || 0) * (i.rate || 0), 0);
  const afterDisc = Math.max(0, sub - (inv.discount || 0));
  const tax = (afterDisc * (inv.taxPct || 0)) / 100;
  return { sub, tax, total: afterDisc + tax };
};

const hex = (h: string): [number, number, number] => [0, 2, 4].map((i) => parseInt(h.replace('#', '').slice(i, i + 2), 16) / 255) as [number, number, number];

export async function invoicePdf(inv: Invoice): Promise<Blob> {
  const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
  const doc = await PDFDocument.create();
  const f = await doc.embedFont(StandardFonts.Helvetica), b = await doc.embedFont(StandardFonts.HelveticaBold);
  const A = rgb(...hex(inv.accent)), grey = rgb(0.4, 0.4, 0.45), ink = rgb(0.1, 0.1, 0.15);
  let page = doc.addPage([595.28, 841.89]);
  const W = 595.28, M = 48;
  const fmt = (n: number) => `${winAnsi(inv.currency)} ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const text = (t: string, x: number, y: number, o: { font?: typeof f; size?: number; color?: ReturnType<typeof rgb>; right?: boolean } = {}) => {
    const font = o.font ?? f, size = o.size ?? 10, s = winAnsi(t);
    page.drawText(s, { x: o.right ? x - font.widthOfTextAtSize(s, size) : x, y, size, font, color: o.color ?? ink });
  };
  let y = 790;
  if (inv.logo) {
    try {
      const img = inv.logoType === 'image/png' ? await doc.embedPng(inv.logo) : await doc.embedJpg(inv.logo);
      const s = Math.min(150 / img.width, 54 / img.height); page.drawImage(img, { x: M, y: y - 54 * 0.2 - img.height * s + 20, width: img.width * s, height: img.height * s });
    } catch { /* unsupported logo format: skip */ }
  }
  text('INVOICE', W - M, y, { font: b, size: 26, color: A, right: true });
  text(`# ${inv.number}`, W - M, y - 20, { right: true, color: grey });
  y -= 80;
  text('FROM', M, y, { font: b, size: 8, color: grey }); text('BILL TO', W / 2, y, { font: b, size: 8, color: grey });
  const fromL = wrap(inv.from, f, 10, W / 2 - M - 10), toL = wrap(inv.to, f, 10, W / 2 - M);
  fromL.forEach((l, i) => text(l, M, y - 15 - i * 14, { font: i === 0 ? b : f }));
  toL.forEach((l, i) => text(l, W / 2, y - 15 - i * 14, { font: i === 0 ? b : f }));
  y -= 25 + Math.max(fromL.length, toL.length) * 14;
  text(`Date: ${inv.date}`, M, y, { color: grey }); if (inv.due) text(`Due: ${inv.due}`, W / 2, y, { color: grey });
  y -= 30;
  const cols = [M, W - M - 230, W - M - 140, W - M];
  const header = () => {
    page.drawRectangle({ x: M, y: y - 6, width: W - 2 * M, height: 22, color: A, opacity: 0.12 });
    text('DESCRIPTION', cols[0] + 6, y, { font: b, size: 8 }); text('QTY', cols[1] + 40, y, { font: b, size: 8, right: true }); text('RATE', cols[2] + 60, y, { font: b, size: 8, right: true }); text('AMOUNT', cols[3] - 6, y, { font: b, size: 8, right: true });
    y -= 26;
  };
  header();
  for (const it of inv.items.filter((i) => i.desc || i.rate)) {
    const lines = wrap(it.desc || '-', f, 10, cols[1] - cols[0] - 20);
    if (y - lines.length * 13 < 140) { page = doc.addPage([595.28, 841.89]); y = 790; header(); }
    lines.forEach((l, i) => text(l, cols[0] + 6, y - i * 13));
    text(String(it.qty), cols[1] + 40, y, { right: true }); text(fmt(it.rate), cols[2] + 60, y, { right: true }); text(fmt(it.qty * it.rate), cols[3] - 6, y, { right: true });
    y -= lines.length * 13 + 8;
    page.drawLine({ start: { x: M, y: y + 3 }, end: { x: W - M, y: y + 3 }, thickness: 0.5, color: rgb(0.88, 0.88, 0.9) });
  }
  const t = invoiceTotals(inv);
  y -= 10;
  const row = (l: string, v: string, bold = false) => { text(l, W - M - 160, y, { font: bold ? b : f, color: bold ? ink : grey }); text(v, W - M - 6, y, { font: bold ? b : f, right: true, size: bold ? 12 : 10 }); y -= bold ? 22 : 16; };
  row('Subtotal', fmt(t.sub));
  if (inv.discount) row('Discount', `- ${fmt(inv.discount)}`);
  if (inv.taxPct) row(`${inv.taxLabel || 'Tax'} (${inv.taxPct}%)`, fmt(t.tax));
  page.drawLine({ start: { x: W - M - 160, y: y + 10 }, end: { x: W - M, y: y + 10 }, thickness: 1, color: A });
  y -= 4; row('Total', fmt(t.total), true);
  if (inv.notes.trim()) { y -= 16; text('NOTES', M, y, { font: b, size: 8, color: grey }); wrap(inv.notes, f, 9.5, W - 2 * M).forEach((l, i) => text(l, M, y - 14 - i * 13, { size: 9.5, color: grey })); }
  doc.setProducer('LifeKit'); doc.setTitle(`Invoice ${inv.number}`);
  return new Blob([(await doc.save()) as Uint8Array<ArrayBuffer>], { type: 'application/pdf' });
}

export interface ResumeEntry { title: string; org: string; dates: string; details: string }
export interface Resume {
  name: string; headline: string; email: string; phone: string; location: string; link: string; summary: string;
  experience: ResumeEntry[]; education: ResumeEntry[]; skills: string; projects: ResumeEntry[]; extra: string; accent: string;
}

export async function resumePdf(r: Resume): Promise<Blob> {
  const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
  const doc = await PDFDocument.create();
  const f = await doc.embedFont(StandardFonts.Helvetica), b = await doc.embedFont(StandardFonts.HelveticaBold), it = await doc.embedFont(StandardFonts.HelveticaOblique);
  const A = rgb(...hex(r.accent)), grey = rgb(0.38, 0.38, 0.42), ink = rgb(0.1, 0.1, 0.14);
  const W = 595.28, M = 50, CW = W - 2 * M;
  let page = doc.addPage([595.28, 841.89]); let y = 790;
  const need = (h: number) => { if (y - h < 50) { page = doc.addPage([595.28, 841.89]); y = 790; } };
  const line = (t: string, x: number, o: { font?: typeof f; size?: number; color?: ReturnType<typeof rgb>; right?: boolean } = {}) => {
    const font = o.font ?? f, size = o.size ?? 10, s = winAnsi(t);
    page.drawText(s, { x: o.right ? W - M - font.widthOfTextAtSize(s, size) : x, y, size, font, color: o.color ?? ink });
  };
  line(r.name || 'Your Name', M, { font: b, size: 24 }); y -= 20;
  if (r.headline) { line(r.headline, M, { size: 12, color: A }); y -= 16; }
  const contact = [r.email, r.phone, r.location, r.link].filter(Boolean).join('   |   ');
  if (contact) { wrap(contact, f, 9, CW).forEach((l) => { line(l, M, { size: 9, color: grey }); y -= 12; }); }
  y -= 6;
  const section = (title: string) => { need(40); y -= 10; line(title.toUpperCase(), M, { font: b, size: 10, color: A }); y -= 6; page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 0.8, color: A }); y -= 14; };
  const para = (t: string, size = 10, font = f, color = ink, indent = 0) => wrap(t, font, size, CW - indent).forEach((l) => { need(14); line(l, M + indent, { size, font, color }); y -= size * 1.35; });
  const entries = (title: string, list: ResumeEntry[]) => {
    const items = list.filter((e) => e.title || e.org); if (!items.length) return;
    section(title);
    for (const e of items) {
      need(30);
      line(e.title, M, { font: b, size: 10.5 }); if (e.dates) line(e.dates, M, { size: 9, color: grey, right: true }); y -= 13;
      if (e.org) { line(e.org, M, { font: it, size: 9.5, color: grey }); y -= 13; }
      for (const d of e.details.split('\n').map((s) => s.trim()).filter(Boolean)) {
        const bullet = d.replace(/^[-•*]\s*/, '');
        const ls = wrap(bullet, f, 9.5, CW - 14);
        ls.forEach((l, i) => { need(13); if (i === 0) line('-', M + 2, { size: 9.5 }); line(l, M + 14, { size: 9.5 }); y -= 12.5; });
      }
      y -= 6;
    }
  };
  if (r.summary.trim()) { section('Summary'); para(r.summary, 10); }
  entries('Experience', r.experience);
  entries('Projects', r.projects);
  entries('Education', r.education);
  if (r.skills.trim()) { section('Skills'); para(r.skills.split(/[,\n]/).map((s) => s.trim()).filter(Boolean).join('  -  '), 10); }
  if (r.extra.trim()) { section('Achievements & more'); r.extra.split('\n').filter((s) => s.trim()).forEach((s) => para('- ' + s.replace(/^[-•*]\s*/, ''), 9.5)); }
  doc.setProducer('LifeKit'); doc.setTitle(`${r.name} – Resume`);
  return new Blob([(await doc.save()) as Uint8Array<ArrayBuffer>], { type: 'application/pdf' });
}
