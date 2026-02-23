import { WorkOrderStatusEnum } from '@/features/work-orders/types';
import type {
  OrderPart,
  OrderService,
  WorkOrder,
  WorkOrderGroup,
  WorkOrderStatus,
  Worker
} from '@/features/work-orders/types';

export const kanbanStatuses: Array<
  Exclude<WorkOrderStatus, typeof WorkOrderStatusEnum.Cancelled>
> = [
  WorkOrderStatusEnum.Draft,
  WorkOrderStatusEnum.WaitingForApproval,
  WorkOrderStatusEnum.InProgress,
  WorkOrderStatusEnum.WaitingForParts,
  WorkOrderStatusEnum.Completed,
  WorkOrderStatusEnum.Paid
];

export function normalizePlate(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export function toPlateDisplay(value: string): string {
  return value.trim().toUpperCase();
}

export function computeTotalAmount(
  services: OrderService[],
  parts: OrderPart[]
): number {
  const servicesTotal = services.reduce((sum, item) => sum + item.price, 0);
  const partsTotal = parts.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );
  return servicesTotal + partsTotal;
}

export function formatCurrencyVnd(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value);
}

export function formatDateTime(value?: string): string {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

export function formatDate(value?: string): string {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('en-GB').format(date);
}

export function formatMinutes(value?: number): string {
  if (!value) return '-';
  const h = Math.floor(value / 60);
  const m = value % 60;
  if (!h) return `${m}m`;
  if (!m) return `${h}h`;
  return `${h}h ${m}m`;
}

export function groupByStatus(items: WorkOrder[]): WorkOrderGroup {
  const grouped: WorkOrderGroup = {
    Draft: [],
    WaitingForApproval: [],
    InProgress: [],
    WaitingForParts: [],
    Completed: [],
    Paid: []
  };

  items.forEach((item) => {
    if (item.status === WorkOrderStatusEnum.Cancelled) return;
    grouped[item.status].push(item);
  });

  return grouped;
}

export function statusLabel(status: WorkOrderStatus): string {
  if (status === WorkOrderStatusEnum.WaitingForApproval)
    return 'Waiting For Approval';
  if (status === WorkOrderStatusEnum.WaitingForParts)
    return 'Waiting For Parts';
  if (status === WorkOrderStatusEnum.InProgress) return 'In Progress';
  return status;
}

export const allowedTransitions: Record<WorkOrderStatus, WorkOrderStatus[]> = {
  [WorkOrderStatusEnum.Draft]: [
    WorkOrderStatusEnum.WaitingForApproval,
    WorkOrderStatusEnum.Cancelled
  ],
  [WorkOrderStatusEnum.WaitingForApproval]: [
    WorkOrderStatusEnum.InProgress,
    WorkOrderStatusEnum.Cancelled
  ],
  [WorkOrderStatusEnum.InProgress]: [
    WorkOrderStatusEnum.WaitingForParts,
    WorkOrderStatusEnum.Completed
  ],
  [WorkOrderStatusEnum.WaitingForParts]: [
    WorkOrderStatusEnum.InProgress,
    WorkOrderStatusEnum.Completed
  ],
  [WorkOrderStatusEnum.Completed]: [WorkOrderStatusEnum.Paid],
  [WorkOrderStatusEnum.Paid]: [],
  [WorkOrderStatusEnum.Cancelled]: []
};

export function canTransitionTo(
  current: WorkOrderStatus,
  next: WorkOrderStatus
): { ok: boolean; error?: string } {
  if (current === next) {
    return { ok: true };
  }

  const nextStatuses = allowedTransitions[current] ?? [];
  if (!nextStatuses.includes(next)) {
    return {
      ok: false,
      error: `Invalid status transition: ${statusLabel(current)} → ${statusLabel(next)}.`
    };
  }

  return { ok: true };
}

export function toSummary(items: WorkOrder[], workers: Worker[]) {
  const now = new Date();
  const today = now.toDateString();

  return {
    totalActiveJobs: items.filter(
      (x) =>
        x.status !== WorkOrderStatusEnum.Completed &&
        x.status !== WorkOrderStatusEnum.Paid &&
        x.status !== WorkOrderStatusEnum.Cancelled
    ).length,
    completedToday: items.filter(
      (x) =>
        (x.status === WorkOrderStatusEnum.Completed ||
          x.status === WorkOrderStatusEnum.Paid) &&
        new Date(x.updatedAt).toDateString() === today
    ).length,
    overdueJobs: items.filter((x) => x.isOverdue).length,
    busyWorkers: workers.filter((x) => x.activeJobs > 3).length
  };
}
