/**
 * Turns positioned text fragments (as pdf.js reports them) into readable
 * paragraphs and headings. Pure function so it can be unit tested.
 */
export interface TextFrag {
  str: string;
  x: number;
  /** Baseline, in PDF units (larger = higher on the page). */
  y: number;
  size: number;
  width: number;
}

export interface Para {
  text: string;
  size: number;
  heading: boolean;
}

function median(nums: number[]): number {
  if (!nums.length) return 0;
  const s = [...nums].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

export function groupIntoParagraphs(frags: TextFrag[]): Para[] {
  const items = frags.filter((f) => f.str.trim() !== '' && f.size > 0);
  if (!items.length) return [];
  // 1. Lines: cluster by baseline.
  items.sort((a, b) => b.y - a.y || a.x - b.x);
  const lines: { y: number; size: number; parts: TextFrag[] }[] = [];
  for (const it of items) {
    const line = lines.find((l) => Math.abs(l.y - it.y) < Math.max(l.size, it.size) * 0.5);
    if (line) {
      line.parts.push(it);
      line.size = Math.max(line.size, it.size);
    } else lines.push({ y: it.y, size: it.size, parts: [it] });
  }
  lines.sort((a, b) => b.y - a.y);
  const lineTexts = lines.map((l) => {
    l.parts.sort((a, b) => a.x - b.x);
    let text = '';
    let end = -Infinity;
    for (const p of l.parts) {
      const gap = p.x - end;
      if (text && gap > p.size * 0.18 && !/\s$/.test(text) && !/^\s/.test(p.str)) text += ' ';
      text += p.str;
      end = p.x + p.width;
    }
    return { y: l.y, size: l.size, text: text.replace(/\s+/g, ' ').trim() };
  });
  const body = median(lineTexts.map((l) => l.size));
  // Normal line spacing = a low percentile of the gaps between body-sized lines,
  // so the larger gaps between paragraphs don't skew it.
  const gaps = lineTexts
    .slice(1)
    .map((l, i) => ({ g: lineTexts[i].y - l.y, body: Math.abs(l.size - body) < body * 0.15 && Math.abs(lineTexts[i].size - body) < body * 0.15 }))
    .filter((x) => x.g > 0 && x.body)
    .map((x) => x.g)
    .sort((a, b) => a - b);
  const lineGap = gaps.length ? gaps[Math.floor((gaps.length - 1) * 0.25)] : body * 1.2;

  // 2. Paragraphs: merge lines with normal spacing and similar size.
  const paras: Para[] = [];
  let cur: Para | null = null;
  let prevY = 0;
  for (const l of lineTexts) {
    const heading = l.size >= body * 1.2 && l.text.length < 140;
    const gap = prevY - l.y;
    const continues =
      cur && !heading && !cur.heading && Math.abs(cur.size - l.size) < body * 0.15 && gap > 0 && gap < lineGap * 1.45;
    if (continues && cur) {
      cur.text = /[-‐]$/.test(cur.text) && /^[a-z]/.test(l.text) ? cur.text.slice(0, -1) + l.text : `${cur.text} ${l.text}`;
    } else {
      if (cur) paras.push(cur);
      cur = { text: l.text, size: l.size, heading };
    }
    prevY = l.y;
  }
  if (cur) paras.push(cur);
  return paras;
}
