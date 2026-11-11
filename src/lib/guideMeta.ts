import { countWords } from './markdown';

export function readingMinutes(body: string): number {
  return Math.max(1, Math.round(countWords(body) / 230));
}

export function formatGuideDate(iso: string): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}
