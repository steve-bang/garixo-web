import { AlertCircle, Boxes, PackageCheck, PackageX } from 'lucide-react';

import { Card } from '@/components/ui/card';
import type { InventoryKpis } from '@/features/inventory/types';

type InventoryKpiRowProps = {
  kpis: InventoryKpis;
};

export function InventoryKpiRow({ kpis }: InventoryKpiRowProps): JSX.Element {
  const items = [
    { label: 'Total Items', value: kpis.totalItems, icon: Boxes, tone: 'text-text-primary' },
    { label: 'In Stock', value: kpis.inStock, icon: PackageCheck, tone: 'text-state-success' },
    { label: 'Low Stock', value: kpis.lowStock, icon: AlertCircle, tone: 'text-warning-700 dark:text-warning-300' },
    { label: 'Out of Stock', value: kpis.outOfStock, icon: PackageX, tone: 'text-state-error' }
  ];

  return (
    <section className="grid gap-s4 md:grid-cols-2 xl:grid-cols-4" aria-label="Inventory KPI summary">
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
