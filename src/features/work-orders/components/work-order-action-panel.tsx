'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { WorkOrderStatusEnum } from '@/features/work-orders/types';
import type { WorkOrderStatus } from '@/features/work-orders/types';
import {
  formatCurrencyVnd,
  formatDateTime,
  statusLabel
} from '@/features/work-orders/utils';

type WorkOrderActionPanelProps = {
  status: WorkOrderStatus;
  totalAmount: number;
  completedAt?: string;
  isSaving: boolean;
  nextStatuses: WorkOrderStatus[];
  onRequestStatusChange: (status: WorkOrderStatus) => void;
};

const ACTION_LABELS: Partial<Record<WorkOrderStatus, string>> = {
  [WorkOrderStatusEnum.WaitingForApproval]: 'Send for Approval',
  [WorkOrderStatusEnum.InProgress]: 'Start Work',
  [WorkOrderStatusEnum.WaitingForParts]: 'Mark Waiting for Parts',
  [WorkOrderStatusEnum.Completed]: 'Mark Completed',
  [WorkOrderStatusEnum.Paid]: 'Mark as Paid',
  [WorkOrderStatusEnum.Cancelled]: 'Cancel'
};

const ACTION_PRIORITY: WorkOrderStatus[] = [
  WorkOrderStatusEnum.InProgress,
  WorkOrderStatusEnum.WaitingForParts,
  WorkOrderStatusEnum.Completed,
  WorkOrderStatusEnum.Paid,
  WorkOrderStatusEnum.WaitingForApproval,
  WorkOrderStatusEnum.Cancelled,
  WorkOrderStatusEnum.Draft
];

function actionLabel(
  currentStatus: WorkOrderStatus,
  nextStatus: WorkOrderStatus
): string {
  if (
    currentStatus === WorkOrderStatusEnum.WaitingForParts &&
    nextStatus === WorkOrderStatusEnum.InProgress
  ) {
    return 'Resume Work';
  }

  return ACTION_LABELS[nextStatus] ?? `Move to ${statusLabel(nextStatus)}`;
}

export function WorkOrderActionPanel({
  status,
  totalAmount,
  completedAt,
  isSaving,
  nextStatuses,
  onRequestStatusChange
}: WorkOrderActionPanelProps): JSX.Element {
  const sortedNextStatuses = [...nextStatuses].sort(
    (a, b) => ACTION_PRIORITY.indexOf(a) - ACTION_PRIORITY.indexOf(b)
  );

  const isFinal =
    status === WorkOrderStatusEnum.Paid ||
    status === WorkOrderStatusEnum.Cancelled;

  return (
    <Card className="space-y-s4 p-s4">
      <div>
        <p className="text-caption text-text-muted">Total</p>
        <p className="mt-s1 text-h2 font-bold text-text-primary">
          {formatCurrencyVnd(totalAmount)}
        </p>
      </div>

      <div className="space-y-s2">
        <p className="text-small font-medium text-text-secondary">Status</p>
        <p className="text-small font-semibold text-text-primary">
          {statusLabel(status)}
        </p>
      </div>

      {isFinal ? (
        <div className="rounded-md border border-border bg-surface-default px-s3 py-s2">
          <p className="text-small font-semibold text-text-primary">
            {statusLabel(status)}
          </p>
          <p className="text-caption text-text-muted">
            {completedAt
              ? `Updated on ${formatDateTime(completedAt)}`
              : 'No further action available.'}
          </p>
        </div>
      ) : sortedNextStatuses.length === 0 ? (
        <div className="rounded-md border border-border bg-surface-default px-s3 py-s2">
          <p className="text-small text-text-muted">
            No status actions available.
          </p>
        </div>
      ) : (
        <div className="space-y-s2">
          {sortedNextStatuses.map((nextStatus) => (
            <Button
              key={nextStatus}
              type="button"
              className="h-11 w-full justify-start"
              variant={
                nextStatus === WorkOrderStatusEnum.Cancelled
                  ? 'secondary'
                  : 'default'
              }
              disabled={isSaving}
              onClick={() => onRequestStatusChange(nextStatus)}
            >
              {actionLabel(status, nextStatus)}
            </Button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-s2">
        <Button
          type="button"
          variant="secondary"
          className="h-10 text-small"
          disabled
        >
          Print
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="h-10 text-small text-state-error"
          disabled
        >
          Delete
        </Button>
      </div>
    </Card>
  );
}
