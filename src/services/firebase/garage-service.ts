import { cache } from 'react';

import { firebaseAdmin } from '@/lib/firebase-admin';
import type { GarageDocument } from '@/types/firebase-models';

function mapDoc(id: string, data: Omit<GarageDocument, 'id'>): GarageDocument {
  return { id, ...data };
}

export async function getGarageByOwnerId(
  ownerId: string
): Promise<GarageDocument | null> {
  const snap = await firebaseAdmin.db
    .collection('garages')
    .where('ownerUserId', '==', ownerId)
    .limit(1)
    .get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return mapDoc(doc.id, doc.data() as Omit<GarageDocument, 'id'>);
}

export async function getGarageById(
  garageId: string
): Promise<GarageDocument | null> {
  const snap = await firebaseAdmin.db.collection('garages').doc(garageId).get();
  if (!snap.exists) return null;
  return mapDoc(snap.id, snap.data() as Omit<GarageDocument, 'id'>);
}

export const getGarageByOwnerIdCached = cache(getGarageByOwnerId);
export const getGarageByIdCached = cache(getGarageById);

export async function createGarageForOwner(input: {
  ownerId: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  workingHours?: string;
}): Promise<GarageDocument> {
  const existing = await getGarageByOwnerId(input.ownerId);
  if (existing) return existing;

  const ref = firebaseAdmin.db.collection('garages').doc();
  const now = new Date().toISOString();
  const payload: Omit<GarageDocument, 'id'> = {
    ownerUserId: input.ownerId,
    name: input.name,
    address: input.address ?? '',
    phone: input.phone ?? '',
    email: input.email ?? '',
    workingHours: input.workingHours ?? '',
    logoUrl: '',
    createdAt: now,
    updatedAt: now
  };

  await ref.set(payload);
  return mapDoc(ref.id, payload);
}

export async function updateGarage(
  garageId: string,
  input: Partial<GarageDocument>
): Promise<GarageDocument> {
  const ref = firebaseAdmin.db.collection('garages').doc(garageId);
  await ref.set(
    { ...input, updatedAt: new Date().toISOString() },
    { merge: true }
  );
  const snap = await ref.get();
  if (!snap.exists) {
    throw new Error('Garage not found');
  }
  return mapDoc(snap.id, snap.data() as Omit<GarageDocument, 'id'>);
}
