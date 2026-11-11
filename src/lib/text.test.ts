import { describe, expect, it } from 'vitest';
import { countParagraphs, countSentences, countWords, formatDuration, getTextStats } from './textStats';
import {
  removeDuplicateLines, removeExtraSpaces, reverseText, sortLines, toSentenceCase, toTitleCase,
} from './textFormat';

describe('textStats', () => {
  it('counts words, sentences and paragraphs', () => {
    const text = 'Hello world. This is LifeKit!\n\nIt’s a well-known test? Yes.';
    expect(countWords(text)).toBe(10);
    expect(countSentences(text)).toBe(4);
    expect(countParagraphs(text)).toBe(2);
    expect(countWords('   ')).toBe(0);
  });
  it('counts characters as graphemes', () => {
    const s = getTextStats('a 👍🏽 b');
    expect(s.characters).toBe(5);
    expect(s.charactersNoSpaces).toBe(3);
  });
  it('formats durations', () => {
    expect(formatDuration(0)).toBe('0 min');
    expect(formatDuration(0.5)).toBe('30 sec');
    expect(formatDuration(75)).toBe('1 h 15 min');
  });
});

describe('textFormat', () => {
  it('title case', () => {
    expect(toTitleCase('the lord of the rings')).toBe('The Lord of the Rings');
    expect(toTitleCase('a tale of two cities')).toBe('A Tale of Two Cities');
    expect(toTitleCase('what are you looking at')).toBe('What Are You Looking At');
    expect(toTitleCase('state-of-the-art design')).toBe('State-Of-The-Art Design');
  });
  it('sentence case', () => {
    expect(toSentenceCase('HELLO THERE. i AM HERE! how are you?')).toBe('Hello there. I am here! How are you?');
  });
  it('removes extra spaces', () => {
    expect(removeExtraSpaces('  a   b \t c  \n\n\n\n d ')).toBe('a b c\n\nd');
  });
  it('removes duplicate lines', () => {
    expect(removeDuplicateLines('a\nb\na\nA')).toBe('a\nb\nA');
    expect(removeDuplicateLines('a\nb\na\nA', { ignoreCase: true })).toBe('a\nb');
  });
  it('reverses text with emoji intact', () => {
    expect(reverseText('ab👍🏽')).toBe('👍🏽ba');
  });
  it('sorts lines naturally', () => {
    expect(sortLines('item 10\nitem 2\nApple\nbanana')).toBe('Apple\nbanana\nitem 2\nitem 10');
    expect(sortLines('b\n\na', { removeEmpty: true, descending: true })).toBe('b\na');
  });
});
