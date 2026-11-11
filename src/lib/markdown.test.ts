import { describe, expect, it } from 'vitest';
import { parseInline, parseMarkdown } from './markdown';

describe('markdown', () => {
  it('parses blocks', () => {
    const b = parseMarkdown('## Title here\n\nPara one\ncontinues.\n\n- a\n- b\n\n1. x\n2. y\n\n> Tip text\n\n### Sub');
    expect(b.map((x) => x.type)).toEqual(['h2', 'p', 'ul', 'ol', 'tip', 'h3']);
    expect(b[0]).toMatchObject({ id: 'title-here' });
    expect(b[1]).toMatchObject({ text: [{ type: 'text', text: 'Para one continues.' }] });
  });
  it('parses inline formatting and rejects unsafe links', () => {
    expect(parseInline('Use **bold**, `code` and [tool](/tools/pdf-merger).')).toEqual([
      { type: 'text', text: 'Use ' },
      { type: 'bold', text: 'bold' },
      { type: 'text', text: ', ' },
      { type: 'code', text: 'code' },
      { type: 'text', text: ' and ' },
      { type: 'link', text: 'tool', href: '/tools/pdf-merger' },
      { type: 'text', text: '.' },
    ]);
    expect(parseInline('[x](javascript:alert(1))')[0]).toEqual({ type: 'text', text: 'x' });
  });
});
