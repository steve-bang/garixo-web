import { ArrowRight, ClipboardList, Clock3, DollarSign, TrendingDown, TrendingUp } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils/cn';
import type { KpiMetric } from '@/features/dashboard/types';

type KpiGridProps = {
  items: [KpiMetric, KpiMetric, KpiMetric, KpiMetric];
};

const iconById = {
  'revenue-today': DollarSign,
  'revenue-month': TrendingUp,
  'orders-today': ClipboardList,
  'pending-jobs': Clock3
} as const;

export function KpiGrid({ items }: KpiGridProps): JSX.Element {
  return (
    <section aria-label="Financial and Operations KPIs" className="grid gap-s4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => {
        const Icon = iconById[item.id];
        const isRevenue = item.id === 'revenue-today' || item.id === 'revenue-month';

        return (
          <Card key={item.id} className="p-s4">
            <div className="flex items-start justify-between gap-s3">
              <div>
                <p className="text-caption text-text-muted">{item.label}</p>
                <p
                  className={cn(
                    'mt-s2 font-semibold tabular-nums',
                    isRevenue ? 'text-display leading-none text-text-primary' : 'text-h2 text-text-primary',
                    item.tone === 'warning' ? 'text-warning-700 dark:text-warning-300' : ''
                  )}
                >
                  {item.value}
                </p>
              </div>
              <span className="rounded-md bg-surface-hover p-s2 text-text-secondary">
                <Icon className="size-4" />
              </span>
            </div>

            <div className="mt-s3 flex items-center gap-s2 text-small">
              {item.trend === 'up' ? (
                <TrendingUp className="size-4 text-state-success" />
              ) : item.trend === 'down' ? (
                <TrendingDown className="size-4 text-state-error" />
              ) : (
                <ArrowRight className="size-4 text-text-muted" />
              )}
              <span
                className={cn(
                  item.trend === 'up' && 'text-state-success',
                  item.trend === 'down' && 'text-state-error',
                  item.trend === 'flat' && 'text-text-muted'
                )}
              >
                {item.delta}
              </span>
            </div>
          </Card>
        );
      })}
    </section>
  );
}
