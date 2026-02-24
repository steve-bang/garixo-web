import { AlertTriangle, Clock3 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { WorkOrderStatusEnum } from '@/features/work-orders/types';
import type {
  WorkOrder,
  WorkOrderGroup,
  WorkOrderStatus
} from '@/features/work-orders/types';
import {
  kanbanStatuses,
  statusLabel
} from '@/features/work-orders/utils';
import { formatMinutes } from '@/lib/utils/format';

type Props = {
  grouped: WorkOrderGroup;
  onCardClick: (item: WorkOrder) => void;
  onDropStatus: (id: string, status: WorkOrderStatus) => void;
};

function statusTone(status: WorkOrderStatus): string {
  if (status === WorkOrderStatusEnum.InProgress)
    return 'bg-info-100 text-info-800';
  if (status === WorkOrderStatusEnum.Completed)
    return 'bg-badge-success text-badge-success-text';
  if (status === WorkOrderStatusEnum.Paid)
    return 'bg-success-100 text-success-800';
  if (status === WorkOrderStatusEnum.WaitingForApproval)
    return 'bg-warning-100 text-warning-800';
  if (status === WorkOrderStatusEnum.WaitingForParts)
    return 'bg-primary-100 text-primary-800';
  return 'bg-surface-hover text-text-secondary';
}

function priorityTone(priority: WorkOrder['priority']): string {
  if (priority === 'URGENT') return 'bg-error-100 text-error-800';
  if (priority === 'HIGH') return 'bg-warning-100 text-warning-800';
  return 'bg-surface-hover text-text-secondary';
}

export function WorkOrdersKanbanBoard({
  grouped,
  onCardClick,
  onDropStatus
}: Props): JSX.Element {
  return (
    <div className="w-full overflow-x-auto pb-s1">
      <div
        className="grid min-w-[1680px] gap-s4"
        style={{ gridTemplateColumns: 'repeat(6, minmax(260px, 1fr))' }}
      >
        {kanbanStatuses.map((status) => (
          <Card
            key={status}
            className="h-[560px] overflow-hidden bg-background-secondary p-0"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              const id = event.dataTransfer.getData('text/plain');
              if (id) onDropStatus(id, status);
            }}
          >
            <div className="sticky top-0 z-10 border-b border-border bg-surface-default px-s3 py-s3">
              <p className="text-small font-semibold">{statusLabel(status)}</p>
              <p className="text-caption text-text-muted">
                {grouped[status].length} orders
              </p>
            </div>

            <div className="h-[calc(560px-62px)] space-y-s3 overflow-y-auto p-s3">
              {grouped[status].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  draggable
                  onDragStart={(event) =>
                    event.dataTransfer.setData('text/plain', item.id)
                  }
                  onClick={() => onCardClick(item)}
                  className={`w-full rounded-md border border-border bg-surface-default p-s3 text-left hover:bg-surface-hover ${
                    item.isOverdue
                      ? 'border-l-4 border-l-error-600 bg-error-50/30'
                      : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-s2">
                    <p className="text-[16px] font-semibold text-text-primary">
                      {item.plateNumber}
                    </p>
                  </div>

                  <p className="mt-s1 text-caption text-text-muted">
                    {item.vehicleModel || 'Model not set'}
                  </p>
                  <p className="mt-s1 text-small text-text-secondary">
                    {item.customerName}
                  </p>
                  <p className="mt-s1 text-caption text-text-muted">
                    {item.services[0]?.name || 'Service'}
                    {item.services.length > 1
                      ? ` + ${item.services.length - 1} more`
                      : ''}
                  </p>

                  <div className="mt-s2 flex items-center justify-between gap-s2 text-caption text-text-muted">
                    <span>{item.workerName || 'Unassigned'}</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock3 className="size-3" />{' '}
                      {formatMinutes(item.estimatedTimeMinutes)}
                    </span>
                  </div>

                  <div className="mt-s2 flex items-center gap-s2">
                    <Badge
                      variant="default"
                      className={priorityTone(item.priority)}
                    >
                      {item.priority}
                    </Badge>
                    {item.isOverdue ? (
                      <Badge
                        variant="default"
                        className="bg-error-100 text-error-800"
                      >
                        <AlertTriangle className="mr-1 size-3" /> Overdue
                      </Badge>
                    ) : null}
                  </div>
                </button>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
