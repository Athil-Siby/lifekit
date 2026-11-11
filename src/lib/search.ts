import { categories, tools, type Tool } from '../config/tools';

function normalize(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9%]+/g, ' ').trim();
}

/**
 * Score-based tool search over names, keywords, descriptions and category names.
 * Every query term must match somewhere; better matches score higher.
 */
export function searchTools(query: string, list: Tool[] = tools): Tool[] {
  const q = normalize(query);
  if (!q) return list;
  const terms = q.split(' ');
  const scored: { tool: Tool; score: number }[] = [];
  for (const tool of list) {
    const name = normalize(tool.name);
    const keywords = tool.keywords.map(normalize);
    const category = normalize(categories.find((c) => c.id === tool.category)?.name ?? '');
    const desc = normalize(`${tool.short} ${tool.intro}`);
    let score = 0;
    let allMatched = true;
    for (const term of terms) {
      let s = 0;
      if (name.split(' ').some((w) => w.startsWith(term))) s = Math.max(s, 10);
      else if (name.includes(term)) s = Math.max(s, 7);
      if (keywords.some((k) => k.split(' ').some((w) => w.startsWith(term)))) s = Math.max(s, 6);
      if (category.includes(term)) s = Math.max(s, 4);
      if (desc.includes(term)) s = Math.max(s, 2);
      if (s === 0) {
        allMatched = false;
        break;
      }
      score += s;
    }
    if (!allMatched) continue;
    if (name === q) score += 20;
    if (keywords.includes(q)) score += 8;
    scored.push({ tool, score });
  }
  return scored.sort((a, b) => b.score - a.score).map((x) => x.tool);
}
