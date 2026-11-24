import { useState } from 'react';
import { fuelCost } from '../lib/money3';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Form';
import { ResultRow, money, num } from './shared';

export default function FuelCostCalculator() {
  const [dist, setDist] = useState('350');
  const [mileage, setMileage] = useState('15');
  const [price, setPrice] = useState('103');
  const [people, setPeople] = useState('1');
  const [round, setRound] = useState(false);
  const D = num(dist) * (round ? 2 : 1), M = num(mileage), P = num(price);
  const r = D > 0 && M > 0 && P > 0 ? fuelCost(D, M, P, Math.round(num(people)) || 1) : null;
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="space-y-4 p-5 sm:p-6">
        <Input label="Distance (km)" inputMode="decimal" value={dist} onChange={(e) => setDist(e.target.value)} />
        <label className="flex items-center gap-2 text-sm text-fg"><input type="checkbox" checked={round} onChange={(e) => setRound(e.target.checked)} className="h-4 w-4 accent-[var(--accent)]" /> Return trip (double the distance)</label>
        <Input label="Mileage (km per litre)" inputMode="decimal" value={mileage} onChange={(e) => setMileage(e.target.value)} />
        <Input label="Fuel price (per litre)" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} />
        <Input label="Split between how many people?" inputMode="numeric" value={people} onChange={(e) => setPeople(e.target.value)} />
      </Card>
      <Card className="h-fit p-5 sm:p-6" aria-live="polite">
        {r ? (
          <div className="divide-y divide-line">
            <ResultRow label="Trip fuel cost" value={money(r.cost)} strong />
            <ResultRow label="Fuel needed" value={`${r.litres.toFixed(1)} L`} />
            <ResultRow label="Cost per person" value={money(r.perPerson)} />
            <ResultRow label="Cost per km" value={money(r.perKm)} />
          </div>
        ) : <p className="text-sm text-fg-subtle">Enter the distance, mileage and fuel price.</p>}
      </Card>
    </div>
  );
}
