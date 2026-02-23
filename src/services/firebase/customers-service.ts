import type { Customer, ServiceRecord } from '@/features/customers/types';
import { firebaseAdmin } from '@/lib/firebase-admin';

type CustomerFirestoreDoc = {
  id?: string;
  name?: string;
  phone?: string;
  phoneNormalized?: string;
  email?: string;
  address?: string;
  status?: Customer['status'];
  vehicles?: Customer['vehicles'];
  totalVisits?: number;
  totalSpent?: number;
  lastVisit?: string | null;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
};

type CustomerHistoryFirestoreDoc = {
  id?: string;
  date?: string;
  vehiclePlate?: string;
  serviceName?: string;
  amount?: number;
};

type CustomerVehicleFirestoreDoc = {
  id?: string;
  plate?: string;
  brand?: string;
  model?: string;
  year?: number;
  color?: string;
  lastServiceDate?: string;
  createdAt?: string;
  updatedAt?: string;
};

function customersCollection(garageId: string) {
  return firebaseAdmin.db
    .collection('garages')
    .doc(garageId)
    .collection('customers');
}

function customerVehiclesCollection(garageId: string, customerId: string) {
  return customersCollection(garageId).doc(customerId).collection('vehicles');
}

function withoutUndefined<T extends Record<string, unknown>>(value: T): T {
  const entries = Object.entries(value).filter(
    ([, entry]) => entry !== undefined
  );
  return Object.fromEntries(entries) as T;
}

function mapCustomerDoc(id: string, data: CustomerFirestoreDoc): Customer {
  const now = new Date().toISOString();
  return {
    id,
    name: data.name ?? '',
    phone: data.phone ?? '',
    email: data.email ?? '',
    address: data.address ?? '',
    status: data.status ?? 'ACTIVE',
    vehicles: data.vehicles ?? [],
    totalVisits: data.totalVisits ?? 0,
    totalSpent: data.totalSpent ?? 0,
    lastVisit: data.lastVisit,
    notes: data.notes ?? '',
    createdAt: data.createdAt ?? now,
    updatedAt: data.updatedAt ?? now
  };
}

function mapHistoryDoc(
  id: string,
  data: CustomerHistoryFirestoreDoc
): ServiceRecord {
  return {
    id,
    date: data.date ?? new Date().toISOString(),
    vehiclePlate: data.vehiclePlate ?? '',
    serviceName: data.serviceName ?? '',
    amount: data.amount ?? 0
  };
}

function mapVehicleDoc(
  id: string,
  data: CustomerVehicleFirestoreDoc
): Customer['vehicles'][number] {
  return {
    id,
    plate: data.plate ?? '',
    brand: data.brand ?? '',
    model: data.model ?? '',
    year: data.year,
    color: data.color ?? '',
    lastServiceDate: data.lastServiceDate
  };
}

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

export async function listGarageCustomers(
  garageId: string
): Promise<Customer[]> {
  const snap = await customersCollection(garageId).get();
  return snap.docs
    .map((doc: { id: string; data: () => unknown }) =>
      mapCustomerDoc(doc.id, doc.data() as CustomerFirestoreDoc)
    )
    .sort((a, b) => {
      const aTime = a.lastVisit ? new Date(a.lastVisit).getTime() : 0;
      const bTime = b.lastVisit ? new Date(b.lastVisit).getTime() : 0;
      return bTime - aTime;
    });
}

export async function findGarageCustomerById(
  garageId: string,
  customerId: string
): Promise<Customer | null> {
  const snap = await customersCollection(garageId).doc(customerId).get();
  if (!snap.exists) return null;
  return mapCustomerDoc(snap.id, snap.data() as CustomerFirestoreDoc);
}

export async function isGarageCustomerPhoneExists(
  garageId: string,
  phone: string,
  excludeId?: string
): Promise<boolean> {
  const normalized = normalizePhone(phone);
  const items = await listGarageCustomers(garageId);
  return items.some(
    (item) =>
      normalizePhone(item.phone) === normalized &&
      (!excludeId || item.id !== excludeId)
  );
}

