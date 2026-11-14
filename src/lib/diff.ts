/** Line/word diff using a longest-common-subsequence table (fine for documents up to a few thousand lines). */
export type DiffOp = { type: 'same' | 'add' | 'del'; text: string };

export function diffSequences(a: string[], b: string[], eq: (x: string, y: string) => boolean = (x, y) => x === y): DiffOp[] {
  const n = a.length, m = b.length;
  // Trim common prefix/suffix to keep the table small.
  let start = 0;
  while (start < n && start < m && eq(a[start], b[start])) start++;
  let endA = n, endB = m;
  while (endA > start && endB > start && eq(a[endA - 1], b[endB - 1])) { endA--; endB--; }
  const A = a.slice(start, endA), B = b.slice(start, endB);
  const rows = A.length, cols = B.length;
  if (rows * cols > 25_000_000) throw new Error('These texts are too large to compare in the browser.');
  const dp: Uint32Array[] = Array.from({ length: rows + 1 }, () => new Uint32Array(cols + 1));
  for (let i = rows - 1; i >= 0; i--) for (let j = cols - 1; j >= 0; j--) dp[i][j] = eq(A[i], B[j]) ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const mid: DiffOp[] = [];
  let i = 0, j = 0;
  while (i < rows && j < cols) {
    if (eq(A[i], B[j])) { mid.push({ type: 'same', text: B[j] }); i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) mid.push({ type: 'del', text: A[i++] });
    else mid.push({ type: 'add', text: B[j++] });
  }
  while (i < rows) mid.push({ type: 'del', text: A[i++] });
  while (j < cols) mid.push({ type: 'add', text: B[j++] });
  return [...a.slice(0, start).map((t) => ({ type: 'same' as const, text: t })), ...mid, ...b.slice(endB).map((t) => ({ type: 'same' as const, text: t }))];
}

export function diffLines(a: string, b: string, opts: { ignoreCase?: boolean; ignoreSpace?: boolean } = {}) {
  const norm = (s: string) => {
    let x = s;
    if (opts.ignoreSpace) x = x.replace(/\s+/g, ' ').trim();
    if (opts.ignoreCase) x = x.toLowerCase();
    return x;
  };
  return diffSequences(a.split(/\r?\n/), b.split(/\r?\n/), (x, y) => norm(x) === norm(y));
}

/** Word-level diff for highlighting changes inside a line (keeps spaces as tokens). */
export const diffWords = (a: string, b: string) => diffSequences(a.split(/(\s+)/), b.split(/(\s+)/));
