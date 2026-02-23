import type { WorkOrder, Worker } from '@/features/work-orders/types';
import { WorkOrderStatusEnum } from '@/features/work-orders/types';
import { normalizePlate } from '@/features/work-orders/utils';
import { firebaseAdmin } from '@/lib/firebase-admin';
import { listGarageStaff } from '@/services/firebase/staff-service';

type WorkOrderFirestoreDoc = Partial<Omit<WorkOrder, 'id'>>;

function workOrdersCollection(garageId: string) {
  return firebaseAdmin.db
    .collection('garages')
    .doc(garageId)
    .collection('workOrders');
}

function withoutUndefined<T extends Record<string, unknown>>(value: T): T {
  const entries = Object.entries(value).filter(
    ([, entry]) => entry !== undefined
  );
  return Object.fromEntries(entries) as T;
}

function mapDoc(id: string, raw: WorkOrderFirestoreDoc): WorkOrder {
  const now = new Date().toISOString();
  const createdAt = raw.createdAt ?? now;
  const updatedAt = raw.updatedAt ?? createdAt;

  return {
    id,
    orderCode: raw.orderCode ?? `WO-${id.slice(0, 6).toUpperCase()}`,
    plateNumber: raw.plateNumber ?? '',
    customerId: raw.customerId,
    customerName: raw.customerName ?? '',
    customerPhone: raw.customerPhone ?? '',
    vehicleId: raw.vehicleId,
    vehicleModel: raw.vehicleModel,
    workerId: raw.workerId,
    workerName: raw.workerName,
    services: raw.services ?? [],
    parts: raw.parts ?? [],
    status: raw.status ?? WorkOrderStatusEnum.Draft,
    priority: raw.priority ?? 'NORMAL',
    estimatedTimeMinutes: raw.estimatedTimeMinutes,
    estimatedFinish: raw.estimatedFinish,
    totalAmount: raw.totalAmount ?? 0,
    isOverdue: Boolean(raw.isOverdue),
    timeline: raw.timeline ?? [],
    notes: raw.notes,
    cancellationReason: raw.cancellationReason,
    paymentMethod: raw.paymentMethod,
    createdAt,
    updatedAt
  };
}

export async function listGarageWorkOrders(
  garageId: string
): Promise<WorkOrder[]> {
  const snapshot = await workOrdersCollection(garageId).get();
  return snapshot.docs.map((doc: { id: string; data: () => unknown }) => {
    return mapDoc(doc.id, doc.data() as WorkOrderFirestoreDoc);
  });
}

export async function findGarageWorkOrderById(
  garageId: string,
  id: string
): Promise<WorkOrder | null> {
  const snapshot = await workOrdersCollection(garageId).doc(id).get();
  if (!snapshot.exists) {
    return null;
  }

  return mapDoc(snapshot.id, snapshot.data() as WorkOrderFirestoreDoc);
}

export async function createGarageWorkOrder(
  garageId: string,
  payload: Omit<WorkOrder, 'id'>
): Promise<WorkOrder> {
  const ref = workOrdersCollection(garageId).doc();
  const safePayload = withoutUndefined(payload);
  await ref.set(safePayload);
  return mapDoc(ref.id, safePayload);
}

export async function updateGarageWorkOrder(
  garageId: string,
  id: string,
  patch: Partial<Omit<WorkOrder, 'id'>>
): Promise<WorkOrder | null> {
  const ref = workOrdersCollection(garageId).doc(id);
  const current = await ref.get();
  if (!current.exists) {
    return null;
  }

  const next = {
    ...(current.data() as WorkOrderFirestoreDoc),
    ...patch,
    updatedAt: new Date().toISOString()
  };

  const safeNext = withoutUndefined(next);
  await ref.set(safeNext, { merge: true });
  return mapDoc(id, safeNext);
}

export async function nextOrderCode(garageId: string): Promise<string> {
  const items = await listGarageWorkOrders(garageId);
  const max = items.reduce((acc, item) => {
    const value = Number(item.orderCode.replace('WO-', ''));
    if (!Number.isFinite(value)) {
      return acc;
    }
    return Math.max(acc, value);
  }, 0);

  return `WO-${String(max + 1).padStart(6, '0')}`;
}

export async function findDuplicatePlate(
  garageId: string,
  plateNumber: string
): Promise<WorkOrder | undefined> {
  const normalized = normalizePlate(plateNumber);
  const items = await listGarageWorkOrders(garageId);
  return items.find((item) => normalizePlate(item.plateNumber) === normalized);
}

export async function listGarageWorkers(garageId: string): Promise<Worker[]> {
  const [orders, staff] = await Promise.all([
    listGarageWorkOrders(garageId),
    listGarageStaff(garageId)
  ]);

  const activeByWorkerId = new Map<string, number>();
  orders.forEach((order) => {
    if (!order.workerId) {
      return;
    }
    if (
      order.status === WorkOrderStatusEnum.Completed ||
      order.status === WorkOrderStatusEnum.Paid ||
      order.status === WorkOrderStatusEnum.Cancelled
    ) {
      return;
    }
    activeByWorkerId.set(
      order.workerId,
      (activeByWorkerId.get(order.workerId) ?? 0) + 1
    );
  });

  const staffWorkers: Worker[] = staff.map((item) => ({
    id: item.id,
    name: item.fullName,
    avatar: item.avatar,
    activeJobs: activeByWorkerId.get(item.id) ?? 0
  }));

  if (staffWorkers.length > 0) {
    return staffWorkers.sort((a, b) => a.name.localeCompare(b.name));
  }

  const fallback = new Map<string, Worker>();
  orders.forEach((order) => {
    if (!order.workerId || !order.workerName) {
      return;
    }
    fallback.set(order.workerId, {
      id: order.workerId,
      name: order.workerName,
      activeJobs: activeByWorkerId.get(order.workerId) ?? 0
    });
  });

  return Array.from(fallback.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
}
