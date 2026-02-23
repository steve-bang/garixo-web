import { firebaseAdmin } from '@/lib/firebase-admin';
import { WorkOrderStatusEnum } from '@/features/work-orders/types';
import type { GarageWorkOrderDocument } from '@/types/firebase-models';

function mapDoc(
  id: string,
  data: Omit<GarageWorkOrderDocument, 'id'>
): GarageWorkOrderDocument {
  return { id, ...data };
}

export async function listGarageWorkOrders(
  garageId: string
): Promise<GarageWorkOrderDocument[]> {
  const snap = await firebaseAdmin.db
    .collection('garages')
    .doc(garageId)
    .collection('workOrders')
    .get();
  return snap.docs
    .map((doc: { id: string; data: () => unknown }) =>
      mapDoc(doc.id, doc.data() as Omit<GarageWorkOrderDocument, 'id'>)
    )
    .sort((a: GarageWorkOrderDocument, b: GarageWorkOrderDocument) =>
      b.createdAt.localeCompare(a.createdAt)
    );
}

export async function createGarageWorkOrder(
  garageId: string,
  input: Pick<
    GarageWorkOrderDocument,
    'customerName' | 'licensePlate' | 'service' | 'notes'
  >
): Promise<GarageWorkOrderDocument> {
  const ref = firebaseAdmin.db
    .collection('garages')
    .doc(garageId)
    .collection('workOrders')
    .doc();
  const now = new Date().toISOString();
  const payload: Omit<GarageWorkOrderDocument, 'id'> = {
    customerName: input.customerName,
    licensePlate: input.licensePlate.toUpperCase(),
    service: input.service ?? '',
    notes: input.notes ?? '',
    status: WorkOrderStatusEnum.Draft,
    createdAt: now,
    updatedAt: now
  };
  await ref.set(payload);
  return mapDoc(ref.id, payload);
}
