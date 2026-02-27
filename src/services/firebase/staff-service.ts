import type { Staff, StaffStatus } from '@/features/staff/types';
import type { PlanCode } from '@/features/billing/types';
import { firebaseAdmin } from '@/lib/firebase-admin';
import type {
  GarageBillingDocument,
  GarageUsageCurrentDocument
} from '@/types/firebase-models';

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
  completedJobs?: number;
  branchId?: string;
  createdAt?: string;
  updatedAt?: string;
};

const BILLING_DOC_ID = 'current';
const USAGE_DOC_ID = 'current';
const USERS_COUNTER_KEY = 'users';

const PLAN_USER_LIMITS: Record<PlanCode, number> = {
  free: 1,
  starter: 5,
  growth: 12
};

export class StaffQuotaExceededError extends Error {
  constructor(message = 'Your current plan does not have enough user slots.') {
    super(message);
    this.name = 'StaffQuotaExceededError';
  }
}

function staffCollection(garageId: string) {
  return firebaseAdmin.db
    .collection('garages')
    .doc(garageId)
    .collection('staff');
}

function billingDocRef(garageId: string) {
  return firebaseAdmin.db
    .collection('garages')
    .doc(garageId)
    .collection('billing')
    .doc(BILLING_DOC_ID);
}

function usageDocRef(garageId: string) {
  return firebaseAdmin.db
    .collection('garages')
    .doc(garageId)
    .collection('usage')
    .doc(USAGE_DOC_ID);
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
    completedJobs: data.completedJobs ?? 0,
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
    completedJobs: input.completedJobs ?? 0,
    branchId: input.branchId ?? '',
    createdAt: now,
    updatedAt: now
  };

  await ref.set(payload);
  return mapDoc(ref.id, payload);
}

function resolvePlanUserLimit(planCode: PlanCode | null | undefined): number {
  if (!planCode) {
    return PLAN_USER_LIMITS.free;
  }

  return PLAN_USER_LIMITS[planCode] ?? PLAN_USER_LIMITS.free;
}

/**
 * Checks whether a garage can add `quantity` new staff users under current plan usage.
 * Source of truth:
 * - Plan from `garages/{garageId}/billing/current`
 * - Current usage from `garages/{garageId}/usage/current` counter key `users`
 */
export async function canCreateGarageStaff(
  garageId: string,
  quantity: number
): Promise<{
  allowed: boolean;
  currentUsers: number;
  limit: number;
  remaining: number;
}> {
  const safeQuantity = Number.isFinite(quantity)
    ? Math.max(1, Math.floor(quantity))
    : 1;
  const [billingSnap, usageSnap] = await Promise.all([
    billingDocRef(garageId).get(),
    usageDocRef(garageId).get()
  ]);

  const billing = billingSnap.exists
    ? (billingSnap.data() as Partial<GarageBillingDocument>)
    : null;
  const usage = usageSnap.exists
    ? (usageSnap.data() as Partial<GarageUsageCurrentDocument>)
    : null;

  const usersCounter = usage?.counters?.find(
    (counter) => counter.key === USERS_COUNTER_KEY
  );
  const currentUsers = Math.max(0, usersCounter?.value ?? 1);
  const limit = Math.max(
    -1,
    usersCounter?.limit ?? resolvePlanUserLimit(billing?.planCode)
  );
  const remaining = limit < 0 ? Number.MAX_SAFE_INTEGER : limit - currentUsers;
  const allowed = limit < 0 || currentUsers + safeQuantity <= limit;

  return {
    allowed,
    currentUsers,
    limit,
    remaining: Math.max(0, remaining)
  };
}

/**
 * Atomically creates a staff record and increments users usage in `usage/current`.
 * Throws `StaffQuotaExceededError` if requested quantity exceeds plan/usage capacity.
 */
