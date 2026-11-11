const MINOR_WORDS = new Set([
  'a', 'an', 'the', 'and', 'but', 'or', 'nor', 'for', 'so', 'yet', 'as', 'at', 'by', 'in', 'of', 'off', 'on',
  'per', 'to', 'up', 'via', 'vs', 'from', 'into', 'with', 'over',
]);

export function toUpper(text: string): string {
  return text.toLocaleUpperCase();
}

export function toLower(text: string): string {
  return text.toLocaleLowerCase();
}

function capitalize(word: string): string {
  const i = word.search(/\p{L}/u);
  if (i < 0) return word;
  return word.slice(0, i) + word.charAt(i).toLocaleUpperCase() + word.slice(i + 1);
}

/** Title Case following common style guides: minor words stay lowercase except first/last in a line. */
export function toTitleCase(text: string): string {
  return text
    .split(/(\r?\n)/)
    .map((line) => {
      const tokens = line.split(/(\s+)/);
      const wordIdx = tokens.map((t, i) => (/\S/.test(t) ? i : -1)).filter((i) => i >= 0);
      const first = wordIdx[0];
      const last = wordIdx[wordIdx.length - 1];
      return tokens
        .map((tok, i) => {
          if (!/\S/.test(tok)) return tok;
          const lower = tok.toLocaleLowerCase();
          const bare = lower.replace(/[^\p{L}']/gu, '');
          // Hyphenated words: capitalise each part.
          const cap = lower.split('-').map(capitalize).join('-');
          if (i !== first && i !== last && MINOR_WORDS.has(bare)) {
            // Keep minor words lowercase unless they follow a colon or similar break.
            const prev = tokens.slice(0, i).reverse().find((t) => /\S/.test(t)) ?? '';
            if (!/[:.!?—–]$/.test(prev)) return lower;
          }
          return cap;
        })
        .join('');
    })
    .join('');
}

/** Sentence case: lowercases everything, then capitalises the first letter of each sentence and the pronoun "I". */
export function toSentenceCase(text: string): string {
  const lower = text.toLocaleLowerCase();
  let out = '';
  let capNext = true;
  for (const ch of lower) {
    if (capNext && /\p{L}/u.test(ch)) {
      out += ch.toLocaleUpperCase();
      capNext = false;
    } else {
      out += ch;
    }
    if (/[.!?]/.test(ch)) capNext = true;
    if (ch === '\n') capNext = true;
  }
  return out.replace(/(^|[^\p{L}])i(?=$|[^\p{L}])/gu, (_m, p1: string) => `${p1}I`);
}

/** Collapse runs of spaces/tabs, trim each line and remove blank-line runs longer than one. */
export function removeExtraSpaces(text: string): string {
  return text
    .split(/\r?\n/)
    .map((line) => line.replace(/[ \t ]+/g, ' ').trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function removeDuplicateLines(text: string, opts: { ignoreCase?: boolean; ignoreWhitespace?: boolean } = {}): string {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const line of text.split(/\r?\n/)) {
    let key = opts.ignoreWhitespace ? line.trim() : line;
    if (opts.ignoreCase) key = key.toLocaleLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(line);
  }
  return out.join('\n');
}

/** Reverse characters, keeping emoji and combined characters intact. */
export function reverseText(text: string): string {
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    const segs = Array.from(new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(text), (s) => s.segment);
    return segs.reverse().join('');
  }
  return Array.from(text).reverse().join('');
}

export function reverseLines(text: string): string {
  return text.split(/\r?\n/).reverse().join('\n');
}

export function sortLines(text: string, opts: { descending?: boolean; removeEmpty?: boolean } = {}): string {
  const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
  let lines = text.split(/\r?\n/);
  if (opts.removeEmpty) lines = lines.filter((l) => l.trim() !== '');
  lines.sort(collator.compare);
  if (opts.descending) lines.reverse();
  return lines.join('\n');
}
