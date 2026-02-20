import { Copy, Pencil, ToggleLeft, ToggleRight, Trash2, Wrench } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { Service } from '@/features/services/types';
import { formatCurrency } from '@/features/services/utils';
import { cn } from '@/lib/utils/cn';

type ServicesTableProps = {
  services: Service[];
  highlightedId?: string | null;
  onAddFirst: () => void;
  onEdit: (service: Service) => void;
  onDuplicate: (service: Service) => void;
  onDelete: (service: Service) => void;
  onToggleStatus: (service: Service) => void;
};

export function ServicesTable({
  services,
  highlightedId,
  onAddFirst,
  onEdit,
  onDuplicate,
  onDelete,
  onToggleStatus
}: ServicesTableProps): JSX.Element {
  if (services.length === 0) {
    return (
      <Card className="grid min-h-[240px] place-items-center p-s6 text-center">
        <div className="space-y-s2">
          <div className="mx-auto grid size-10 place-items-center rounded-full bg-surface-hover text-text-secondary">
            <Wrench className="size-5" />
          </div>
          <h3 className="text-h3">No services created yet.</h3>
          <p className="text-small text-text-muted">Add your first service to start pricing management.</p>
          <div className="pt-s2">
            <Button onClick={onAddFirst}>Add your first service</Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1060px] text-left text-small">
          <thead className="bg-table-header text-table-header-text">
            <tr>
              <th className="px-s4 py-s3 font-semibold">Service Name</th>
              <th className="px-s4 py-s3 font-semibold">Category</th>
              <th className="px-s4 py-s3 text-right font-semibold">Price</th>
              <th className="px-s4 py-s3 font-semibold">Estimated Time</th>
              <th className="px-s4 py-s3 font-semibold">Status</th>
              <th className="px-s4 py-s3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service) => {
              const isInactive = service.status === 'INACTIVE';

              return (
                <tr
                  key={service.id}
                  className={cn(
                    'border-t border-border bg-surface-default transition-colors hover:bg-surface-hover',
                    isInactive ? 'text-text-muted' : 'text-text-primary',
                    highlightedId === service.id ? 'bg-primary-50/70' : ''
                  )}
                >
                  <td className="px-s4 py-s3">
                    <div>
                      <p className="font-medium">{service.name}</p>
                      {service.description ? <p className="text-caption text-text-muted">{service.description}</p> : null}
                    </div>
                  </td>
                  <td className="px-s4 py-s3">{service.category}</td>
                  <td className="px-s4 py-s3 text-right tabular-nums">{formatCurrency(service.price)}</td>
                  <td className="px-s4 py-s3">{service.estimatedTime}</td>
                  <td className="px-s4 py-s3">
                    <Badge variant={service.status === 'ACTIVE' ? 'success' : 'default'}>{service.status}</Badge>
                  </td>
                  <td className="px-s4 py-s3">
                    <div className="flex flex-wrap items-center gap-s2">
                      <Button size="sm" variant="ghost" onClick={() => onEdit(service)}>
                        <Pencil className="size-4" />
                        Edit
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => onDuplicate(service)}>
                        <Copy className="size-4" />
                        Duplicate
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => onToggleStatus(service)}>
                        {service.status === 'ACTIVE' ? <ToggleRight className="size-4" /> : <ToggleLeft className="size-4" />}
                        {service.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-state-error"
                        disabled={Boolean(service.usedInWorkOrder)}
                        onClick={() => onDelete(service)}
                      >
                        <Trash2 className="size-4" />
                        Delete
                      </Button>
                    </div>
                    {service.usedInWorkOrder ? <p className="mt-s1 text-caption text-text-muted">Used in work order</p> : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
