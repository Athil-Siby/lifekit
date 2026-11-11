export interface TextStats {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  sentences: number;
  paragraphs: number;
  lines: number;
  readingMinutes: number;
  speakingMinutes: number;
}

export const READING_WPM = 238;
export const SPEAKING_WPM = 150;

const hasSegmenter = typeof Intl !== 'undefined' && 'Segmenter' in Intl;
const WORD_CHAR = /[\p{L}\p{N}]/u;

function countGraphemes(text: string): number {
  if (hasSegmenter) {
    let n = 0;
    for (const _ of new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(text)) n++;
    return n;
  }
  return Array.from(text).length;
}

export function countWords(text: string): number {
  if (!text.trim()) return 0;
  if (hasSegmenter) {
    let n = 0;
    for (const seg of new Intl.Segmenter(undefined, { granularity: 'word' }).segment(text)) {
      if (seg.isWordLike) n++;
    }
    // Treat hyphenated compounds such as "well-known" as one word, like most word processors.
    const joins = text.match(/[\p{L}\p{N}][-\u2010\u2011](?=[\p{L}\p{N}])/gu);
    return n - (joins?.length ?? 0);
  }
  return text.trim().split(/\s+/).filter((w) => WORD_CHAR.test(w)).length;
}

export function countSentences(text: string): number {
  if (!text.trim()) return 0;
  if (hasSegmenter) {
    let n = 0;
    for (const seg of new Intl.Segmenter(undefined, { granularity: 'sentence' }).segment(text)) {
      if (WORD_CHAR.test(seg.segment)) n++;
    }
    return n;
  }
  return text.split(/[.!?…]+(?:\s+|$)/).filter((s) => WORD_CHAR.test(s)).length;
}

export function countParagraphs(text: string): number {
  return text.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length;
}

export function getTextStats(text: string): TextStats {
  const words = countWords(text);
  return {
    words,
    characters: countGraphemes(text),
    charactersNoSpaces: countGraphemes(text.replace(/\s/g, '')),
    sentences: countSentences(text),
    paragraphs: countParagraphs(text),
    lines: text === '' ? 0 : text.split(/\r\n|\r|\n/).length,
    readingMinutes: words / READING_WPM,
    speakingMinutes: words / SPEAKING_WPM,
  };
}

/** "Under a minute", "3 min", "1 h 5 min". */
export function formatDuration(minutes: number): string {
  if (minutes <= 0) return '0 min';
  if (minutes < 1) return `${Math.max(1, Math.round(minutes * 60))} sec`;
  const total = Math.round(minutes);
  const h = Math.floor(total / 60);
  const m = total % 60;
  return h > 0 ? `${h} h ${m} min` : `${m} min`;
}
