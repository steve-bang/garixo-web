import type { Staff, StaffStatus } from '@/features/staff/types';
import { firebaseAdmin } from '@/lib/firebase-admin';

type StaffFirestoreDoc = {
  id?: string;
  fullName?: string;
  phone?: string;
  phoneNormalized?: string;
  email?: string;
  avatar?: string;
  role?: Staff['role'];
  status?: StaffStatus;
  currentJobs?: number;
  branchId?: string;
  createdAt?: string;
  updatedAt?: string;
};

function staffCollection(garageId: string) {
  return firebaseAdmin.db
    .collection('garages')
    .doc(garageId)
    .collection('staff');
}

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

function mapDoc(id: string, data: StaffFirestoreDoc): Staff {
  const now = new Date().toISOString();

  return {
    id,
    fullName: data.fullName ?? '',
    phone: data.phone ?? '',
    email: data.email ?? '',
    avatar: data.avatar ?? '',
    role: data.role ?? 'STAFF',
    status: data.status ?? 'ACTIVE',
    currentJobs: data.currentJobs ?? 0,
    branchId: data.branchId ?? '',
    createdAt: data.createdAt ?? now,
    updatedAt: data.updatedAt ?? now
  };
}

export async function listGarageStaff(garageId: string): Promise<Staff[]> {
  const snap = await staffCollection(garageId).get();
  return snap.docs
    .map((doc: { id: string; data: () => unknown }) =>
      mapDoc(doc.id, doc.data() as StaffFirestoreDoc)
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function findGarageStaffById(
  garageId: string,
  staffId: string
): Promise<Staff | null> {
  const snap = await staffCollection(garageId).doc(staffId).get();
  if (!snap.exists) {
    return null;
  }

  return mapDoc(snap.id, snap.data() as StaffFirestoreDoc);
}

export async function isGarageStaffPhoneExists(
  garageId: string,
  phone: string,
  excludeId?: string
): Promise<boolean> {
  const normalized = normalizePhone(phone);
  const items = await listGarageStaff(garageId);

  return items.some(
    (item) =>
      normalizePhone(item.phone) === normalized &&
      (!excludeId || item.id !== excludeId)
  );
}

export async function createGarageStaff(
  garageId: string,
  input: Omit<Staff, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Staff> {
  const ref = staffCollection(garageId).doc();
  const now = new Date().toISOString();
  const payload: StaffFirestoreDoc = {
    fullName: input.fullName,
    phone: input.phone,
    phoneNormalized: normalizePhone(input.phone),
    email: input.email ?? '',
    avatar: input.avatar ?? '',
    role: input.role,
    status: input.status,
    currentJobs: input.currentJobs,
    branchId: input.branchId ?? '',
    createdAt: now,
    updatedAt: now
  };

  await ref.set(payload);
  return mapDoc(ref.id, payload);
}

export async function updateGarageStaff(
  garageId: string,
  staffId: string,
  input: Partial<Omit<Staff, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<Staff | null> {
  const ref = staffCollection(garageId).doc(staffId);
  const existing = await ref.get();

  if (!existing.exists) {
    return null;
  }

  const payload: StaffFirestoreDoc = {
    ...input,
    ...(input.phone ? { phoneNormalized: normalizePhone(input.phone) } : {}),
    updatedAt: new Date().toISOString()
  };

  await ref.set(payload, { merge: true });
  const updated = await ref.get();
  if (!updated.exists) {
    return null;
  }

  return mapDoc(updated.id, updated.data() as StaffFirestoreDoc);
}

export async function deleteGarageStaff(
  garageId: string,
  staffId: string
): Promise<Staff | null> {
  const ref = staffCollection(garageId).doc(staffId);
  const existing = await ref.get();

  if (!existing.exists) {
    return null;
  }

  const staff = mapDoc(existing.id, existing.data() as StaffFirestoreDoc);
  await ref.delete();
  return staff;
}
