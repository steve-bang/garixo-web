import type {
  Customer,
  CustomerVehicle,
  CustomerServiceRecord
} from '@/features/customers/types';
import type { Vehicle } from '@/features/vehicles/types';
import { toPlateDisplay } from '@/features/vehicles/utils';
import { firebaseAdmin } from '@/lib/firebase-admin';
import {
  createGarageVehicle,
  deleteGarageVehicle,
  findGarageVehicleById,
  findGarageVehicleByNormalizedPlate,
  listGarageVehicles,
  updateGarageVehicle
} from '@/services/firebase/vehicles-service';

type CustomerFirestoreDoc = {
  id?: string;
  name?: string;
  phone?: string;
  phoneNormalized?: string;
  email?: string;
  address?: string;
  status?: Customer['status'];
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

function customersCollection(garageId: string) {
  return firebaseAdmin.db
    .collection('garages')
    .doc(garageId)
    .collection('customers');
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
    totalVehicles: 0,
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
): CustomerServiceRecord {
  return {
    id,
    date: data.date ?? new Date().toISOString(),
    vehiclePlate: data.vehiclePlate ?? '',
    serviceName: data.serviceName ?? '',
    amount: data.amount ?? 0
  };
}

function mapGarageVehicleToCustomerVehicle(vehicle: Vehicle): CustomerVehicle {
  return {
    id: vehicle.id,
    plate: toPlateDisplay(vehicle.plateNumber),
    brand: vehicle.brand ?? '',
    model: vehicle.model ?? '',
    year: vehicle.year,
    color: vehicle.color ?? '',
    lastServiceDate: vehicle.lastServiceDate
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
  input: Partial<
    Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'totalVehicles'>
  >
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
): Promise<CustomerServiceRecord[]> {
  const ref = customersCollection(garageId)
    .doc(customerId)
    .collection('serviceHistory');
  const snap = await ref.get();
  return snap.docs
    .map((doc: { id: string; data: () => unknown }) =>
      mapHistoryDoc(doc.id, doc.data() as CustomerHistoryFirestoreDoc)
    )
    .sort(
      (a: CustomerServiceRecord, b: CustomerServiceRecord) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    .slice(0, 10);
}

export async function listGarageCustomerVehicles(
  garageId: string,
  customerId: string
): Promise<CustomerVehicle[]> {
  const vehicles = await listGarageVehicles(garageId);
  return vehicles
    .filter((vehicle) => vehicle.customerId === customerId)
    .sort((a, b) => {
      const aTime = a.lastServiceDate
        ? new Date(a.lastServiceDate).getTime()
        : 0;
      const bTime = b.lastServiceDate
        ? new Date(b.lastServiceDate).getTime()
        : 0;
      return bTime - aTime;
    })
    .map(mapGarageVehicleToCustomerVehicle);
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
): Promise<CustomerVehicle> {
  const customer = await findGarageCustomerById(garageId, customerId);
  if (!customer) {
    throw new Error('Customer not found.');
  }

  const created = await createGarageVehicle(garageId, {
    plateNumber: toPlateDisplay(input.plate),
    brand: input.brand,
    model: input.model ?? '',
    year: input.year,
    color: input.color ?? '',
    vin: '',
    customerId,
    customerName: customer.name,
    customerPhone: customer.phone,
    status: 'ACTIVE',
    totalVisits: 0,
    totalSpent: 0,
    lastServiceDate: input.lastServiceDate,
    notes: ''
  });

  return mapGarageVehicleToCustomerVehicle(created);
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
): Promise<CustomerVehicle | null> {
  const existing = await findGarageVehicleById(garageId, vehicleId);
  if (!existing || existing.customerId !== customerId) {
    return null;
  }

  const updated = await updateGarageVehicle(garageId, vehicleId, {
    plateNumber: input.plate,
    brand: input.brand,
    model: input.model,
    year: input.year,
    color: input.color,
    lastServiceDate: input.lastServiceDate
  });

  if (!updated) {
    return null;
  }

  return mapGarageVehicleToCustomerVehicle(updated);
}

export async function deleteGarageCustomerVehicle(
  garageId: string,
  customerId: string,
  vehicleId: string
): Promise<CustomerVehicle | null> {
  const existing = await findGarageVehicleById(garageId, vehicleId);
  if (!existing || existing.customerId !== customerId) {
    return null;
  }

  const deleted = await deleteGarageVehicle(garageId, vehicleId);
  if (!deleted) {
    return null;
  }

  return mapGarageVehicleToCustomerVehicle(deleted);
}

export async function isGarageCustomerVehiclePlateExists(
  garageId: string,
  customerId: string,
  plate: string,
  excludeVehicleId?: string
): Promise<boolean> {
  const existing = await findGarageVehicleByNormalizedPlate(garageId, plate);
  if (!existing) {
    return false;
  }

  if (excludeVehicleId && existing.id === excludeVehicleId) {
    return false;
  }

  return existing.customerId === customerId;
}

export async function getGarageCustomerVehicleCounts(
  garageId: string
): Promise<Map<string, number>> {
  const vehicles = await listGarageVehicles(garageId);
  return vehicles.reduce((acc, vehicle) => {
    const customerId = vehicle.customerId;
    if (!customerId) return acc;

    acc.set(customerId, (acc.get(customerId) ?? 0) + 1);
    return acc;
  }, new Map<string, number>());
}
