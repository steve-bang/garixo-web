import type { WorkOrder, Worker } from '@/features/work-orders/types';
import type { PlanCode } from '@/features/billing/types';
import { WorkOrderStatusEnum } from '@/features/work-orders/types';
import { normalizePlate } from '@/features/work-orders/utils';
import { firebaseAdmin } from '@/lib/firebase-admin';
import type {
  GarageBillingDocument,
  GarageUsageCurrentDocument
} from '@/types/firebase-models';
import { listGarageStaff } from '@/services/firebase/staff-service';

type WorkOrderFirestoreDoc = Partial<Omit<WorkOrder, 'id'>>;
type WorkOrderUsageState = {
  counters: NonNullable<GarageUsageCurrentDocument['counters']>;
  workOrdersIndex: number;
  currentCount: number;
  limit: number;
  enabled: boolean;
};

const BILLING_DOC_ID = 'current';
const USAGE_DOC_ID = 'current';
const WORK_ORDERS_COUNTER_KEY = 'workOrders';

const PLAN_WORK_ORDER_LIMITS: Record<PlanCode, number> = {
  free: 25,
  starter: -1,
  growth: -1
};

export class WorkOrderUsageLimitExceededError extends Error {
  constructor(message = 'Work order limit reached for current plan.') {
    super(message);
    this.name = 'WorkOrderUsageLimitExceededError';
  }
}

export class WorkOrderFeatureDisabledError extends Error {
  constructor(message = 'Work order creation is not enabled for this plan.') {
    super(message);
    this.name = 'WorkOrderFeatureDisabledError';
  }
}

function workOrdersCollection(garageId: string) {
  return firebaseAdmin.db
    .collection('garages')
    .doc(garageId)
    .collection('workOrders');
}

function billingDocRef(garageId: string) {
  return firebaseAdmin.db
    .collection('garages')
    .doc(garageId)
    .collection('billing')
    .doc(BILLING_DOC_ID);
}

function usageDocRef(garageId: string) {
  return firebaseAdmin.db
    .collection('garages')
    .doc(garageId)
    .collection('usage')
    .doc(USAGE_DOC_ID);
}

function sanitizeQuantity(quantity: number): number {
  if (!Number.isFinite(quantity)) {
    return 1;
  }

  return Math.max(1, Math.floor(quantity));
}

function resolvePlanWorkOrderLimit(
  planCode: PlanCode | null | undefined
): number {
  if (!planCode) {
    return PLAN_WORK_ORDER_LIMITS.free;
  }

  return PLAN_WORK_ORDER_LIMITS[planCode] ?? PLAN_WORK_ORDER_LIMITS.free;
}

function resolveWorkOrderUsageState(
  usage: Partial<GarageUsageCurrentDocument> | null,
  billing: Partial<GarageBillingDocument> | null
): WorkOrderUsageState {
  const counters = usage?.counters ?? [];
  const workOrdersIndex = counters.findIndex(
    (counter) => counter.key === WORK_ORDERS_COUNTER_KEY
  );
  const workOrdersCounter =
    workOrdersIndex >= 0 ? counters[workOrdersIndex] : undefined;

  return {
    counters,
    workOrdersIndex,
    currentCount: Math.max(0, workOrdersCounter?.value ?? 0),
    limit: Math.max(
      -1,
      workOrdersCounter?.limit ?? resolvePlanWorkOrderLimit(billing?.planCode)
    ),
    enabled: workOrdersCounter?.enabled ?? true
  };
}

function withWorkOrdersCounterUpdated(
  state: WorkOrderUsageState,
  nextCount: number,
  now: string
): NonNullable<GarageUsageCurrentDocument['counters']> {
  const nextCounters = [...state.counters];

  if (state.workOrdersIndex >= 0) {
    nextCounters[state.workOrdersIndex] = {
      ...nextCounters[state.workOrdersIndex],
      value: nextCount,
      updatedAt: now
    };
    return nextCounters;
  }

  nextCounters.push({
    key: WORK_ORDERS_COUNTER_KEY,
    value: nextCount,
    limit: state.limit,
    resetPolicy: 'monthly',
    enabled: true,
    updatedAt: now
  });

  return nextCounters;
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

/**
 * Creates a work order and consumes usage in one transaction.
 * This guarantees we never create an order without incrementing usage (or vice versa).
 */
export async function createGarageWorkOrderWithUsageConsume(
  garageId: string,
  payload: Omit<WorkOrder, 'id'>,
  quantity = 1
): Promise<WorkOrder> {
  const ref = workOrdersCollection(garageId).doc();
  const usageRef = usageDocRef(garageId);
  const billingRef = billingDocRef(garageId);
  const safePayload = withoutUndefined(payload);
  const safeQuantity = sanitizeQuantity(quantity);
  const now = new Date().toISOString();

  await firebaseAdmin.db.runTransaction(async (transaction: any) => {
    const [usageSnap, billingSnap] = await Promise.all([
      transaction.get(usageRef),
      transaction.get(billingRef)
    ]);

    const usage = usageSnap.exists
      ? (usageSnap.data() as Partial<GarageUsageCurrentDocument>)
      : null;
    const billing = billingSnap.exists
      ? (billingSnap.data() as Partial<GarageBillingDocument>)
      : null;
    const state = resolveWorkOrderUsageState(usage, billing);

    if (!state.enabled) {
      throw new WorkOrderFeatureDisabledError();
    }

    const nextCount = state.currentCount + safeQuantity;
    if (state.limit >= 0 && nextCount > state.limit) {
      throw new WorkOrderUsageLimitExceededError();
    }

    const nextCounters = withWorkOrdersCounterUpdated(state, nextCount, now);

    transaction.set(ref, safePayload);
    transaction.set(
      usageRef,
      {
        counters: nextCounters,
        updatedAt: now
      },
      { merge: true }
    );
  });

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
