/** Fixed and recurring deposits (Indian banks compound quarterly), fuel cost. */
export function fixedDeposit(principal: number, ratePct: number, years: number, perYear = 4) {
  const maturity = principal * Math.pow(1 + ratePct / 100 / perYear, perYear * years);
  return { maturity, interest: maturity - principal };
}

/** RD: monthly deposits, quarterly compounding (the method Indian banks use). */
export function recurringDeposit(monthly: number, ratePct: number, months: number) {
  const r = ratePct / 100;
  let maturity = 0;
  for (let k = 1; k <= months; k++) maturity += monthly * Math.pow(1 + r / 4, (4 * k) / 12);
  const invested = monthly * months;
  return { maturity, invested, interest: maturity - invested };
}

export function fuelCost(distanceKm: number, mileageKmPerL: number, pricePerL: number, people = 1) {
  const litres = distanceKm / mileageKmPerL;
  const cost = litres * pricePerL;
  return { litres, cost, perPerson: cost / Math.max(1, people), perKm: cost / distanceKm };
}
