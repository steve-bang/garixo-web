import { Activity, AlertTriangle, BriefcaseBusiness, Users } from 'lucide-react';

import { Card } from '@/components/ui/card';
import type { StaffKpis } from '@/features/staff/types';

type StaffKpiRowProps = {
  kpis: StaffKpis;
};

export function StaffKpiRow({ kpis }: StaffKpiRowProps): JSX.Element {
  const items = [
    { label: 'Total Staff', value: kpis.totalStaff, icon: Users, tone: 'text-text-primary' },
    { label: 'Active Today', value: kpis.activeToday, icon: Activity, tone: 'text-state-success' },
    { label: 'Free', value: kpis.freeStaff, icon: BriefcaseBusiness, tone: 'text-text-primary' },
    { label: 'Overloaded', value: kpis.overloadedStaff, icon: AlertTriangle, tone: 'text-warning-700 dark:text-warning-300' }
  ];

  return (
    <section className="grid gap-s4 md:grid-cols-2 xl:grid-cols-4" aria-label="Staff KPIs">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <Card key={item.label} className="p-s4">
            <div className="flex items-start justify-between gap-s2">
              <div>
                <p className="text-caption text-text-muted">{item.label}</p>
                <p className={`mt-s2 text-h2 tabular-nums ${item.tone}`}>{item.value}</p>
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
