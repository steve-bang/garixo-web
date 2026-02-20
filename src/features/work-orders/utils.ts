import type { OrderPart, OrderService, WorkOrder, WorkOrderGroup, WorkOrderStatus, Worker } from '@/features/work-orders/types';

export const kanbanStatuses: Array<Exclude<WorkOrderStatus, 'CANCELLED'>> = [
  'ASSIGNED',
  'IN_PROGRESS',
  'WAITING_PARTS',
  'READY_FOR_PAYMENT',
  'COMPLETED'
];

export function normalizePlate(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export function toPlateDisplay(value: string): string {
  return value.trim().toUpperCase();
}

export function computeTotalAmount(services: OrderService[], parts: OrderPart[]): number {
  const servicesTotal = services.reduce((sum, item) => sum + item.price, 0);
  const partsTotal = parts.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  return servicesTotal + partsTotal;
}

export function formatCurrencyVnd(value: number): string {
  return `${new Intl.NumberFormat('vi-VN').format(value)} đ`;
}

export function formatDateTime(value?: string): string {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date);
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
    ASSIGNED: [],
    IN_PROGRESS: [],
    WAITING_PARTS: [],
    READY_FOR_PAYMENT: [],
    COMPLETED: []
  };

  items.forEach((item) => {
    if (item.status === 'CANCELLED') return;
    grouped[item.status].push(item);
  });

  return grouped;
}

export function statusLabel(status: WorkOrderStatus): string {
  return status
    .toLowerCase()
    .split('_')
    .map((x) => x.charAt(0).toUpperCase() + x.slice(1))
    .join(' ');
}

export function canTransitionTo(current: WorkOrderStatus, next: WorkOrderStatus, totalAmount: number): { ok: boolean; error?: string } {
  if (current === next) return { ok: true };
  if (next === 'COMPLETED') return { ok: false, error: 'Use payment flow to complete this order.' };
  if (current === 'CANCELLED' || current === 'COMPLETED') {
    return { ok: false, error: 'Completed or cancelled orders cannot change status.' };
  }
  if (next === 'CANCELLED') return { ok: false, error: 'Use cancel action to cancel this order.' };
  if (next === 'READY_FOR_PAYMENT' && totalAmount <= 0) {
    return { ok: false, error: 'Total amount must be greater than 0.' };
  }

  return { ok: true };
}

export function toSummary(items: WorkOrder[], workers: Worker[]) {
  const now = new Date();
  const today = now.toDateString();

  return {
    totalActiveJobs: items.filter((x) => x.status !== 'COMPLETED' && x.status !== 'CANCELLED').length,
    completedToday: items.filter((x) => x.status === 'COMPLETED' && new Date(x.updatedAt).toDateString() === today).length,
    overdueJobs: items.filter((x) => x.isOverdue).length,
    busyWorkers: workers.filter((x) => x.activeJobs > 3).length
  };
}
