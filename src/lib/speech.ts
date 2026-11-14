/**
 * Splits long text into sentence-sized chunks. Some browsers stop speaking
 * long single utterances after ~15 seconds, so text is queued in parts.
 */
export function splitForSpeech(text: string, max = 220): string[] {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (!clean) return [];
  const sentences = clean.match(/[^.!?。！？]+[.!?。！？]+["')\]]*|\S[^.!?。！？]*$/g) ?? [clean];
  const out: string[] = [];
  let cur = '';
  for (const raw of sentences) {
    const s = raw.trim();
    if (!s) continue;
    if (s.length > max) {
      if (cur) {
        out.push(cur);
        cur = '';
      }
      // Break very long sentences at commas or spaces.
      let rest = s;
      while (rest.length > max) {
        let cut = rest.lastIndexOf(', ', max);
        if (cut < max * 0.5) cut = rest.lastIndexOf(' ', max);
        if (cut <= 0) cut = max;
        out.push(rest.slice(0, cut + 1).trim());
        rest = rest.slice(cut + 1).trim();
      }
      cur = rest;
    } else if ((cur + ' ' + s).trim().length > max) {
      out.push(cur);
      cur = s;
    } else {
      cur = (cur + ' ' + s).trim();
    }
  }
  if (cur) out.push(cur);
  return out;
}
