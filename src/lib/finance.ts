export interface LoanResult {
  payment: number;
  totalPaid: number;
  totalInterest: number;
  schedule: { year: number; principal: number; interest: number; balance: number }[];
}

/** Monthly payment for an amortising loan. annualRate in percent. */
export function loanPayment(principal: number, annualRate: number, months: number): number {
  if (months <= 0) return NaN;
  const r = annualRate / 100 / 12;
  if (r === 0) return principal / months;
  const f = (1 + r) ** months;
  return (principal * r * f) / (f - 1);
}

export function loanSchedule(principal: number, annualRate: number, months: number): LoanResult {
  const payment = loanPayment(principal, annualRate, months);
  const r = annualRate / 100 / 12;
  let balance = principal;
  const schedule: LoanResult['schedule'] = [];
  let yp = 0;
  let yi = 0;
  for (let m = 1; m <= months; m++) {
    const interest = balance * r;
    let princ = payment - interest;
    if (m === months) princ = balance; // absorb rounding in the final payment
    balance = Math.max(0, balance - princ);
    yp += princ;
    yi += interest;
    if (m % 12 === 0 || m === months) {
      schedule.push({ year: Math.ceil(m / 12), principal: yp, interest: yi, balance });
      yp = 0;
      yi = 0;
    }
  }
  const totalPaid = payment * months;
  return { payment, totalPaid, totalInterest: totalPaid - principal, schedule };
}

export function discount(price: number, pct: number, extraPct = 0, taxPct = 0) {
  const afterFirst = price * (1 - pct / 100);
  const afterExtra = afterFirst * (1 - extraPct / 100);
  const tax = afterExtra * (taxPct / 100);
  const final = afterExtra + tax;
  return { final, saved: price - afterExtra, tax, effectivePct: price ? ((price - afterExtra) / price) * 100 : 0 };
}

export function tip(bill: number, pct: number, people: number, roundUp = false) {
  const n = Math.max(1, Math.floor(people));
  let tipAmount = bill * (pct / 100);
  let total = bill + tipAmount;
  let perPerson = total / n;
  if (roundUp) {
    perPerson = Math.ceil(perPerson);
    total = perPerson * n;
    tipAmount = total - bill;
  }
  return { tip: tipAmount, total, perPerson, tipPerPerson: tipAmount / n };
}
