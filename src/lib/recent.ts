import { readStorage, writeStorage } from './storage';

/** Remember the last few tools a visitor opened (stored only on their device). */
export function rememberTool(slug: string) {
  const list = readStorage<string[]>('recent-tools', []).filter((s) => s !== slug);
  writeStorage('recent-tools', [slug, ...list].slice(0, 8));
}
export const recentTools = () => readStorage<string[]>('recent-tools', []);
