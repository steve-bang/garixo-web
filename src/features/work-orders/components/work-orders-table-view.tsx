import { Eye, Pencil, XCircle } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { WorkOrderStatusEnum } from '@/features/work-orders/types';
import type { WorkOrder } from '@/features/work-orders/types';
import {
  formatCurrencyVnd,
  formatDateTime,
  statusLabel
} from '@/features/work-orders/utils';

type Props = {
  items: WorkOrder[];
  currentUserRole: 'OWNER' | 'MANAGER' | 'STAFF';
  onView: (item: WorkOrder) => void;
  onEdit: (item: WorkOrder) => void;
  onCancel: (item: WorkOrder) => void;
};

function statusTone(status: WorkOrder['status']): string {
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
  if (status === WorkOrderStatusEnum.Cancelled)
    return 'bg-error-100 text-error-800';
  return 'bg-surface-hover text-text-secondary';
}

export function WorkOrdersTableView({
  items,
  currentUserRole,
  onView,
  onEdit,
  onCancel
}: Props): JSX.Element {
  if (items.length === 0) {
    return (
      <Card className="grid min-h-[260px] place-items-center p-s6 text-center">
        <div>
          <h3 className="text-h3">No work orders yet.</h3>
          <p className="mt-s1 text-small text-text-muted">
            Create first order to start workflow tracking.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1080px] text-left text-small">
          <thead className="bg-table-header text-table-header-text">
            <tr>
              <th className="px-s4 py-s3 font-semibold">Order Code</th>
              <th className="px-s4 py-s3 font-semibold">Plate</th>
              <th className="px-s4 py-s3 font-semibold">Customer</th>
              <th className="px-s4 py-s3 font-semibold">Worker</th>
              <th className="px-s4 py-s3 font-semibold">Status</th>
              <th className="px-s4 py-s3 font-semibold">Est Finish</th>
              <th className="px-s4 py-s3 text-right font-semibold">Total</th>
              <th className="px-s4 py-s3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={item.id}
                className="h-12 border-t border-border hover:bg-surface-hover"
              >
                <td className="px-s4 py-s3 font-medium">{item.orderCode}</td>
                <td className="px-s4 py-s3 font-semibold">
                  {item.plateNumber}
                </td>
                <td className="px-s4 py-s3">{item.customerName}</td>
                <td className="px-s4 py-s3 text-text-secondary">
                  {item.workerName || '-'}
                </td>
                <td className="px-s4 py-s3">
                  <Badge variant="default" className={statusTone(item.status)}>
                    {statusLabel(item.status)}
                  </Badge>
                </td>
                <td className="px-s4 py-s3 text-text-secondary">
                  {formatDateTime(item.estimatedFinish)}
                </td>
                <td className="px-s4 py-s3 text-right font-medium tabular-nums">
                  {formatCurrencyVnd(item.totalAmount)}
                </td>
                <td className="px-s4 py-s3">
                  <div className="flex items-center gap-s1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onView(item)}
                    >
                      <Eye className="size-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onEdit(item)}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    {currentUserRole === 'OWNER' ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-state-error"
                        onClick={() => onCancel(item)}
                      >
                        <XCircle className="size-4" />
                      </Button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
