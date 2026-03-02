import type {
  VehicleImage,
  VehicleServiceRecord,
  Vehicle
} from '@/features/vehicles/types';
import { normalizePlate, toPlateDisplay } from '@/features/vehicles/utils';
import { firebaseAdmin } from '@/lib/firebase-admin';
import type {
  GarageVehicleDocument,
  GarageVehicleImageDocument
} from '@/types/firebase-models';

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

function withoutUndefined<T extends object>(value: T): T {
  const entries = Object.entries(value as Record<string, unknown>).filter(
    ([, entry]) => entry !== undefined
  );
  return Object.fromEntries(entries) as T;
}

function mapVehicleDoc(id: string, data: GarageVehicleDocument): Vehicle {
  const now = new Date().toISOString();
  const images = Array.isArray(data.images)
    ? data.images.map((item) => ({
        id: item.id,
        url: item.url,
        path: item.path,
        name: item.name,
        contentType: item.contentType,
        size: item.size,
        uploadedByUserId: item.uploadedByUserId,
        uploadedAt: item.uploadedAt ?? now
      }))
    : [];

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
    images,
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
    mapVehicleDoc(doc.id, doc.data() as GarageVehicleDocument)
  );
}

export async function findGarageVehicleById(
  garageId: string,
  vehicleId: string
): Promise<Vehicle | null> {
  const snap = await vehiclesCollection(garageId).doc(vehicleId).get();
  if (!snap.exists) return null;
  return mapVehicleDoc(snap.id, snap.data() as GarageVehicleDocument);
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
  return mapVehicleDoc(doc.id, doc.data() as GarageVehicleDocument);
}

export async function createGarageVehicle(
  garageId: string,
  input: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Vehicle> {
  const ref = vehiclesCollection(garageId).doc();
  const now = new Date().toISOString();
  const payload: GarageVehicleDocument = {
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

  const payload: GarageVehicleDocument = {
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
  return mapVehicleDoc(updated.id, updated.data() as GarageVehicleDocument);
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
    existing.data() as GarageVehicleDocument
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

/**
 * Appends a new image metadata item to the vehicle document.
 * We write the full array to keep ordering deterministic in UI galleries.
 */
export async function addGarageVehicleImage(
  garageId: string,
  vehicleId: string,
  image: GarageVehicleImageDocument
): Promise<Vehicle | null> {
  const ref = vehiclesCollection(garageId).doc(vehicleId);
  const snapshot = await ref.get();
  if (!snapshot.exists) {
    return null;
  }

  const current = snapshot.data() as GarageVehicleDocument;
  const currentImages = Array.isArray(current.images) ? current.images : [];

  if (currentImages.length >= 10) {
    throw new Error('You can upload up to 10 images per vehicle.');
  }

  const nextImages = [...currentImages, image];
  await ref.set(
    {
      images: nextImages,
      updatedAt: new Date().toISOString()
    },
    { merge: true }
  );

  const updated = await ref.get();
  if (!updated.exists) {
    return null;
  }

  return mapVehicleDoc(updated.id, updated.data() as GarageVehicleDocument);
}

/**
 * Removes one image item from the vehicle document and returns removed metadata.
 * Caller can use the returned storage path to delete the physical CDN file.
 */
export async function removeGarageVehicleImage(
  garageId: string,
  vehicleId: string,
  imageId: string
): Promise<{ vehicle: Vehicle | null; removed: VehicleImage | null }> {
  const ref = vehiclesCollection(garageId).doc(vehicleId);
  const snapshot = await ref.get();
  if (!snapshot.exists) {
    return { vehicle: null, removed: null };
  }

  const current = snapshot.data() as GarageVehicleDocument;
  const currentImages = Array.isArray(current.images) ? current.images : [];

  const removed = currentImages.find((item) => item.id === imageId) ?? null;
  const nextImages = currentImages.filter((item) => item.id !== imageId);

  await ref.set(
    {
      images: nextImages,
      updatedAt: new Date().toISOString()
    },
    { merge: true }
  );

  const updated = await ref.get();
  const vehicle = updated.exists
    ? mapVehicleDoc(updated.id, updated.data() as GarageVehicleDocument)
    : null;

  return {
    vehicle,
    removed: removed
      ? {
          id: removed.id,
          url: removed.url,
          path: removed.path,
          name: removed.name,
          contentType: removed.contentType,
          size: removed.size,
          uploadedByUserId: removed.uploadedByUserId,
          uploadedAt: removed.uploadedAt
        }
      : null
  };
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
