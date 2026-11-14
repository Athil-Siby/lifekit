/** Lorem ipsum generator. */
const WORDS = 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum pellentesque habitant morbi tristique senectus netus malesuada fames ac turpis egestas integer vitae justo eget magna fermentum iaculis nunc mattis enim blandit volutpat maecenas accumsan lacus vel facilisis viverra mauris cursus mattis molestie a iaculis at erat pellentesque adipiscing commodo'.split(' ');
const OPENING = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit';

function rand(n: number, rng: () => number) {
  return Math.floor(rng() * n);
}
function sentence(rng: () => number): string {
  const len = 8 + rand(10, rng);
  const words = Array.from({ length: len }, () => WORDS[rand(WORDS.length, rng)]);
  if (len > 10) words[4 + rand(len - 8, rng)] += ',';
  const s = words.join(' ');
  return s.charAt(0).toUpperCase() + s.slice(1) + '.';
}

export function lorem(kind: 'paragraphs' | 'sentences' | 'words', count: number, startWithLorem = true, rng: () => number = Math.random): string {
  const n = Math.max(1, Math.min(kind === 'words' ? 5000 : 200, Math.floor(count)));
  if (kind === 'words') {
    const words = Array.from({ length: n }, () => WORDS[rand(WORDS.length, rng)]);
    if (startWithLorem) OPENING.toLowerCase().replace(/,/g, '').split(' ').slice(0, n).forEach((w, i) => (words[i] = w));
    const s = words.join(' ');
    return s.charAt(0).toUpperCase() + s.slice(1) + '.';
  }
  if (kind === 'sentences') {
    const list = Array.from({ length: n }, () => sentence(rng));
    if (startWithLorem) list[0] = OPENING + '.';
    return list.join(' ');
  }
  const paras = Array.from({ length: n }, () => Array.from({ length: 4 + rand(4, rng) }, () => sentence(rng)).join(' '));
  if (startWithLorem) paras[0] = OPENING + ', ' + paras[0].charAt(0).toLowerCase() + paras[0].slice(1);
  return paras.join('\n\n');
}
