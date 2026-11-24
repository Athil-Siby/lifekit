/** Unicode "fancy text" styles (mathematical alphanumerics and friends). */
const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const a = 'abcdefghijklmnopqrstuvwxyz';
const D = '0123456789';

function fromBase(upper: number, lower: number, digit?: number, exceptions: Record<string, string> = {}) {
  return (ch: string) => {
    if (exceptions[ch]) return exceptions[ch];
    let i = A.indexOf(ch);
    if (i >= 0) return String.fromCodePoint(upper + i);
    i = a.indexOf(ch);
    if (i >= 0) return String.fromCodePoint(lower + i);
    i = D.indexOf(ch);
    if (i >= 0 && digit !== undefined) return String.fromCodePoint(digit + i);
    return ch;
  };
}
const mapStr = (s: string, f: (c: string) => string) => Array.from(s).map(f).join('');
const combine = (mark: string) => (s: string) => Array.from(s).map((c) => (c.trim() ? c + mark : c)).join('');

const SMALL_CAPS = 'ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘǫʀꜱᴛᴜᴠᴡxʏᴢ';
const BUBBLE_U = 0x24b6, BUBBLE_L = 0x24d0;
const UPSIDE: Record<string, string> = { a: 'ɐ', b: 'q', c: 'ɔ', d: 'p', e: 'ǝ', f: 'ɟ', g: 'ƃ', h: 'ɥ', i: 'ᴉ', j: 'ɾ', k: 'ʞ', l: 'l', m: 'ɯ', n: 'u', o: 'o', p: 'd', q: 'b', r: 'ɹ', s: 's', t: 'ʇ', u: 'n', v: 'ʌ', w: 'ʍ', x: 'x', y: 'ʎ', z: 'z', '.': '˙', ',': "'", '?': '¿', '!': '¡', "'": ',', '(': ')', ')': '(' };

export const FANCY_STYLES: { name: string; fn: (s: string) => string }[] = [
  { name: 'Bold', fn: (s) => mapStr(s, fromBase(0x1d400, 0x1d41a, 0x1d7ce)) },
  { name: 'Italic', fn: (s) => mapStr(s, fromBase(0x1d434, 0x1d44e, undefined, { h: 'ℎ' })) },
  { name: 'Bold italic', fn: (s) => mapStr(s, fromBase(0x1d468, 0x1d482)) },
  { name: 'Script', fn: (s) => mapStr(s, fromBase(0x1d49c, 0x1d4b6, undefined, { B: 'ℬ', E: 'ℰ', F: 'ℱ', H: 'ℋ', I: 'ℐ', L: 'ℒ', M: 'ℳ', R: 'ℛ', e: 'ℯ', g: 'ℊ', o: 'ℴ' })) },
  { name: 'Bold script', fn: (s) => mapStr(s, fromBase(0x1d4d0, 0x1d4ea)) },
  { name: 'Fraktur', fn: (s) => mapStr(s, fromBase(0x1d504, 0x1d51e, undefined, { C: 'ℭ', H: 'ℌ', I: 'ℑ', R: 'ℜ', Z: 'ℨ' })) },
  { name: 'Double-struck', fn: (s) => mapStr(s, fromBase(0x1d538, 0x1d552, 0x1d7d8, { C: 'ℂ', H: 'ℍ', N: 'ℕ', P: 'ℙ', Q: 'ℚ', R: 'ℝ', Z: 'ℤ' })) },
  { name: 'Sans bold', fn: (s) => mapStr(s, fromBase(0x1d5d4, 0x1d5ee, 0x1d7ec)) },
  { name: 'Sans italic', fn: (s) => mapStr(s, fromBase(0x1d608, 0x1d622)) },
  { name: 'Monospace', fn: (s) => mapStr(s, fromBase(0x1d670, 0x1d68a, 0x1d7f6)) },
  { name: 'Bubble', fn: (s) => mapStr(s, (c) => { const i = A.indexOf(c), j = a.indexOf(c); return i >= 0 ? String.fromCodePoint(BUBBLE_U + i) : j >= 0 ? String.fromCodePoint(BUBBLE_L + j) : c; }) },
  { name: 'Small caps', fn: (s) => mapStr(s, (c) => { const i = a.indexOf(c.toLowerCase()); return i >= 0 ? SMALL_CAPS[i] : c; }) },
  { name: 'Wide', fn: (s) => mapStr(s, (c) => { const cp = c.codePointAt(0)!; return cp >= 0x21 && cp <= 0x7e ? String.fromCodePoint(cp + 0xfee0) : c === ' ' ? '　' : c; }) },
  { name: 'Strikethrough', fn: combine('̶') },
  { name: 'Underline', fn: combine('̲') },
  { name: 'Upside down', fn: (s) => Array.from(s.toLowerCase()).map((c) => UPSIDE[c] ?? c).reverse().join('') },
];
