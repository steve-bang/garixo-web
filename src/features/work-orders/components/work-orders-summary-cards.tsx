import { AlertTriangle, CheckCircle2, ClipboardList, Users } from 'lucide-react';

import { Card } from '@/components/ui/card';
import type { WorkOrderSummary } from '@/features/work-orders/types';

type Props = {
  summary: WorkOrderSummary;
};

export function WorkOrdersSummaryCards({ summary }: Props): JSX.Element {
  const items = [
    { label: 'Total Active Jobs', value: summary.totalActiveJobs, icon: ClipboardList, tone: 'text-text-primary' },
    { label: 'Completed Today', value: summary.completedToday, icon: CheckCircle2, tone: 'text-state-success' },
    { label: 'Overdue Jobs', value: summary.overdueJobs, icon: AlertTriangle, tone: 'text-state-error' },
    { label: 'Busy Workers', value: summary.busyWorkers, icon: Users, tone: 'text-warning-700 dark:text-warning-300' }
  ] as const;

  return (
    <section className="grid gap-s4 md:grid-cols-2 xl:grid-cols-4" aria-label="Work orders summary">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.label} className="p-s6">
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