export async function createGarageStaffWithUsageCheck(
  garageId: string,
  input: Omit<Staff, 'id' | 'createdAt' | 'updatedAt'>,
  quantity = 1
): Promise<Staff> {
  const safeQuantity = Number.isFinite(quantity)
    ? Math.max(1, Math.floor(quantity))
    : 1;
  const now = new Date().toISOString();
  const newStaffRef = staffCollection(garageId).doc();
  const newStaffPayload: StaffFirestoreDoc = {
    fullName: input.fullName,
    phone: input.phone,
    phoneNormalized: normalizePhone(input.phone),
    email: input.email ?? '',
    avatar: input.avatar ?? '',
    role: input.role,
    status: input.status,
    currentJobs: input.currentJobs,
    completedJobs: input.completedJobs ?? 0,
    branchId: input.branchId ?? '',
    createdAt: now,
    updatedAt: now
  };

  await firebaseAdmin.db.runTransaction(async (transaction: any) => {
    const billingRef = billingDocRef(garageId);
    const usageRef = usageDocRef(garageId);
    const [billingSnap, usageSnap] = await Promise.all([
      transaction.get(billingRef),
      transaction.get(usageRef)
    ]);

    const billing = billingSnap.exists
      ? (billingSnap.data() as Partial<GarageBillingDocument>)
      : null;
    const usage = usageSnap.exists
      ? (usageSnap.data() as Partial<GarageUsageCurrentDocument>)
      : null;

    const counters = usage?.counters ?? [];
    const usersIndex = counters.findIndex(
      (counter) => counter.key === USERS_COUNTER_KEY
    );
    const usersCounter = usersIndex >= 0 ? counters[usersIndex] : undefined;
    const currentUsers = Math.max(0, usersCounter?.value ?? 1);
    const limit = Math.max(
      -1,
      usersCounter?.limit ?? resolvePlanUserLimit(billing?.planCode)
    );
    const isAllowed = limit < 0 || currentUsers + safeQuantity <= limit;

    if (!isAllowed) {
      throw new StaffQuotaExceededError();
    }

    transaction.set(newStaffRef, newStaffPayload);

    if (usageSnap.exists) {
      const nextCounters = [...counters];
      if (usersIndex >= 0) {
        nextCounters[usersIndex] = {
          ...nextCounters[usersIndex],
          value: currentUsers + safeQuantity,
          updatedAt: now
        };
      } else {
        nextCounters.push({
          key: USERS_COUNTER_KEY,
          value: currentUsers + safeQuantity,
          limit: resolvePlanUserLimit(billing?.planCode),
          resetPolicy: 'forever',
          enabled: true,
          updatedAt: now
        });
      }

      transaction.set(
        usageRef,
        {
          counters: nextCounters,
          updatedAt: now
        },
        { merge: true }
      );
    }
  });

  return mapDoc(newStaffRef.id, newStaffPayload);
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

export async function incrementGarageStaffCurrentJobs(
  garageId: string,
  staffId: string,
  delta: number
): Promise<Staff | null> {
  const ref = staffCollection(garageId).doc(staffId);
  const existing = await ref.get();
  if (!existing.exists) {
    return null;
  }

  const data = existing.data() as StaffFirestoreDoc;
  const next: StaffFirestoreDoc = {
    currentJobs: Math.max(0, (data.currentJobs ?? 0) + delta),
    updatedAt: new Date().toISOString()
  };

  await ref.set(next, { merge: true });
  return mapDoc(existing.id, { ...data, ...next });
}

export async function incrementGarageStaffCompletedJobs(
  garageId: string,
  staffId: string,
  delta: number
): Promise<Staff | null> {
  const ref = staffCollection(garageId).doc(staffId);
  const existing = await ref.get();
  if (!existing.exists) {
    return null;
  }

  const data = existing.data() as StaffFirestoreDoc;
  const next: StaffFirestoreDoc = {
    completedJobs: Math.max(0, (data.completedJobs ?? 0) + delta),
    updatedAt: new Date().toISOString()
  };

  await ref.set(next, { merge: true });
  return mapDoc(existing.id, { ...data, ...next });
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
