/**
 * Scientific expression evaluator (no eval()).
 * Supports + − × ÷ ^, brackets, unary minus, postfix ! and %, constants π and e,
 * functions sin cos tan asin acos atan sinh cosh tanh ln log sqrt cbrt abs exp, and implicit multiplication (2π, 3(4)).
 */
export class SciError extends Error {}

const FUNCS: Record<string, (x: number) => number> = {
  sqrt: Math.sqrt, cbrt: Math.cbrt, abs: Math.abs, exp: Math.exp, ln: Math.log, log: Math.log10,
  sinh: Math.sinh, cosh: Math.cosh, tanh: Math.tanh,
};
const TRIG = ['sin', 'cos', 'tan'];
const ATRIG = ['asin', 'acos', 'atan'];

type Tok = { t: 'num'; v: number } | { t: 'op'; v: string } | { t: 'fn'; v: string } | { t: 'lp' } | { t: 'rp' } | { t: 'post'; v: '!' | '%' };

export function tokenizeSci(src: string): Tok[] {
  const s = src.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-').replace(/π/g, 'pi').replace(/√/g, 'sqrt').replace(/\s+/g, '').toLowerCase();
  const out: Tok[] = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (/[0-9.]/.test(c)) {
      let j = i;
      while (j < s.length && /[0-9.]/.test(s[j])) j++;
      const str = s.slice(i, j);
      if ((str.match(/\./g) ?? []).length > 1 || str === '.') throw new SciError('Invalid number');
      out.push({ t: 'num', v: Number(str) });
      i = j;
    } else if (/[a-z]/.test(c)) {
      let j = i;
      while (j < s.length && /[a-z]/.test(s[j])) j++;
      let word = s.slice(i, j);
      // Split runs like "pie" or "esin" greedily from the left.
      while (word) {
        const name = ['asin', 'acos', 'atan', 'sinh', 'cosh', 'tanh', 'sqrt', 'cbrt', 'sin', 'cos', 'tan', 'abs', 'exp', 'log', 'ln', 'pi', 'e'].find((n) => word.startsWith(n));
        if (!name) throw new SciError(`Unknown name “${word}”`);
        if (name === 'pi') out.push({ t: 'num', v: Math.PI });
        else if (name === 'e') out.push({ t: 'num', v: Math.E });
        else out.push({ t: 'fn', v: name });
        word = word.slice(name.length);
      }
      i = j;
    } else if ('+-*/^'.includes(c)) {
      out.push({ t: 'op', v: c });
      i++;
    } else if (c === '!' || c === '%') {
      out.push({ t: 'post', v: c });
      i++;
    } else if (c === '(') {
      out.push({ t: 'lp' });
      i++;
    } else if (c === ')') {
      out.push({ t: 'rp' });
      i++;
    } else throw new SciError(`Unexpected “${c}”`);
  }
  // Implicit multiplication: 2pi, 2(3), (2)(3), pi e, 2sin(x), 3! 2
  const res: Tok[] = [];
  for (const tok of out) {
    const prev = res[res.length - 1];
    const prevEnds = prev && (prev.t === 'num' || prev.t === 'rp' || prev.t === 'post');
    const curStarts = tok.t === 'num' || tok.t === 'lp' || tok.t === 'fn';
    if (prevEnds && curStarts) res.push({ t: 'op', v: '*' });
    res.push(tok);
  }
  return res;
}

function factorial(n: number): number {
  if (n < 0 || !Number.isInteger(n)) throw new SciError('Factorial needs a whole number ≥ 0');
  if (n > 170) return Infinity;
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

export function evaluateSci(src: string, angle: 'deg' | 'rad' = 'deg'): number {
  const toks = tokenizeSci(src);
  if (!toks.length) throw new SciError('Empty expression');
  let p = 0;
  const peek = () => toks[p];
  const toRad = (x: number) => (angle === 'deg' ? (x * Math.PI) / 180 : x);
  const fromRad = (x: number) => (angle === 'deg' ? (x * 180) / Math.PI : x);

  // expr := term (('+'|'-') term)*
  function expr(): number {
    let v = term();
    while (peek()?.t === 'op' && (peek() as { v: string }).v.match(/[+-]/)) {
      const op = (toks[p++] as { v: string }).v;
      const r = term();
      v = op === '+' ? v + r : v - r;
    }
    return v;
  }
  // term := unary (('*'|'/') unary)*
  function term(): number {
    let v = unary();
    while (peek()?.t === 'op' && (peek() as { v: string }).v.match(/[*/]/)) {
      const op = (toks[p++] as { v: string }).v;
      const r = unary();
      if (op === '/' && r === 0) throw new SciError('Can’t divide by zero');
      v = op === '*' ? v * r : v / r;
    }
    return v;
  }
  // unary := ('-'|'+') unary | power
  function unary(): number {
    const t = peek();
    if (t?.t === 'op' && (t.v === '-' || t.v === '+')) {
      p++;
      const v = unary();
      return t.v === '-' ? -v : v;
    }
    return power();
  }
  // power := postfix ('^' unary)?   (right-associative; -2^2 = -4)
  function power(): number {
    const base = postfix();
    if (peek()?.t === 'op' && (peek() as { v: string }).v === '^') {
      p++;
      return Math.pow(base, unary());
    }
    return base;
  }
  function postfix(): number {
    let v = primary();
    while (peek()?.t === 'post') {
      const op = (toks[p++] as { v: string }).v;
      v = op === '!' ? factorial(v) : v / 100;
    }
    return v;
  }
  function primary(): number {
    const t = toks[p++];
    if (!t) throw new SciError('Incomplete expression');
    if (t.t === 'num') return t.v;
    if (t.t === 'lp') {
      const v = expr();
      if (toks[p]?.t !== 'rp') throw new SciError('Missing )');
      p++;
      return v;
    }
    if (t.t === 'fn') {
      const arg = toks[p]?.t === 'lp' ? primary() : power();
      if (TRIG.includes(t.v)) {
        const r = toRad(arg);
        const val = t.v === 'sin' ? Math.sin(r) : t.v === 'cos' ? Math.cos(r) : Math.tan(r);
        // Clean up floating noise like sin(180°) = 1.2e-16.
        if (Math.abs(val) < 1e-12) return 0;
        if (t.v === 'tan' && Math.abs(val) > 1e15) throw new SciError('Undefined (tan of 90°)');
        return val;
      }
      if (ATRIG.includes(t.v)) {
        const val = t.v === 'asin' ? Math.asin(arg) : t.v === 'acos' ? Math.acos(arg) : Math.atan(arg);
        return fromRad(val);
      }
      return FUNCS[t.v](arg);
    }
    throw new SciError('Incomplete expression');
  }

  const v = expr();
  if (p < toks.length) throw new SciError(toks[p].t === 'rp' ? 'Unexpected )' : 'Invalid expression');
  if (Number.isNaN(v)) throw new SciError('Not a real number');
  return Number(v.toPrecision(14));
}
