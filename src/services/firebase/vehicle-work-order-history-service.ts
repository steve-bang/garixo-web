import type { WorkOrder } from '@/features/work-orders/types';
import type { VehicleWorkOrderHistoryRecord } from '@/features/vehicles/types';
import { firebaseAdmin } from '@/lib/firebase-admin';

type VehicleWorkOrderHistoryFirestoreDoc = Omit<
  VehicleWorkOrderHistoryRecord,
  'id'
>;

function removeUndefinedDeep<T>(value: T): T {
  if (Array.isArray(value)) {
    return value
      .map((item) => removeUndefinedDeep(item))
      .filter((item) => item !== undefined) as T;
  }

  if (value && typeof value === 'object') {
    const nextEntries = Object.entries(value as Record<string, unknown>)
      .filter(([, entry]) => entry !== undefined)
      .map(([key, entry]) => [key, removeUndefinedDeep(entry)]);
    return Object.fromEntries(nextEntries) as T;
  }

  return value;
}

export function vehicleWorkOrderHistoryRef(
  garageId: string,
  vehicleId: string,
  workOrderId: string
) {
  return firebaseAdmin.db
    .collection('garages')
    .doc(garageId)
    .collection('vehicles')
    .doc(vehicleId)
    .collection('workOrderHistory')
    .doc(workOrderId);
}

function mapDoc(
  id: string,
  data: Partial<VehicleWorkOrderHistoryFirestoreDoc>
): VehicleWorkOrderHistoryRecord {
  const now = new Date().toISOString();
  return {
    id,
    workOrderId: data.workOrderId ?? id,
    vehicleId: data.vehicleId ?? '',
    orderCode: data.orderCode ?? '',
    plateNumber: data.plateNumber ?? '',
    customerId: data.customerId,
    customerName: data.customerName ?? '',
    customerPhone: data.customerPhone ?? '',
    workerId: data.workerId,
    workerName: data.workerName,
    services: data.services ?? [],
    parts: data.parts ?? [],
    totalAmount: data.totalAmount ?? 0,
    status: data.status ?? 'Draft',
    notes: data.notes,
    paymentMethod: data.paymentMethod,
    completedAt: data.completedAt ?? null,
    paidAt: data.paidAt ?? null,
    createdAt: data.createdAt ?? now,
    updatedAt: data.updatedAt ?? now
  };
}

export function toVehicleWorkOrderHistoryPayload(
  order: WorkOrder
): VehicleWorkOrderHistoryFirestoreDoc {
  const completedAt =
    order.status === 'Completed' || order.status === 'Paid'
      ? (order.timeline
          .slice()
          .reverse()
          .find((event) => event.status === 'Completed')?.timestamp ?? null)
      : null;
  const paidAt =
    order.status === 'Paid'
      ? (order.timeline
          .slice()
          .reverse()
          .find((event) => event.status === 'Paid')?.timestamp ?? null)
      : null;

  return removeUndefinedDeep({
    workOrderId: order.id,
    vehicleId: order.vehicleId ?? '',
    orderCode: order.orderCode,
    plateNumber: order.plateNumber,
    customerId: order.customerId,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    workerId: order.workerId,
    workerName: order.workerName,
    services: order.services,
    parts: order.parts,
    totalAmount: order.totalAmount,
    status: order.status,
    notes: order.notes,
    paymentMethod: order.paymentMethod,
    completedAt,
    paidAt,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt
  });
}

export async function upsertVehicleWorkOrderHistory(
  garageId: string,
  order: WorkOrder
): Promise<void> {
  if (!order.vehicleId) {
    return;
  }

  const ref = vehicleWorkOrderHistoryRef(garageId, order.vehicleId, order.id);
  await ref.set(toVehicleWorkOrderHistoryPayload(order), { merge: true });
}

export async function deleteVehicleWorkOrderHistory(
  garageId: string,
  vehicleId: string,
  workOrderId: string
): Promise<void> {
  const ref = vehicleWorkOrderHistoryRef(garageId, vehicleId, workOrderId);
  await ref.delete();
}

export async function listGarageVehicleWorkOrderHistory(
  garageId: string,
  vehicleId: string,
  limit = 50
): Promise<VehicleWorkOrderHistoryRecord[]> {
  const safeLimit = Math.max(1, Math.min(100, Math.floor(limit)));
  const snap = await firebaseAdmin.db
    .collection('garages')
    .doc(garageId)
    .collection('vehicles')
    .doc(vehicleId)
    .collection('workOrderHistory')
    .get();

  return snap.docs
    .map((doc: { id: string; data: () => unknown }) =>
      mapDoc(doc.id, doc.data() as Partial<VehicleWorkOrderHistoryFirestoreDoc>)
    )
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
    .slice(0, safeLimit);
}
