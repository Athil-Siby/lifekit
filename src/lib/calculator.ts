/**
 * Safe arithmetic evaluator for the calculator (no eval()).
 * Supports + − × ÷, parentheses, unary minus, decimals and postfix %.
 * Percent follows everyday calculator rules:
 *   200 + 10%  = 220   (adds 10% of 200)
 *   200 − 10%  = 180
 *   200 × 10%  = 20
 *   50%        = 0.5
 */
export class CalcError extends Error {}

type Tok = { t: 'num'; v: number } | { t: 'op'; v: string } | { t: 'pct' } | { t: 'lp' } | { t: 'rp' };

export function tokenize(src: string): Tok[] {
  const s = src.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-').replace(/\s+/g, '');
  const out: Tok[] = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (/[0-9.]/.test(c)) {
      let j = i;
      while (j < s.length && /[0-9.]/.test(s[j])) j++;
      let num = s.slice(i, j);
      if (j < s.length && /e/i.test(s[j]) && /[-+0-9]/.test(s[j + 1] ?? '')) {
        let k = j + 1;
        if (/[-+]/.test(s[k])) k++;
        while (k < s.length && /[0-9]/.test(s[k])) k++;
        num = s.slice(i, k);
        j = k;
      }
      if ((num.match(/\./g) ?? []).length > 1 || num === '.') throw new CalcError('Invalid number');
      out.push({ t: 'num', v: Number(num) });
      i = j;
    } else if ('+-*/'.includes(c)) {
      out.push({ t: 'op', v: c });
      i++;
    } else if (c === '%') {
      out.push({ t: 'pct' });
      i++;
    } else if (c === '(') {
      out.push({ t: 'lp' });
      i++;
    } else if (c === ')') {
      out.push({ t: 'rp' });
      i++;
    } else {
      throw new CalcError(`Unexpected "${c}"`);
    }
  }
  return out;
}

interface Val {
  v: number;
  /** Set when the value is a bare "n%" so + and − can apply it relative to the left side. */
  pct?: number;
}

export function evaluate(src: string): number {
  const toks = tokenize(src);
  if (toks.length === 0) throw new CalcError('Empty');
  let pos = 0;
  const peek = () => toks[pos];

  const factor = (): Val => {
    const tk = peek();
    if (!tk) throw new CalcError('Incomplete expression');
    if (tk.t === 'op' && (tk.v === '-' || tk.v === '+')) {
      pos++;
      const f = factor();
      return tk.v === '-' ? { v: -f.v, pct: f.pct !== undefined ? -f.pct : undefined } : f;
    }
    let base: number;
    if (tk.t === 'num') {
      pos++;
      base = tk.v;
    } else if (tk.t === 'lp') {
      pos++;
      base = expr();
      if (peek()?.t !== 'rp') throw new CalcError('Missing )');
      pos++;
    } else {
      throw new CalcError('Incomplete expression');
    }
    if (peek()?.t === 'pct') {
      pos++;
      return { v: base / 100, pct: base };
    }
    return { v: base };
  };

  const term = (): Val => {
    let left = factor();
    let single = true;
    while (peek()?.t === 'op' && (peek() as { v: string }).v.match(/[*/]/)) {
      const op = (toks[pos++] as { v: string }).v;
      const right = factor();
      single = false;
      if (op === '/' && right.v === 0) throw new CalcError("Can't divide by zero");
      left = { v: op === '*' ? left.v * right.v : left.v / right.v };
    }
    return single ? left : { v: left.v };
  };

  const expr = (): number => {
    let left = term().v;
    while (peek()?.t === 'op' && (peek() as { v: string }).v.match(/[+-]/)) {
      const op = (toks[pos++] as { v: string }).v;
      const right = term();
      const amount = right.pct !== undefined ? (left * right.pct) / 100 : right.v;
      left = op === '+' ? left + amount : left - amount;
    }
    return left;
  };

  const result = expr();
  if (pos < toks.length) throw new CalcError('Unexpected input');
  if (!Number.isFinite(result)) throw new CalcError('Result is too large');
  return cleanFloat(result);
}

/** Removes floating-point noise: 0.1 + 0.2 → 0.3. */
export function cleanFloat(n: number): number {
  if (n === 0) return 0;
  return Number(n.toPrecision(12));
}
