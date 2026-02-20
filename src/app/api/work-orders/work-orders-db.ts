import type { WorkOrder, Worker, WorkOrderStatus, PriorityLevel, OrderService, OrderPart, TimelineEvent } from '@/features/work-orders/types';
import { computeTotalAmount, normalizePlate } from '@/features/work-orders/utils';

const names = ['Nguyen Van Minh', 'Tran Thi Lan', 'Pham Quoc Hung', 'Le Thanh Tuan', 'Hoang Anh', 'Vo Minh Duc', 'Bui Thanh Nam', 'Dang Thi Mai'];
const workersSeed = ['Nguyen Tuan', 'Tran Kiet', 'Le Huy', 'Pham Son', 'Do Dat', 'Vo Duy', 'Bui Thai', 'Dang Phuc'];
const platePrefixes = ['29A', '30F', '51H', '43B', '60K', '88A'];
const serviceNames = ['Oil Change', 'Brake Service', 'Engine Diagnostic', 'Battery Replacement', 'AC Service', 'Tire Rotation'];
const partNames = ['Engine Oil 5W-30', 'Brake Pad Set', 'Oil Filter', 'Spark Plug', 'Car Battery 12V', 'Air Filter'];

function toIsoDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

function buildPlate(index: number): string {
  const prefix = platePrefixes[index % platePrefixes.length];
  const suffix = String(10000 + index * 83).slice(-5);
  return `${prefix}-${suffix}`;
}

function pickStatus(index: number): WorkOrderStatus {
  const map: WorkOrderStatus[] = ['ASSIGNED', 'IN_PROGRESS', 'WAITING_PARTS', 'READY_FOR_PAYMENT', 'COMPLETED', 'CANCELLED'];
  return map[index % map.length];
}

function pickPriority(index: number): PriorityLevel {
  if (index % 8 === 0) return 'URGENT';
  if (index % 3 === 0) return 'HIGH';
  return 'NORMAL';
}

function randomServices(index: number): OrderService[] {
  const count = (index % 3) + 1;

  return Array.from({ length: count }).map((_, i) => ({
    id: `svc-${index}-${i}`,
    name: serviceNames[(index + i) % serviceNames.length],
    price: 700_000 + ((index + i * 3) % 11) * 450_000
  }));
}

function randomParts(index: number): OrderPart[] {
  const count = index % 4;

  return Array.from({ length: count }).map((_, i) => ({
    id: `part-${index}-${i}`,
    partName: partNames[(index + i * 2) % partNames.length],
    quantity: (i % 3) + 1,
    unitPrice: 150_000 + ((index + i * 2) % 8) * 120_000
  }));
}

function timelineFor(status: WorkOrderStatus, createdAt: string): TimelineEvent[] {
  const all: WorkOrderStatus[] = ['ASSIGNED', 'IN_PROGRESS', 'WAITING_PARTS', 'READY_FOR_PAYMENT', 'COMPLETED'];
  const end = status === 'CANCELLED' ? 1 : all.indexOf(status) + 1;
  const base = new Date(createdAt).getTime();

  const timeline = all.slice(0, Math.max(1, end)).map((s, i) => ({
    status: s,
    timestamp: new Date(base + i * 1000 * 60 * 55).toISOString()
  }));

  if (status === 'CANCELLED') {
    timeline.push({ status: 'CANCELLED', timestamp: new Date(base + 1000 * 60 * 80).toISOString() });
  }

  return timeline;
}

const generated: WorkOrder[] = Array.from({ length: 84 }).map((_, index) => {
  const id = `wo-${index + 1}`;
  const status = pickStatus(index + 1);
  const createdAt = toIsoDaysAgo(30 - (index % 28));
  const services = randomServices(index + 1);
  const parts = randomParts(index + 1);
  const totalAmount = computeTotalAmount(services, parts);
  const estimatedTimeMinutes = 60 + (index % 7) * 45;
  const estimatedFinish = new Date(new Date(createdAt).getTime() + estimatedTimeMinutes * 60 * 1000).toISOString();
  const isOverdue =
    ['ASSIGNED', 'IN_PROGRESS', 'WAITING_PARTS', 'READY_FOR_PAYMENT'].includes(status) && new Date(estimatedFinish).getTime() < Date.now();

  return {
    id,
    orderCode: `WO-${String(index + 1).padStart(6, '0')}`,
    plateNumber: buildPlate(index + 1),
    customerName: names[index % names.length],
    customerPhone: `09${String(10000000 + index * 97).slice(0, 8)}`,
    workerId: `w-${(index % workersSeed.length) + 1}`,
    workerName: workersSeed[index % workersSeed.length],
    services,
    parts,
    status,
    priority: pickPriority(index + 1),
    estimatedTimeMinutes,
    estimatedFinish,
    totalAmount,
    isOverdue,
    timeline: timelineFor(status, createdAt),
    notes: index % 10 === 0 ? 'Customer waiting in lounge.' : undefined,
    cancellationReason: status === 'CANCELLED' ? 'Customer requested cancellation.' : undefined,
    createdAt,
    updatedAt: toIsoDaysAgo(2 + (index % 6))
  };
});

function computeWorkers(items: WorkOrder[]): Worker[] {
  return workersSeed.map((name, index) => {
    const id = `w-${index + 1}`;
    const activeJobs = items.filter((item) => item.workerId === id && !['COMPLETED', 'CANCELLED'].includes(item.status)).length;

    return {
      id,
      name,
      activeJobs,
      avatar: undefined
    };
  });
}

export let workOrdersDB: WorkOrder[] = generated;
export let workersDB: Worker[] = computeWorkers(generated);

export function refreshWorkers(): void {
  workersDB = computeWorkers(workOrdersDB);
}

export function nextOrderCode(): string {
  const max = workOrdersDB.reduce((acc, item) => {
    const parsed = Number(item.orderCode.replace('WO-', ''));
    return Number.isFinite(parsed) ? Math.max(acc, parsed) : acc;
  }, 0);

  return `WO-${String(max + 1).padStart(6, '0')}`;
}

export function findDuplicatePlate(plateNumber: string): WorkOrder | undefined {
  const normalized = normalizePlate(plateNumber);
  return workOrdersDB.find((item) => normalizePlate(item.plateNumber) === normalized);
}
