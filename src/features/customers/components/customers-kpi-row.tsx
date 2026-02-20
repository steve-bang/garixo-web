import { Crown, Repeat, UserCheck, Users } from 'lucide-react';

import { Card } from '@/components/ui/card';
import type { CustomerKpis } from '@/features/customers/types';
import { formatCurrencyVnd } from '@/features/customers/utils';

type CustomersKpiRowProps = {
  kpis: CustomerKpis;
};

export function CustomersKpiRow({ kpis }: CustomersKpiRowProps): JSX.Element {
  const items = [
    { label: 'Total Customers', value: String(kpis.totalCustomers), icon: Users, tone: 'text-text-primary' },
    { label: 'Active This Month', value: String(kpis.activeThisMonth), icon: UserCheck, tone: 'text-state-success' },
    { label: 'Returning Rate', value: `${kpis.returningRate}%`, icon: Repeat, tone: 'text-text-primary' },
    { label: 'Top Spender', value: formatCurrencyVnd(kpis.topSpender), icon: Crown, tone: 'text-warning-700 dark:text-warning-300' }
  ] as const;

  return (
    <section className="grid gap-s4 md:grid-cols-2 xl:grid-cols-4" aria-label="Customers KPI summary">
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
