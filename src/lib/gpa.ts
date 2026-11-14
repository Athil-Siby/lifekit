/** Common US 4.0 letter-grade scale. */
export const LETTER_POINTS: Record<string, number> = {
  'A+': 4.0, A: 4.0, 'A-': 3.7, 'B+': 3.3, B: 3.0, 'B-': 2.7, 'C+': 2.3, C: 2.0, 'C-': 1.7, 'D+': 1.3, D: 1.0, 'D-': 0.7, F: 0,
};

export interface Course {
  credits: number;
  points: number;
}

/** Credit-weighted average. Courses with no credits are ignored. */
export function weightedGpa(courses: Course[], prior?: { gpa: number; credits: number }): { gpa: number; credits: number } {
  let pts = 0;
  let cr = 0;
  for (const c of courses) {
    if (!(c.credits > 0) || !Number.isFinite(c.points)) continue;
    pts += c.points * c.credits;
    cr += c.credits;
  }
  if (prior && prior.credits > 0 && Number.isFinite(prior.gpa)) {
    pts += prior.gpa * prior.credits;
    cr += prior.credits;
  }
  return { gpa: cr ? pts / cr : NaN, credits: cr };
}
