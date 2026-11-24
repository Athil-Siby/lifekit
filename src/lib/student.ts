/** Student helpers: attendance (bunk) planning and marks percentage. */

/**
 * Attendance planning.
 * - If at or above the target: how many more classes can be missed and still stay ≥ target.
 * - If below: how many classes in a row must be attended to reach the target.
 */
export function attendancePlan(attended: number, total: number, targetPct: number) {
  if (total <= 0 || attended < 0 || attended > total) throw new Error('Attended classes must be between 0 and the total.');
  const t = targetPct / 100;
  const current = (attended / total) * 100;
  if (t <= 0) return { current, canMiss: Infinity, mustAttend: 0 };
  if (t >= 1) return { current, canMiss: 0, mustAttend: attended === total ? 0 : Infinity };
  if (attended / total >= t) {
    // attended / (total + x) >= t  →  x <= attended / t - total
    const canMiss = Math.floor(attended / t - total + 1e-9);
    return { current, canMiss, mustAttend: 0 };
  }
  // (attended + y) / (total + y) >= t  →  y >= (t*total - attended) / (1 - t)
  const mustAttend = Math.ceil((t * total - attended) / (1 - t) - 1e-9);
  return { current, canMiss: 0, mustAttend };
}

export function marksPercent(rows: { scored: number; max: number }[]) {
  const valid = rows.filter((r) => r.max > 0 && r.scored >= 0 && r.scored <= r.max);
  const scored = valid.reduce((s, r) => s + r.scored, 0);
  const max = valid.reduce((s, r) => s + r.max, 0);
  return { scored, max, percent: max ? (scored / max) * 100 : 0 };
}

export function gradeFor(pct: number): string {
  if (pct >= 91) return 'A1';
  if (pct >= 81) return 'A2';
  if (pct >= 71) return 'B1';
  if (pct >= 61) return 'B2';
  if (pct >= 51) return 'C1';
  if (pct >= 41) return 'C2';
  if (pct >= 33) return 'D';
  return 'E (needs improvement)';
}