export async function createGarageCustomer(
  garageId: string,
  input: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Customer> {
  const ref = customersCollection(garageId).doc();
  const now = new Date().toISOString();
  const payload: CustomerFirestoreDoc = {
    name: input.name,
    phone: input.phone,
    phoneNormalized: normalizePhone(input.phone),
    email: input.email ?? '',
    address: input.address ?? '',
    status: input.status,
    vehicles: input.vehicles,
    totalVisits: input.totalVisits,
    totalSpent: input.totalSpent,
    lastVisit: input.lastVisit,
    notes: input.notes ?? '',
    createdAt: now,
    updatedAt: now
  };

  await ref.set(payload);
  return mapCustomerDoc(ref.id, payload);
}

export async function updateGarageCustomer(
  garageId: string,
  customerId: string,
  input: Partial<Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<Customer | null> {
  const ref = customersCollection(garageId).doc(customerId);
  const existing = await ref.get();

  if (!existing.exists) return null;

  const payload: CustomerFirestoreDoc = {
    ...input,
    ...(input.phone ? { phoneNormalized: normalizePhone(input.phone) } : {}),
    ...(input.lastVisit === null ? { lastVisit: null } : {}),
    updatedAt: new Date().toISOString()
  };

  await ref.set(payload, { merge: true });
  const updated = await ref.get();
  if (!updated.exists) return null;
  return mapCustomerDoc(updated.id, updated.data() as CustomerFirestoreDoc);
}

export async function deleteGarageCustomer(
  garageId: string,
  customerId: string
): Promise<Customer | null> {
  const ref = customersCollection(garageId).doc(customerId);
  const existing = await ref.get();
  if (!existing.exists) return null;

  const customer = mapCustomerDoc(
    existing.id,
    existing.data() as CustomerFirestoreDoc
  );

  const historySnap = await ref.collection('serviceHistory').get();
  await Promise.all(
    historySnap.docs.map((doc: { id: string }) =>
      ref.collection('serviceHistory').doc(doc.id).delete()
    )
  );
  await ref.delete();

  return customer;
}

export async function listGarageCustomerServiceHistory(
  garageId: string,
  customerId: string
): Promise<ServiceRecord[]> {
  const ref = customersCollection(garageId)
    .doc(customerId)
    .collection('serviceHistory');
  const snap = await ref.get();
  return snap.docs
    .map((doc: { id: string; data: () => unknown }) =>
      mapHistoryDoc(doc.id, doc.data() as CustomerHistoryFirestoreDoc)
    )
    .sort(
      (a: ServiceRecord, b: ServiceRecord) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    .slice(0, 10);
}

export async function listGarageCustomerVehicles(
  garageId: string,
  customerId: string
): Promise<Customer['vehicles']> {
  const snap = await customerVehiclesCollection(garageId, customerId).get();
  return snap.docs
    .map((doc: { id: string; data: () => unknown }) =>
      mapVehicleDoc(doc.id, doc.data() as CustomerVehicleFirestoreDoc)
    )
    .sort((a, b) => {
      const aTime = a.lastServiceDate
        ? new Date(a.lastServiceDate).getTime()
        : 0;
      const bTime = b.lastServiceDate
        ? new Date(b.lastServiceDate).getTime()
        : 0;
      return bTime - aTime;
    });
}

export async function syncGarageCustomerVehiclesSnapshot(
  garageId: string,
  customerId: string
): Promise<void> {
  const vehicles = (await listGarageCustomerVehicles(garageId, customerId)).map(
    (vehicle) =>
      withoutUndefined({
        id: vehicle.id,
        plate: vehicle.plate,
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        color: vehicle.color,
        lastServiceDate: vehicle.lastServiceDate
      })
  );
  await customersCollection(garageId).doc(customerId).set(
    {
      vehicles,
      updatedAt: new Date().toISOString()
    },
    { merge: true }
  );
}

export async function createGarageCustomerVehicle(
  garageId: string,
  customerId: string,
  input: {
    plate: string;
    brand: string;
    model?: string;
    year?: number;
    color?: string;
    lastServiceDate?: string;
  }
): Promise<Customer['vehicles'][number]> {
  const ref = customerVehiclesCollection(garageId, customerId).doc();
  const payload: CustomerVehicleFirestoreDoc = {
    plate: input.plate,
    brand: input.brand,
    model: input.model ?? '',
    year: input.year,
    color: input.color ?? '',
    lastServiceDate: input.lastServiceDate,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const safePayload = withoutUndefined(payload);
  await ref.set(safePayload);
  await syncGarageCustomerVehiclesSnapshot(garageId, customerId);
  return mapVehicleDoc(ref.id, safePayload);
}

export async function updateGarageCustomerVehicle(
  garageId: string,
  customerId: string,
  vehicleId: string,
  input: Partial<{
    plate: string;
    brand: string;
    model?: string;
    year?: number;
    color?: string;
    lastServiceDate?: string;
  }>
): Promise<Customer['vehicles'][number] | null> {
  const ref = customerVehiclesCollection(garageId, customerId).doc(vehicleId);
  const existing = await ref.get();
  if (!existing.exists) {
    return null;
  }

  const safePayload = withoutUndefined({
    ...input,
    updatedAt: new Date().toISOString()
  });

  await ref.set(safePayload, { merge: true });

  const updated = await ref.get();
  if (!updated.exists) {
    return null;
  }

  await syncGarageCustomerVehiclesSnapshot(garageId, customerId);
  return mapVehicleDoc(
    updated.id,
    updated.data() as CustomerVehicleFirestoreDoc
  );
}

export async function deleteGarageCustomerVehicle(
  garageId: string,
  customerId: string,
  vehicleId: string
): Promise<Customer['vehicles'][number] | null> {
  const ref = customerVehiclesCollection(garageId, customerId).doc(vehicleId);
  const existing = await ref.get();
  if (!existing.exists) {
    return null;
  }

  const vehicle = mapVehicleDoc(
    existing.id,
    existing.data() as CustomerVehicleFirestoreDoc
  );
  await ref.delete();
  await syncGarageCustomerVehiclesSnapshot(garageId, customerId);
  return vehicle;
}
