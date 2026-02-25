import { FieldValue } from 'firebase-admin/firestore';

import type { WorkOrder, WorkOrderStatus } from '@/features/work-orders/types';
import { WorkOrderStatusEnum } from '@/features/work-orders/types';
import { firebaseAdmin } from '@/lib/firebase-admin';

type OverviewDoc = {
  carsInShop: number;
  waitingApproval: number;
  readyForPickup: number;
  activeWorkOrders: number;
  stuckJobs: number;
  todayRevenue: number;
  lastUpdatedAt?: unknown;
};

type RevenueDailyDoc = {
  totalRevenue: number;
  paidCount: number;
  date: string;
  updatedAt?: unknown;
};

type RevenueMonthlyDoc = {
  totalRevenue: number;
  paidCount: number;
  month: string;
  updatedAt?: unknown;
};

type RevenueWeekDoc = {
  totalRevenue: number;
  paidCount: number;
};

type OverviewDelta = {
  carsInShop: number;
  waitingApproval: number;
  readyForPickup: number;
  activeWorkOrders: number;
  stuckJobs: number;
  todayRevenue: number;
  revenueAmount: number;
  paidCount: number;
};

type ApplyTransitionInput = {
  garageId: string;
  orderId: string;
  nextStatus: WorkOrderStatus;
  paymentMethod?: WorkOrder['paymentMethod'];
  cancellationReason?: string;
  deductInventoryOnComplete?: boolean;
};

const ZERO_OVERVIEW: OverviewDoc = {
  carsInShop: 0,
  waitingApproval: 0,
  readyForPickup: 0,
  activeWorkOrders: 0,
  stuckJobs: 0,
  todayRevenue: 0
};

function workOrderRef(garageId: string, orderId: string) {
  return firebaseAdmin.db
    .collection('garages')
    .doc(garageId)
    .collection('workOrders')
    .doc(orderId);
}

function overviewRef(garageId: string) {
  return firebaseAdmin.db
    .collection('garages')
    .doc(garageId)
    .collection('dashboard')
    .doc('overview');
}

function customerRef(garageId: string, customerId: string) {
  return firebaseAdmin.db
    .collection('garages')
    .doc(garageId)
    .collection('customers')
    .doc(customerId);
}

function vehicleRef(garageId: string, vehicleId: string) {
  return firebaseAdmin.db
    .collection('garages')
    .doc(garageId)
    .collection('vehicles')
    .doc(vehicleId);
}

function revenueDailyRef(garageId: string, dateKey: string) {
  return firebaseAdmin.db
    .collection('garages')
    .doc(garageId)
    .collection('revenue')
    .doc('daily')
    .collection('entries')
    .doc(dateKey);
}

function revenueMonthlyRef(garageId: string, monthKey: string) {
  return firebaseAdmin.db
    .collection('garages')
    .doc(garageId)
    .collection('revenue')
    .doc('monthly')
    .collection('entries')
    .doc(monthKey);
}

function toDayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function toMonthKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

function toWeekDayKeys(date: Date): string[] {
  const cursor = new Date(date);
  const day = cursor.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  cursor.setDate(cursor.getDate() + diff);
  cursor.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }).map((_, index) => {
    const value = new Date(cursor);
    value.setDate(cursor.getDate() + index);
    return toDayKey(value);
  });
}

