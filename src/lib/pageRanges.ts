export interface PageRange {
  start: number; // 1-based, inclusive
  end: number; // 1-based, inclusive
}

export type ParseResult = { ok: true; ranges: PageRange[] } | { ok: false; error: string };

/**
 * Parse page ranges such as "1-3, 5, 8-". An open end ("8-") runs to the last page.
 * Reversed ranges ("5-3") are allowed and produce pages in descending order.
 */
export function parsePageRanges(input: string, pageCount: number): ParseResult {
  const parts = input.split(/[,;]/).map((p) => p.trim()).filter(Boolean);
  if (parts.length === 0) return { ok: false, error: 'Enter at least one page or range, for example “1-3, 5”.' };
  const ranges: PageRange[] = [];
  for (const part of parts) {
    const m = /^(\d+)\s*(?:[-–]\s*(\d*))?$/.exec(part);
    if (!m) return { ok: false, error: `“${part}” is not a valid page or range.` };
    const start = Number(m[1]);
    const end = m[2] === undefined ? start : m[2] === '' ? pageCount : Number(m[2]);
    for (const n of [start, end]) {
      if (n < 1 || n > pageCount) {
        return { ok: false, error: `Page ${n} does not exist. This document has ${pageCount} page${pageCount === 1 ? '' : 's'}.` };
      }
    }
    ranges.push({ start, end });
  }
  return { ok: true, ranges };
}

/** Expand a range into 0-based page indices. */
export function rangeToIndices(r: PageRange): number[] {
  const out: number[] = [];
  const step = r.start <= r.end ? 1 : -1;
  for (let p = r.start; step > 0 ? p <= r.end : p >= r.end; p += step) out.push(p - 1);
  return out;
}

export function describeRange(r: PageRange): string {
  return r.start === r.end ? `page ${r.start}` : `pages ${r.start}-${r.end}`;
}

/** Compact a sorted list of 1-based page numbers into "1-3, 5". */
export function compactPages(pages: number[]): string {
  const sorted = [...new Set(pages)].sort((a, b) => a - b);
  const out: string[] = [];
  let i = 0;
  while (i < sorted.length) {
    let j = i;
    while (j + 1 < sorted.length && sorted[j + 1] === sorted[j] + 1) j++;
    out.push(i === j ? `${sorted[i]}` : `${sorted[i]}-${sorted[j]}`);
    i = j + 1;
  }
  return out.join(', ');
}
