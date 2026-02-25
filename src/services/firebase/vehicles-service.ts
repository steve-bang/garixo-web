import type { VehicleServiceRecord, Vehicle } from '@/features/vehicles/types';
import { normalizePlate, toPlateDisplay } from '@/features/vehicles/utils';
import { firebaseAdmin } from '@/lib/firebase-admin';

type VehicleFirestoreDoc = {
  id?: string;
  plateNumber?: string;
  plateNormalized?: string;
  brand?: string;
  model?: string;
  year?: number;
  color?: string;
  vin?: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  status?: Vehicle['status'];
  totalVisits?: number;
  totalSpent?: number;
  lastServiceDate?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
};

type VehicleServiceFirestoreDoc = {
  id?: string;
  vehicleId?: string;
  date?: string;
  serviceName?: string;
  amount?: number;
  status?: VehicleServiceRecord['status'];
};

function vehiclesCollection(garageId: string) {
  return firebaseAdmin.db
    .collection('garages')
    .doc(garageId)
    .collection('vehicles');
}

function withoutUndefined<T extends Record<string, unknown>>(value: T): T {
  const entries = Object.entries(value).filter(
    ([, entry]) => entry !== undefined
  );
  return Object.fromEntries(entries) as T;
}

function mapVehicleDoc(id: string, data: VehicleFirestoreDoc): Vehicle {
  const now = new Date().toISOString();
  return {
    id,
    plateNumber: data.plateNumber ?? '',
    brand: data.brand ?? '',
    model: data.model ?? '',
    year: data.year,
    color: data.color ?? '',
    vin: data.vin ?? '',
    customerId: data.customerId ?? '',
    customerName: data.customerName ?? '',
    customerPhone: data.customerPhone ?? '',
    status: data.status ?? 'ACTIVE',
    totalVisits: data.totalVisits ?? 0,
    totalSpent: data.totalSpent ?? 0,
    lastServiceDate: data.lastServiceDate,
    notes: data.notes ?? '',
    createdAt: data.createdAt ?? now,
    updatedAt: data.updatedAt ?? now
  };
}

function mapServiceDoc(
  id: string,
  data: VehicleServiceFirestoreDoc
): VehicleServiceRecord {
  return {
    id,
    vehicleId: data.vehicleId ?? '',
    date: data.date ?? new Date().toISOString(),
    serviceName: data.serviceName ?? '',
    amount: data.amount ?? 0,
    status: data.status ?? 'DONE'
  };
}

export async function listGarageVehicles(garageId: string): Promise<Vehicle[]> {
  const snap = await vehiclesCollection(garageId).get();
  return snap.docs.map((doc: { id: string; data: () => unknown }) =>
    mapVehicleDoc(doc.id, doc.data() as VehicleFirestoreDoc)
  );
}

export async function findGarageVehicleById(
  garageId: string,
  vehicleId: string
): Promise<Vehicle | null> {
  const snap = await vehiclesCollection(garageId).doc(vehicleId).get();
  if (!snap.exists) return null;
  return mapVehicleDoc(snap.id, snap.data() as VehicleFirestoreDoc);
}

export async function findGarageVehicleByNormalizedPlate(
  garageId: string,
  plateNumber: string
): Promise<Vehicle | null> {
  const normalized = normalizePlate(plateNumber);
  const snap = await vehiclesCollection(garageId)
    .where('plateNormalized', '==', normalized)
    .limit(1)
    .get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return mapVehicleDoc(doc.id, doc.data() as VehicleFirestoreDoc);
}

export async function createGarageVehicle(
  garageId: string,
  input: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Vehicle> {
  const ref = vehiclesCollection(garageId).doc();
  const now = new Date().toISOString();
  const payload: VehicleFirestoreDoc = {
    plateNumber: toPlateDisplay(input.plateNumber),
    plateNormalized: normalizePlate(input.plateNumber),
    brand: input.brand ?? '',
    model: input.model ?? '',
    year: input.year,
    color: input.color ?? '',
    vin: input.vin ?? '',
    customerId: input.customerId,
    customerName: input.customerName,
    customerPhone: input.customerPhone,
    status: input.status,
    totalVisits: input.totalVisits,
    totalSpent: input.totalSpent,
    lastServiceDate: input.lastServiceDate,
    notes: input.notes ?? '',
    createdAt: now,
    updatedAt: now
  };

  const safePayload = withoutUndefined(payload);
  await ref.set(safePayload);
  return mapVehicleDoc(ref.id, safePayload);
}

export async function updateGarageVehicle(
  garageId: string,
  vehicleId: string,
  input: Partial<Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<Vehicle | null> {
  const ref = vehiclesCollection(garageId).doc(vehicleId);
  const existing = await ref.get();
  if (!existing.exists) return null;

  const payload: VehicleFirestoreDoc = {
    ...input,
    ...(input.plateNumber
      ? {
          plateNumber: toPlateDisplay(input.plateNumber),
          plateNormalized: normalizePlate(input.plateNumber)
        }
      : {}),
    updatedAt: new Date().toISOString()
  };

  const safePayload = withoutUndefined(payload);
  await ref.set(safePayload, { merge: true });
  const updated = await ref.get();
  if (!updated.exists) return null;
  return mapVehicleDoc(updated.id, updated.data() as VehicleFirestoreDoc);
}

export async function deleteGarageVehicle(
  garageId: string,
  vehicleId: string
): Promise<Vehicle | null> {
  const ref = vehiclesCollection(garageId).doc(vehicleId);
  const existing = await ref.get();
  if (!existing.exists) return null;

  const vehicle = mapVehicleDoc(
    existing.id,
    existing.data() as VehicleFirestoreDoc
  );

  const servicesSnap = await ref.collection('services').get();
  await Promise.all(
    servicesSnap.docs.map((doc: { id: string }) =>
      ref.collection('services').doc(doc.id).delete()
    )
  );
  await ref.delete();
  return vehicle;
}

export async function listGarageVehicleServices(
  garageId: string,
  vehicleId: string
): Promise<VehicleServiceRecord[]> {
  const ref = vehiclesCollection(garageId)
    .doc(vehicleId)
    .collection('services');
  const snap = await ref.get();
  return snap.docs
    .map((doc: { id: string; data: () => unknown }) =>
      mapServiceDoc(doc.id, doc.data() as VehicleServiceFirestoreDoc)
    )
    .sort(
      (a: VehicleServiceRecord, b: VehicleServiceRecord) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    .slice(0, 10);
}
