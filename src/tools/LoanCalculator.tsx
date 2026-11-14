import { useMemo, useState } from 'react';
import { loanSchedule } from '../lib/finance';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Form';
import { Segmented } from '../components/ui/Segmented';
import { ResultRow, money, num } from './shared';

export default function LoanCalculator() {
  const [amount, setAmount] = useState('25000');
  const [rate, setRate] = useState('7.5');
  const [term, setTerm] = useState('5');
  const [unit, setUnit] = useState<'years' | 'months'>('years');
  const P = num(amount);
  const R = num(rate);
  const T = num(term);
  const months = Math.round(unit === 'years' ? T * 12 : T);
  const valid = P > 0 && R >= 0 && R <= 100 && months >= 1 && months <= 600;
  const r = useMemo(() => (valid ? loanSchedule(P, R, months) : null), [valid, P, R, months]);
  const interestShare = r ? (r.totalInterest / r.totalPaid) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-5 p-5 sm:p-6">
          <Input label="Loan amount" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} error={amount && !(P > 0) ? 'Enter an amount above 0.' : null} />
          <Input label="Interest rate (% per year)" inputMode="decimal" value={rate} onChange={(e) => setRate(e.target.value)} error={rate && !(R >= 0 && R <= 100) ? 'Enter 0 to 100.' : null} />
          <div className="grid grid-cols-[1fr_auto] items-end gap-3">
            <Input label="Loan term" inputMode="numeric" value={term} onChange={(e) => setTerm(e.target.value)} error={term && !(months >= 1 && months <= 600) ? 'Up to 50 years.' : null} />
            <Segmented label="Term unit" value={unit} onChange={setUnit} options={[{ value: 'years', label: 'Years' }, { value: 'months', label: 'Months' }]} className="mb-[3px]" />
          </div>
        </Card>
        <Card className="h-fit p-5 sm:p-6" aria-live="polite">
          {r ? (
            <>
              <div className="divide-y divide-line">
                <ResultRow label="Monthly payment (EMI)" value={money(r.payment)} strong />
                <ResultRow label="Total interest" value={money(r.totalInterest)} />
                <ResultRow label="Total amount paid" value={money(r.totalPaid)} sub={`${months} payments`} />
              </div>
              <div className="mt-4">
                <div className="flex h-3 overflow-hidden rounded-full bg-surface-3" aria-hidden>
                  <div className="bg-accent" style={{ width: `${100 - interestShare}%` }} />
                  <div className="bg-amber-400" style={{ width: `${interestShare}%` }} />
                </div>
                <div className="mt-2 flex justify-between text-xs text-fg-subtle">
                  <span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-accent" />Loan {(100 - interestShare).toFixed(0)}%</span>
                  <span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-amber-400" />Interest {interestShare.toFixed(0)}%</span>
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-fg-subtle">Enter the loan details to see your payment.</p>
          )}
        </Card>
      </div>
      {r && (
        <Card className="overflow-hidden">
          <h2 className="border-b border-line px-5 py-3.5 text-sm font-semibold text-fg">Repayment by year</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-sm">
              <thead className="bg-surface-2 text-left text-xs uppercase tracking-wide text-fg-subtle">
                <tr>
                  <th className="px-5 py-2.5 font-semibold">Year</th>
                  <th className="px-5 py-2.5 text-right font-semibold">Principal</th>
                  <th className="px-5 py-2.5 text-right font-semibold">Interest</th>
                  <th className="px-5 py-2.5 text-right font-semibold">Balance left</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line tabular-nums">
                {r.schedule.map((y) => (
                  <tr key={y.year}>
                    <td className="px-5 py-2.5 text-fg">{y.year}</td>
                    <td className="px-5 py-2.5 text-right text-fg">{money(y.principal)}</td>
                    <td className="px-5 py-2.5 text-right text-fg-muted">{money(y.interest)}</td>
                    <td className="px-5 py-2.5 text-right font-medium text-fg">{money(y.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
