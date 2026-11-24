/**
 * Indian income tax for individuals, FY 2025-26 (AY 2026-27), as announced in Budget 2025.
 * Tax rules change in each Budget, so the year is shown clearly in the tool.
 */
export const TAX_YEAR = 'FY 2025-26 (AY 2026-27)';

type Slab = [upTo: number, rate: number];
const NEW_SLABS: Slab[] = [[4e5, 0], [8e5, 0.05], [12e5, 0.1], [16e5, 0.15], [20e5, 0.2], [24e5, 0.25], [Infinity, 0.3]];
const OLD_SLABS: Record<'below60' | '60to80' | 'above80', Slab[]> = {
  below60: [[2.5e5, 0], [5e5, 0.05], [10e5, 0.2], [Infinity, 0.3]],
  '60to80': [[3e5, 0], [5e5, 0.05], [10e5, 0.2], [Infinity, 0.3]],
  above80: [[5e5, 0], [10e5, 0.2], [Infinity, 0.3]],
};

export function slabTax(income: number, slabs: Slab[]): number {
  let tax = 0, prev = 0;
  for (const [upTo, rate] of slabs) {
    if (income <= prev) break;
    tax += (Math.min(income, upTo) - prev) * rate;
    prev = upTo;
  }
  return tax;
}

/** Surcharge with marginal relief: tax + surcharge never exceeds tax at the threshold plus the income above it. */
function surcharge(income: number, tax: number, slabs: Slab[], bands: [number, number][]) {
  let rate = 0, threshold = 0;
  for (const [t, r] of bands) if (income > t) { rate = r; threshold = t; }
  if (!rate) return 0;
  const sur = tax * rate;
  const lowerRate = bands.filter(([t]) => t < threshold).reduce((_r, [, x]) => x, 0);
  const taxAtThreshold = slabTax(threshold, slabs);
  const capTotal = taxAtThreshold * (1 + lowerRate) + (income - threshold);
  return Math.max(0, Math.min(sur, capTotal - tax));
}

export interface TaxInput {
  grossIncome: number;
  salaried: boolean;
  age: 'below60' | '60to80' | 'above80';
  /** Old regime only: 80C (capped at 1.5L), 80D, HRA, home-loan interest etc. */
  deductions80C: number;
  otherDeductions: number;
}

export interface TaxResult { taxable: number; slabTax: number; rebate: number; surcharge: number; cess: number; total: number }

export function newRegime(i: TaxInput): TaxResult {
  const taxable = Math.max(0, i.grossIncome - (i.salaried ? 75000 : 0));
  const base = slabTax(taxable, NEW_SLABS);
  let rebate = 0;
  if (taxable <= 12e5) rebate = Math.min(base, 60000);
  else rebate = Math.max(0, base - (taxable - 12e5)); // marginal relief just above ₹12 lakh
  const afterRebate = base - rebate;
  const sur = surcharge(taxable, afterRebate, NEW_SLABS, [[5e6, 0.1], [1e7, 0.15], [2e7, 0.25]]);
  const cess = (afterRebate + sur) * 0.04;
  return { taxable, slabTax: base, rebate, surcharge: sur, cess, total: Math.round(afterRebate + sur + cess) };
}

export function oldRegime(i: TaxInput): TaxResult {
  const ded = (i.salaried ? 50000 : 0) + Math.min(150000, Math.max(0, i.deductions80C)) + Math.max(0, i.otherDeductions);
  const taxable = Math.max(0, i.grossIncome - ded);
  const slabs = OLD_SLABS[i.age];
  const base = slabTax(taxable, slabs);
  const rebate = taxable <= 5e5 ? Math.min(base, 12500) : 0;
  const afterRebate = base - rebate;
  const sur = surcharge(taxable, afterRebate, slabs, [[5e6, 0.1], [1e7, 0.15], [2e7, 0.25], [5e7, 0.37]]);
  const cess = (afterRebate + sur) * 0.04;
  return { taxable, slabTax: base, rebate, surcharge: sur, cess, total: Math.round(afterRebate + sur + cess) };
}
