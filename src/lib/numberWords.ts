/** Numbers to words in the Indian (lakh/crore) or international (million/billion) system. */
const ONES = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

function below1000(n: number): string {
  const h = Math.floor(n / 100), r = n % 100;
  const parts: string[] = [];
  if (h) parts.push(`${ONES[h]} hundred`);
  if (r) parts.push(r < 20 ? ONES[r] : TENS[Math.floor(r / 10)] + (r % 10 ? '-' + ONES[r % 10] : ''));
  return parts.join(' ');
}

export function intToWords(n: number, system: 'indian' | 'international'): string {
  if (!Number.isSafeInteger(n) || n < 0) throw new Error('Enter a whole number from 0 up to 9,007,199,254,740,991.');
  if (n === 0) return 'zero';
  const parts: string[] = [];
  if (system === 'indian') {
    let rest = n;
    const crore = Math.floor(rest / 1e7); rest %= 1e7;
    const lakh = Math.floor(rest / 1e5); rest %= 1e5;
    const thousand = Math.floor(rest / 1000); rest %= 1000;
    if (crore) parts.push(`${crore >= 1000 ? intToWords(crore, 'indian') : crore >= 100 ? below1000(crore) : below1000(crore)} crore`);
    if (lakh) parts.push(`${below1000(lakh)} lakh`);
    if (thousand) parts.push(`${below1000(thousand)} thousand`);
    if (rest) parts.push(below1000(rest));
  } else {
    const scales = ['', 'thousand', 'million', 'billion', 'trillion', 'quadrillion'];
    let rest = n, i = 0;
    const groups: string[] = [];
    while (rest > 0) {
      const g = rest % 1000;
      if (g) groups.unshift(below1000(g) + (scales[i] ? ' ' + scales[i] : ''));
      rest = Math.floor(rest / 1000);
      i++;
    }
    parts.push(...groups);
  }
  return parts.join(' ');
}

const cap = (s: string) => s.replace(/\b\w/g, (c) => c.toUpperCase());

/** Cheque style: "Rupees One Lakh Twenty Thousand and Fifty Paise Only". */
export function amountInWords(value: number, system: 'indian' | 'international', currency: { major: string; minor: string }) {
  const rounded = Math.round(value * 100);
  const major = Math.floor(rounded / 100), minor = rounded % 100;
  let s = `${cap(currency.major)} ${cap(intToWords(major, system))}`;
  if (minor) s += ` and ${cap(intToWords(minor, system))} ${cap(currency.minor)}`;
  return `${s} Only`;
}

/** Group digits Indian style (12,34,567) or international (1,234,567). */
export function groupDigits(n: number, system: 'indian' | 'international'): string {
  return n.toLocaleString(system === 'indian' ? 'en-IN' : 'en-US', { maximumFractionDigits: 2 });
}
