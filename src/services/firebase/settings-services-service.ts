import { firebaseAdmin } from '@/lib/firebase-admin';
import type { GarageServiceDocument } from '@/types/firebase-models';

function mapDoc(
  id: string,
  data: Omit<GarageServiceDocument, 'id'>
): GarageServiceDocument {
  return { id, ...data };
}

export async function listGarageServices(
  garageId: string
): Promise<GarageServiceDocument[]> {
  const snap = await firebaseAdmin.db
    .collection('garages')
    .doc(garageId)
    .collection('services')
    .get();
  return snap.docs
    .map((doc: { id: string; data: () => unknown }) =>
      mapDoc(doc.id, doc.data() as Omit<GarageServiceDocument, 'id'>)
    )
    .sort((a: GarageServiceDocument, b: GarageServiceDocument) =>
      a.name.localeCompare(b.name)
    );
}

export async function createGarageService(
  garageId: string,
  input: Pick<
    GarageServiceDocument,
    'name' | 'description' | 'defaultPrice' | 'standardDuration'
  >
): Promise<GarageServiceDocument> {
  const ref = firebaseAdmin.db
    .collection('garages')
    .doc(garageId)
    .collection('services')
    .doc();
  const now = new Date().toISOString();
  const payload: Omit<GarageServiceDocument, 'id'> = {
    name: input.name,
    description: input.description,
    defaultPrice: input.defaultPrice,
    standardDuration: input.standardDuration,
    createdAt: now,
    updatedAt: now
  };
  await ref.set(payload);
  return mapDoc(ref.id, payload);
}

export async function updateGarageService(
  garageId: string,
  serviceId: string,
  input: Pick<
    GarageServiceDocument,
    'name' | 'description' | 'defaultPrice' | 'standardDuration'
  >
): Promise<GarageServiceDocument> {
  const ref = firebaseAdmin.db
    .collection('garages')
    .doc(garageId)
    .collection('services')
    .doc(serviceId);
  await ref.set(
    { ...input, updatedAt: new Date().toISOString() },
    { merge: true }
  );
  const snap = await ref.get();
  if (!snap.exists) {
    throw new Error('Service not found');
  }
  return mapDoc(snap.id, snap.data() as Omit<GarageServiceDocument, 'id'>);
}

export async function deleteGarageService(
  garageId: string,
  serviceId: string
): Promise<void> {
  await firebaseAdmin.db
    .collection('garages')
    .doc(garageId)
    .collection('services')
    .doc(serviceId)
    .delete();
}
