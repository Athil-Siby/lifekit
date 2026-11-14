import { describe, expect, it } from 'vitest';
import { groupIntoParagraphs } from './pdfLayout';
import { buildDocumentXml } from './docx';
import { splitForSpeech } from './speech';

const f = (str: string, x: number, y: number, size = 11, width = str.length * 5) => ({ str, x, y, size, width });

describe('groupIntoParagraphs', () => {
  it('detects headings and joins wrapped lines', () => {
    const paras = groupIntoParagraphs([
      f('Annual Report', 50, 800, 20),
      f('This is the first line of a', 50, 760),
      f('paragraph that wraps.', 50, 746),
      f('A second para-', 50, 710),
      f('graph here.', 50, 696),
    ]);
    expect(paras).toEqual([
      { text: 'Annual Report', size: 20, heading: true },
      { text: 'This is the first line of a paragraph that wraps.', size: 11, heading: false },
      { text: 'A second paragraph here.', size: 11, heading: false },
    ]);
  });
  it('joins fragments on one line in reading order', () => {
    const p = groupIntoParagraphs([f('World', 100, 500, 11, 25), f('Hello', 50, 500, 11, 25)]);
    expect(p[0].text).toBe('Hello World');
  });
});

describe('docx', () => {
  it('escapes text and writes page breaks', () => {
    const xml = buildDocumentXml([{ type: 'p', text: 'A & B <c>', bold: true, size: 16 }, { type: 'pageBreak' }]);
    expect(xml).toContain('A &amp; B &lt;c&gt;');
    expect(xml).toContain('<w:b/>');
    expect(xml).toContain('w:val="32"');
    expect(xml).toContain('w:type="page"');
  });
});

describe('splitForSpeech', () => {
  it('splits by sentences within a limit', () => {
    const chunks = splitForSpeech('One. Two two. Three three three!', 12);
    expect(chunks).toEqual(['One.', 'Two two.', 'Three three', 'three!']);
    expect(splitForSpeech('   ')).toEqual([]);
    expect(splitForSpeech('Short text.')).toEqual(['Short text.']);
  });
});
