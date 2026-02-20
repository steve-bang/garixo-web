import { AlertTriangle, Car, CircleDollarSign, Wrench } from 'lucide-react';

import { Card } from '@/components/ui/card';
import type { VehicleKpis } from '@/features/vehicles/types';
import { formatCurrencyVnd } from '@/features/vehicles/utils';

type VehiclesKpiRowProps = {
  kpis: VehicleKpis;
};

export function VehiclesKpiRow({ kpis }: VehiclesKpiRowProps): JSX.Element {
  const items = [
    { label: 'Total Vehicles', value: String(kpis.totalVehicles), icon: Car, tone: 'text-text-primary' },
    { label: 'In Service', value: String(kpis.inService), icon: Wrench, tone: 'text-info-700 dark:text-info-300' },
    { label: 'Overdue', value: String(kpis.overdue), icon: AlertTriangle, tone: 'text-state-error' },
    { label: 'Total Revenue', value: formatCurrencyVnd(kpis.totalRevenue), icon: CircleDollarSign, tone: 'text-state-success' }
  ] as const;

  return (
    <section className="grid gap-s4 md:grid-cols-2 xl:grid-cols-4" aria-label="Vehicles KPI summary">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <Card key={item.label} className="p-s6 shadow-sm">
            <div className="flex items-start justify-between gap-s2">
              <div>
                <p className="text-caption text-text-muted">{item.label}</p>
                <p className={`mt-s2 text-display leading-none ${item.tone}`}>{item.value}</p>
              </div>
              <span className="rounded-md bg-surface-hover p-s2 text-text-secondary">
                <Icon className="size-4" />
              </span>
            </div>
          </Card>
        );
      })}
    </section>
  );
}
