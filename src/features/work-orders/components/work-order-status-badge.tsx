import { WorkOrderStatusEnum } from '@/features/work-orders/types';
import type { WorkOrderStatus } from '@/features/work-orders/types';

const STATUS_LABELS: Record<WorkOrderStatus, string> = {
  [WorkOrderStatusEnum.Draft]: 'Draft',
  [WorkOrderStatusEnum.WaitingForApproval]: 'Waiting For Approval',
  [WorkOrderStatusEnum.InProgress]: 'In Progress',
  [WorkOrderStatusEnum.WaitingForParts]: 'Waiting For Parts',
  [WorkOrderStatusEnum.Completed]: 'Completed',
  [WorkOrderStatusEnum.Paid]: 'Paid',
  [WorkOrderStatusEnum.Cancelled]: 'Cancelled'
};

const STATUS_TONES: Record<WorkOrderStatus, string> = {
  [WorkOrderStatusEnum.Draft]:
    'border-border bg-surface-hover text-text-secondary',
  [WorkOrderStatusEnum.WaitingForApproval]:
    'border-warning-200 bg-warning-100 text-warning-800',
  [WorkOrderStatusEnum.WaitingForParts]:
    'border-primary-200 bg-primary-100 text-primary-800',
  [WorkOrderStatusEnum.InProgress]: 'border-info-200 bg-info-100 text-info-800',
  [WorkOrderStatusEnum.Completed]:
    'border-success-200 bg-success-100 text-success-800',
  [WorkOrderStatusEnum.Paid]:
    'border-success-300 bg-success-50 text-success-800',
  [WorkOrderStatusEnum.Cancelled]:
    'border-error-200 bg-error-100 text-error-800'
};

type WorkOrderStatusBadgeProps = {
  status: WorkOrderStatus;
  className?: string;
};

export function WorkOrderStatusBadge({
  status,
  className = ''
}: WorkOrderStatusBadgeProps): JSX.Element {
  return (
    <span
      className={`inline-flex items-center rounded-md border px-s3 py-s1 text-small font-semibold ${STATUS_TONES[status]} ${className}`.trim()}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
