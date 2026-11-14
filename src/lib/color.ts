/** Colour conversions: HEX ⇄ RGB ⇄ HSL, CMYK, and simple shade generation. */
export interface RGB { r: number; g: number; b: number }

export function parseHex(hex: string): RGB | null {
  let h = hex.trim().replace(/^#/, '');
  if (/^[0-9a-f]{3}$/i.test(h)) h = h.split('').map((c) => c + c).join('');
  if (!/^[0-9a-f]{6}$/i.test(h)) return null;
  return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) };
}

export const toHex = ({ r, g, b }: RGB) => '#' + [r, g, b].map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0')).join('').toUpperCase();

export function rgbToHsl({ r, g, b }: RGB) {
  const R = r / 255, G = g / 255, B = b / 255;
  const max = Math.max(R, G, B), min = Math.min(R, G, B);
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    h = max === R ? (G - B) / d + (G < B ? 6 : 0) : max === G ? (B - R) / d + 2 : (R - G) / d + 4;
    h *= 60;
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function hslToRgb(h: number, s: number, l: number): RGB {
  const S = s / 100, L = l / 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = S * Math.min(L, 1 - L);
  const f = (n: number) => L - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return { r: Math.round(f(0) * 255), g: Math.round(f(8) * 255), b: Math.round(f(4) * 255) };
}

export function rgbToCmyk({ r, g, b }: RGB) {
  const R = r / 255, G = g / 255, B = b / 255;
  const k = 1 - Math.max(R, G, B);
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
  return { c: Math.round(((1 - R - k) / (1 - k)) * 100), m: Math.round(((1 - G - k) / (1 - k)) * 100), y: Math.round(((1 - B - k) / (1 - k)) * 100), k: Math.round(k * 100) };
}

/** Parse "#fff", "rgb(1,2,3)", "1, 2, 3" or "hsl(200, 50%, 40%)". */
export function parseColor(input: string): RGB | null {
  const s = input.trim().toLowerCase();
  const hex = parseHex(s);
  if (hex) return hex;
  const hsl = s.match(/^hsla?\(\s*(\d+(?:\.\d+)?)\s*,?\s*(\d+(?:\.\d+)?)%\s*,?\s*(\d+(?:\.\d+)?)%/);
  if (hsl) return hslToRgb(+hsl[1] % 360, Math.min(100, +hsl[2]), Math.min(100, +hsl[3]));
  const rgb = s.match(/^(?:rgba?\()?\s*(\d{1,3})\s*[, ]\s*(\d{1,3})\s*[, ]\s*(\d{1,3})/);
  if (rgb && [rgb[1], rgb[2], rgb[3]].every((v) => +v <= 255)) return { r: +rgb[1], g: +rgb[2], b: +rgb[3] };
  return null;
}

/** Lighter and darker versions of a colour (tints and shades). */
export function shades(c: RGB, steps = 9): string[] {
  const { h, s } = rgbToHsl(c);
  return Array.from({ length: steps }, (_, i) => toHex(hslToRgb(h, s, Math.round(95 - (i * 85) / (steps - 1)))));
}

/** WCAG relative luminance and whether white or black text reads better. */
export function readableText(c: RGB): '#000000' | '#FFFFFF' {
  const lin = (v: number) => {
    const x = v / 255;
    return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
  };
  const L = 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b);
  return L > 0.179 ? '#000000' : '#FFFFFF';
}
