/** Investment and tax maths (pure functions). Rates are percentages, e.g. 12 for 12%. */

/** SIP: monthly investment at the start of each month, compounded monthly. */
export function sip(monthly: number, annualRate: number, years: number) {
  const n = Math.round(years * 12);
  const i = annualRate / 100 / 12;
  const invested = monthly * n;
  const value = i === 0 ? invested : monthly * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
  const yearly: { year: number; invested: number; value: number }[] = [];
  for (let y = 1; y <= Math.ceil(years); y++) {
    const m = Math.min(n, y * 12);
    yearly.push({ year: y, invested: monthly * m, value: i === 0 ? monthly * m : monthly * ((Math.pow(1 + i, m) - 1) / i) * (1 + i) });
  }
  return { invested, value, gains: value - invested, yearly };
}

/** Lump sum growth with annual compounding. */
export function lumpSum(amount: number, annualRate: number, years: number) {
  const value = amount * Math.pow(1 + annualRate / 100, years);
  return { invested: amount, value, gains: value - amount };
}

/**
 * Compound interest with optional regular monthly contributions (added at month end).
 * `perYear` = compounding periods per year (1, 4, 12, 365).
 */
export function compound(principal: number, annualRate: number, years: number, perYear: number, monthly = 0) {
  const r = annualRate / 100;
  const months = Math.round(years * 12);
  // Effective monthly growth factor for the chosen compounding frequency.
  const g = Math.pow(1 + r / perYear, perYear / 12);
  let bal = principal;
  let contributed = principal;
  const yearly: { year: number; contributed: number; balance: number; interest: number }[] = [];
  for (let m = 1; m <= months; m++) {
    bal = bal * g + monthly;
    contributed += monthly;
    if (m % 12 === 0 || m === months) {
      yearly.push({ year: Math.ceil(m / 12), contributed, balance: bal, interest: bal - contributed });
    }
  }
  return { balance: bal, contributed, interest: bal - contributed, yearly };
}

/** GST / VAT: add to a net amount, or extract from a gross (inclusive) amount. */
export function gst(amount: number, ratePct: number, mode: 'add' | 'remove') {
  if (mode === 'add') {
    const tax = (amount * ratePct) / 100;
    return { net: amount, tax, gross: amount + tax };
  }
  const net = amount / (1 + ratePct / 100);
  return { net, tax: amount - net, gross: amount };
}