function mapWorkOrderDoc(id: string, raw: Partial<WorkOrder>): WorkOrder {
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

function overviewFrom(raw: Partial<OverviewDoc> | undefined): OverviewDoc {
  return {
    carsInShop: raw?.carsInShop ?? 0,
    waitingApproval: raw?.waitingApproval ?? 0,
    readyForPickup: raw?.readyForPickup ?? 0,
    activeWorkOrders: raw?.activeWorkOrders ?? 0,
    stuckJobs: raw?.stuckJobs ?? 0,
    todayRevenue: raw?.todayRevenue ?? 0,
    lastUpdatedAt: raw?.lastUpdatedAt
  };
}

function computeOverviewDelta(
  previousStatus: WorkOrderStatus,
  nextStatus: WorkOrderStatus,
  totalAmount: number
): OverviewDelta {
  const delta: OverviewDelta = {
    carsInShop: 0,
    waitingApproval: 0,
    readyForPickup: 0,
    activeWorkOrders: 0,
    stuckJobs: 0,
    todayRevenue: 0,
    revenueAmount: 0,
    paidCount: 0
  };

  if (previousStatus === nextStatus) {
    return delta;
  }

  if (
    previousStatus === WorkOrderStatusEnum.Draft &&
    nextStatus === WorkOrderStatusEnum.WaitingForApproval
  ) {
    delta.waitingApproval += 1;
    delta.activeWorkOrders += 1;
    return delta;
  }

  if (
    previousStatus === WorkOrderStatusEnum.WaitingForApproval &&
    nextStatus === WorkOrderStatusEnum.InProgress
  ) {
    delta.waitingApproval -= 1;
    delta.carsInShop += 1;
    return delta;
  }

  if (
    (previousStatus === WorkOrderStatusEnum.InProgress ||
      previousStatus === WorkOrderStatusEnum.WaitingForParts) &&
    nextStatus === WorkOrderStatusEnum.Completed
  ) {
    delta.carsInShop -= 1;
    delta.readyForPickup += 1;
    delta.activeWorkOrders -= 1;
    return delta;
  }

  if (
    previousStatus === WorkOrderStatusEnum.Completed &&
    nextStatus === WorkOrderStatusEnum.Paid
  ) {
    delta.readyForPickup -= 1;
    delta.todayRevenue += totalAmount;
    delta.revenueAmount += totalAmount;
    delta.paidCount += 1;
    return delta;
  }

  if (nextStatus === WorkOrderStatusEnum.Cancelled) {
    if (previousStatus === WorkOrderStatusEnum.WaitingForApproval) {
      delta.waitingApproval -= 1;
      delta.activeWorkOrders -= 1;
    } else if (
      previousStatus === WorkOrderStatusEnum.InProgress ||
      previousStatus === WorkOrderStatusEnum.WaitingForParts
    ) {
      delta.carsInShop -= 1;
      delta.activeWorkOrders -= 1;
    } else if (previousStatus === WorkOrderStatusEnum.Completed) {
      delta.readyForPickup -= 1;
    }
  }

  return delta;
}

function clampNegativeDelta(value: number, delta: number): number {
  if (delta >= 0) {
    return delta;
  }
  const minDelta = -Math.max(0, value);
  return Math.max(minDelta, delta);
}

function applyOverviewDeltaSafe(
  current: OverviewDoc,
  delta: OverviewDelta
): Pick<
  OverviewDelta,
  | 'carsInShop'
  | 'waitingApproval'
  | 'readyForPickup'
  | 'activeWorkOrders'
  | 'stuckJobs'
  | 'todayRevenue'
> {
  return {
    carsInShop: clampNegativeDelta(current.carsInShop, delta.carsInShop),
    waitingApproval: clampNegativeDelta(
      current.waitingApproval,
      delta.waitingApproval
    ),
    readyForPickup: clampNegativeDelta(
      current.readyForPickup,
      delta.readyForPickup
    ),
    activeWorkOrders: clampNegativeDelta(
      current.activeWorkOrders,
      delta.activeWorkOrders
    ),
    stuckJobs: clampNegativeDelta(current.stuckJobs, delta.stuckJobs),
    todayRevenue: clampNegativeDelta(current.todayRevenue, delta.todayRevenue)
  };
}

export async function ensureDashboardSummaryDocs(
  garageId: string
): Promise<void> {
  const now = new Date();
  const dayKey = toDayKey(now);
  const monthKey = toMonthKey(now);

  await Promise.all([
    overviewRef(garageId).set(
      {
        ...ZERO_OVERVIEW,
        lastUpdatedAt: FieldValue.serverTimestamp()
      },
      { merge: true }
    ),
    revenueDailyRef(garageId, dayKey).set(
      {
        totalRevenue: 0,
        paidCount: 0,
        date: dayKey,
        updatedAt: FieldValue.serverTimestamp()
      },
      { merge: true }
    ),
    revenueMonthlyRef(garageId, monthKey).set(
      {
        totalRevenue: 0,
        paidCount: 0,
        month: monthKey,
        updatedAt: FieldValue.serverTimestamp()
      },
      { merge: true }
    )
  ]);
}

export async function applyWorkOrderStatusTransition(
  input: ApplyTransitionInput
): Promise<WorkOrder | null> {
  const db = firebaseAdmin.db as any;
  const now = new Date();
  const nowIso = now.toISOString();
  const dayKey = toDayKey(now);
  const monthKey = toMonthKey(now);

  return db.runTransaction(async (transaction: any) => {
    const orderReference = workOrderRef(input.garageId, input.orderId);
    const orderSnapshot = await transaction.get(orderReference);

    if (!orderSnapshot.exists) {
      return null;
    }

    const currentOrder = mapWorkOrderDoc(
      orderSnapshot.id,
      orderSnapshot.data() as Partial<WorkOrder>
    );

    if (
      currentOrder.status === input.nextStatus &&
      !input.paymentMethod &&
      !input.cancellationReason
    ) {
      return currentOrder;
    }

    const inventoryAdjustments: Array<{ ref: any; quantity: number }> = [];
    if (
      input.nextStatus === WorkOrderStatusEnum.Completed &&
      input.deductInventoryOnComplete &&
      currentOrder.parts.length > 0
    ) {
      for (const part of currentOrder.parts) {
        const inventoryRef = db
          .collection('garages')
          .doc(input.garageId)
          .collection('inventory')
          .doc(part.id);
        const inventorySnapshot = await transaction.get(inventoryRef);
        if (!inventorySnapshot.exists) {
          continue;
        }
        const inventoryData = inventorySnapshot.data() as { quantity?: number };
        const quantity = inventoryData.quantity ?? 0;

        if (quantity < part.quantity) {
          throw new Error(`Not enough quantity for ${part.partName}.`);
        }

        inventoryAdjustments.push({
          ref: inventoryRef,
          quantity: quantity - part.quantity
        });
      }
    }

    const becomesCompleted =
      currentOrder.status !== WorkOrderStatusEnum.Completed &&
      currentOrder.status !== WorkOrderStatusEnum.Paid &&
      currentOrder.status !== WorkOrderStatusEnum.Cancelled &&
      input.nextStatus === WorkOrderStatusEnum.Completed;

    const delta = computeOverviewDelta(
      currentOrder.status,
      input.nextStatus,
      currentOrder.totalAmount
    );

    const overviewReference = overviewRef(input.garageId);
    const overviewSnapshot = await transaction.get(overviewReference);
    const overviewCurrent = overviewFrom(
      overviewSnapshot.exists
        ? (overviewSnapshot.data() as Partial<OverviewDoc>)
        : undefined
    );
    const safeDelta = applyOverviewDeltaSafe(overviewCurrent, delta);

    for (const adjustment of inventoryAdjustments) {
      transaction.set(
        adjustment.ref,
        {
          quantity: adjustment.quantity,
          updatedAt: nowIso
        },
        { merge: true }
      );
    }

    if (becomesCompleted && currentOrder.customerId) {
      transaction.set(
        customerRef(input.garageId, currentOrder.customerId),
        {
          totalVisits: FieldValue.increment(1),
          totalSpent: FieldValue.increment(currentOrder.totalAmount),
          lastVisit: nowIso,
          updatedAt: nowIso
        },
        { merge: true }
      );
    }

    if (becomesCompleted && currentOrder.vehicleId) {
      transaction.set(
        vehicleRef(input.garageId, currentOrder.vehicleId),
        {
          totalVisits: FieldValue.increment(1),
          totalSpent: FieldValue.increment(currentOrder.totalAmount),
          lastServiceDate: nowIso,
          updatedAt: nowIso
        },
        { merge: true }
      );
    }

    transaction.set(
      overviewReference,
      {
        carsInShop: FieldValue.increment(safeDelta.carsInShop),
        waitingApproval: FieldValue.increment(safeDelta.waitingApproval),
        readyForPickup: FieldValue.increment(safeDelta.readyForPickup),
        activeWorkOrders: FieldValue.increment(safeDelta.activeWorkOrders),
        stuckJobs: FieldValue.increment(safeDelta.stuckJobs),
        todayRevenue: FieldValue.increment(safeDelta.todayRevenue),
        lastUpdatedAt: FieldValue.serverTimestamp()
      },
      { merge: true }
    );

    if (delta.revenueAmount > 0 || delta.paidCount > 0) {
      const dailyReference = revenueDailyRef(input.garageId, dayKey);
      const monthlyReference = revenueMonthlyRef(input.garageId, monthKey);

      transaction.set(
        dailyReference,
        {
          totalRevenue: FieldValue.increment(delta.revenueAmount),
          paidCount: FieldValue.increment(delta.paidCount),
          date: dayKey,
          updatedAt: FieldValue.serverTimestamp()
        },
        { merge: true }
      );

      transaction.set(
        monthlyReference,
        {
          totalRevenue: FieldValue.increment(delta.revenueAmount),
          paidCount: FieldValue.increment(delta.paidCount),
          month: monthKey,
          updatedAt: FieldValue.serverTimestamp()
        },
        { merge: true }
      );
    }

    const timeline =
      currentOrder.status === input.nextStatus
        ? currentOrder.timeline
        : [
            ...currentOrder.timeline,
            { status: input.nextStatus, timestamp: nowIso }
          ];

    const nextOrder: Partial<WorkOrder> = {
      status: input.nextStatus,
      timeline,
      updatedAt: nowIso,
      isOverdue:
        input.nextStatus === WorkOrderStatusEnum.Completed ||
        input.nextStatus === WorkOrderStatusEnum.Paid ||
        input.nextStatus === WorkOrderStatusEnum.Cancelled
          ? false
          : currentOrder.isOverdue,
      ...(input.paymentMethod ? { paymentMethod: input.paymentMethod } : {}),
      ...(input.cancellationReason
        ? { cancellationReason: input.cancellationReason }
        : {})
    };

    transaction.set(orderReference, nextOrder, { merge: true });

    return mapWorkOrderDoc(currentOrder.id, {
      ...currentOrder,
      ...nextOrder
    });
  });
}

export async function getDashboardOverviewSummary(
  garageId: string
): Promise<OverviewDoc> {
  const snapshot = await overviewRef(garageId).get();
  if (!snapshot.exists) {
    return ZERO_OVERVIEW;
  }
  return overviewFrom(snapshot.data() as Partial<OverviewDoc>);
}

export async function getRevenueSummary(garageId: string): Promise<{
  today: RevenueDailyDoc;
  week: RevenueWeekDoc;
  month: RevenueMonthlyDoc;
}> {
  const now = new Date();
  const dayKey = toDayKey(now);
  const monthKey = toMonthKey(now);
  const weekDayKeys = toWeekDayKeys(now);

  const [dailySnap, monthlySnap, ...weekSnaps] = await Promise.all([
    revenueDailyRef(garageId, dayKey).get(),
    revenueMonthlyRef(garageId, monthKey).get(),
    ...weekDayKeys.map((key) => revenueDailyRef(garageId, key).get())
  ]);

  const today: RevenueDailyDoc = dailySnap.exists
    ? ({
        totalRevenue:
          (dailySnap.data() as Partial<RevenueDailyDoc>).totalRevenue ?? 0,
        paidCount:
          (dailySnap.data() as Partial<RevenueDailyDoc>).paidCount ?? 0,
        date: (dailySnap.data() as Partial<RevenueDailyDoc>).date ?? dayKey
      } as RevenueDailyDoc)
    : { totalRevenue: 0, paidCount: 0, date: dayKey };

  const month: RevenueMonthlyDoc = monthlySnap.exists
    ? ({
        totalRevenue:
          (monthlySnap.data() as Partial<RevenueMonthlyDoc>).totalRevenue ?? 0,
        paidCount:
          (monthlySnap.data() as Partial<RevenueMonthlyDoc>).paidCount ?? 0,
        month:
          (monthlySnap.data() as Partial<RevenueMonthlyDoc>).month ?? monthKey
      } as RevenueMonthlyDoc)
    : { totalRevenue: 0, paidCount: 0, month: monthKey };

  const week = weekSnaps.reduce<RevenueWeekDoc>(
    (sum, snapshot) => {
      if (!snapshot.exists) {
        return sum;
      }

      const raw = snapshot.data() as Partial<RevenueDailyDoc>;
      return {
        totalRevenue: sum.totalRevenue + (raw.totalRevenue ?? 0),
        paidCount: sum.paidCount + (raw.paidCount ?? 0)
      };
    },
    { totalRevenue: 0, paidCount: 0 }
  );

  return { today, week, month };
}
