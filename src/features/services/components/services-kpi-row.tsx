import {
  BadgeDollarSign,
  CheckCircle2,
  CircleOff,
  Calculator
} from 'lucide-react';

import { Card } from '@/components/ui/card';
import type { ServiceKpis } from '@/features/services/types';
import { formatCurrency } from '@/features/services/utils';

type ServicesKpiRowProps = {
  kpis: ServiceKpis;
};

export function ServicesKpiRowSkeleton(): JSX.Element {
  return (
    <section
      className="grid gap-s4 md:grid-cols-2 xl:grid-cols-4"
      aria-label="Service KPI loading"
    >
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={`services-kpi-skeleton-${index}`} className="p-s4">
          <div className="flex items-start justify-between gap-s2">
            <div className="space-y-s2">
              <div className="h-3 w-24 animate-pulse rounded bg-surface-hover" />
              <div className="h-9 w-20 animate-pulse rounded bg-surface-hover" />
            </div>
            <span className="rounded-md bg-surface-hover p-s2">
              <div className="size-4 animate-pulse rounded bg-border" />
            </span>
          </div>
        </Card>
      ))}
    </section>
  );
}

export function ServicesKpiRow({ kpis }: ServicesKpiRowProps): JSX.Element {
  const items = [
    {
      label: 'Total Services',
      value: String(kpis.totalServices),
      icon: BadgeDollarSign,
      tone: 'text-text-primary'
    },
    {
      label: 'Active',
      value: String(kpis.activeServices),
      icon: CheckCircle2,
      tone: 'text-state-success'
    },
    {
      label: 'Inactive',
      value: String(kpis.inactiveServices),
      icon: CircleOff,
      tone: 'text-text-secondary'
    },
    {
      label: 'Average Price',
      value: formatCurrency(kpis.averagePrice),
      icon: Calculator,
      tone: 'text-text-primary'
    }
  ];

  return (
    <section
      className="grid gap-s4 md:grid-cols-2 xl:grid-cols-4"
      aria-label="Service KPI summary"
    >
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <Card key={item.label} className="p-s4">
            <div className="flex items-start justify-between gap-s2">
              <div>
                <p className="text-caption text-text-muted">{item.label}</p>
                <p className={`mt-s2 text-display leading-none ${item.tone}`}>
                  {item.value}
                </p>
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
