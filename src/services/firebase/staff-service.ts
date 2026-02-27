import type { Staff, StaffStatus } from '@/features/staff/types';
import type { PlanCode } from '@/features/billing/types';
import { firebaseAdmin } from '@/lib/firebase-admin';
import type {
  GarageBillingDocument,
  GarageUsageCurrentDocument
} from '@/types/firebase-models';

/**
 * Staff persistence + quota rules service.
 *
 * Responsibilities:
 * - CRUD operations for `garages/{garageId}/staff`.
 * - Plan-aware seat checks using billing + usage documents.
 * - Atomic staff creation with usage counter updates.
 *
 * Notes:
 * - This module is server-only and should be called from API routes/services.
 * - Phone numbers are normalized for uniqueness checks.
 */
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
const OWNER_BASELINE_USERS = 1;

export class StaffQuotaExceededError extends Error {
  constructor(message = 'Your current plan does not have enough user slots.') {
    super(message);
    this.name = 'StaffQuotaExceededError';
  }
}

// Collection helpers are centralized to avoid path drift across call sites.
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

function buildStaffPayload(
  input: Omit<Staff, 'id' | 'createdAt' | 'updatedAt'>,
  now: string
): StaffFirestoreDoc {
  return {
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
  const payload = buildStaffPayload(input, now);

  await ref.set(payload);
  return mapDoc(ref.id, payload);
}

function resolvePlanUserLimit(planCode: PlanCode | null | undefined): number {
  if (!planCode) {
    return PLAN_USER_LIMITS.free;
  }

  return PLAN_USER_LIMITS[planCode] ?? PLAN_USER_LIMITS.free;
}

function sanitizeQuantity(quantity: number): number {
  if (!Number.isFinite(quantity)) {
    return 1;
  }

  return Math.max(1, Math.floor(quantity));
}

type SeatUsageState = {
  counters: NonNullable<GarageUsageCurrentDocument['counters']>;
  usersIndex: number;
  currentUsers: number;
  limit: number;
};

function resolveSeatUsageState(
  usage: Partial<GarageUsageCurrentDocument> | null,
  billing: Partial<GarageBillingDocument> | null,
  floor = OWNER_BASELINE_USERS
): SeatUsageState {
  const counters = usage?.counters ?? [];
  const usersIndex = counters.findIndex(
    (counter) => counter.key === USERS_COUNTER_KEY
  );
  const usersCounter = usersIndex >= 0 ? counters[usersIndex] : undefined;

  return {
    counters,
    usersIndex,
    currentUsers: Math.max(floor, usersCounter?.value ?? OWNER_BASELINE_USERS),
    limit: Math.max(
      -1,
      usersCounter?.limit ?? resolvePlanUserLimit(billing?.planCode)
    )
  };
}

function withUsersCounterUpdated(
  state: SeatUsageState,
  nextUsers: number,
  now: string
): NonNullable<GarageUsageCurrentDocument['counters']> {
  const nextCounters = [...state.counters];

  if (state.usersIndex >= 0) {
    nextCounters[state.usersIndex] = {
      ...nextCounters[state.usersIndex],
      value: nextUsers,
      updatedAt: now
    };
    return nextCounters;
  }

  nextCounters.push({
    key: USERS_COUNTER_KEY,
    value: nextUsers,
    limit: state.limit,
    resetPolicy: 'forever',
    enabled: true,
    updatedAt: now
  });

  return nextCounters;
}

/**
 * Increments `usage/current.counters['users']` by `quantity`.
 * Enforces seat limit from usage counter (if present) or current billing plan.
 */
export async function consumeGarageUserUsageQuantity(
  garageId: string,
  quantity: number
): Promise<{ currentUsers: number; limit: number }> {
  const safeQuantity = sanitizeQuantity(quantity);
  const usageRef = usageDocRef(garageId);
  const billingRef = billingDocRef(garageId);
  const now = new Date().toISOString();

  let result = { currentUsers: 1, limit: PLAN_USER_LIMITS.free };

  await firebaseAdmin.db.runTransaction(async (transaction: any) => {
    const [usageSnap, billingSnap] = await Promise.all([
      transaction.get(usageRef),
      transaction.get(billingRef)
    ]);

    const usage = usageSnap.exists
      ? (usageSnap.data() as Partial<GarageUsageCurrentDocument>)
      : null;
    const billing = billingSnap.exists
      ? (billingSnap.data() as Partial<GarageBillingDocument>)
      : null;
    const state = resolveSeatUsageState(usage, billing);
    const nextUsers = state.currentUsers + safeQuantity;

    if (state.limit >= 0 && nextUsers > state.limit) {
      throw new StaffQuotaExceededError();
    }

    const nextCounters = withUsersCounterUpdated(state, nextUsers, now);

    transaction.set(
      usageRef,
      {
        counters: nextCounters,
        updatedAt: now
      },
      { merge: true }
    );

    result = { currentUsers: nextUsers, limit: state.limit };
  });

  return result;
}

/**
 * Decrements `usage/current.counters['users']` by `quantity`.
 * Floors at 1 to keep owner seat as the minimum baseline.
 */
export async function releaseGarageUserUsageQuantity(
  garageId: string,
  quantity: number
): Promise<{ currentUsers: number; limit: number }> {
  const safeQuantity = sanitizeQuantity(quantity);
  const usageRef = usageDocRef(garageId);
  const billingRef = billingDocRef(garageId);
  const now = new Date().toISOString();

  let result = { currentUsers: 1, limit: PLAN_USER_LIMITS.free };

  await firebaseAdmin.db.runTransaction(async (transaction: any) => {
    const [usageSnap, billingSnap] = await Promise.all([
      transaction.get(usageRef),
      transaction.get(billingRef)
    ]);

    const usage = usageSnap.exists
      ? (usageSnap.data() as Partial<GarageUsageCurrentDocument>)
      : null;
    const billing = billingSnap.exists
      ? (billingSnap.data() as Partial<GarageBillingDocument>)
      : null;
    const state = resolveSeatUsageState(usage, billing);
    const nextUsers = Math.max(
      OWNER_BASELINE_USERS,
      state.currentUsers - safeQuantity
    );
    const nextCounters = withUsersCounterUpdated(state, nextUsers, now);

    transaction.set(
      usageRef,
      {
        counters: nextCounters,
        updatedAt: now
      },
      { merge: true }
    );

    result = { currentUsers: nextUsers, limit: state.limit };
  });

  return result;
}

/**
 * Read-only capacity check used by API/UI to provide early feedback before mutation.
 *
 * Source of truth:
 * - Plan: `garages/{garageId}/billing/current`
 * - Current seat usage: `garages/{garageId}/usage/current` -> counters[`users`]
 *
 * If usage counter is missing, we fallback to plan limits and a conservative baseline.
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
  const safeQuantity = sanitizeQuantity(quantity);
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

  const state = resolveSeatUsageState(usage, billing, 0);
  const remaining =
    state.limit < 0
      ? Number.MAX_SAFE_INTEGER
      : state.limit - state.currentUsers;
  const allowed =
    state.limit < 0 || state.currentUsers + safeQuantity <= state.limit;

  return {
    allowed,
    currentUsers: state.currentUsers,
    limit: state.limit,
    remaining: Math.max(0, remaining)
  };
}

/**
 * Atomic mutation for adding staff with seat enforcement.
 *
 * Why transaction:
 * - Prevents race conditions when multiple create requests happen at the same time.
 * - Ensures staff write and usage counter update succeed/fail together.
 *
 * Throws `StaffQuotaExceededError` when adding `quantity` would exceed seat limit.
 */
export async function createGarageStaffWithUsageCheck(
  garageId: string,
  input: Omit<Staff, 'id' | 'createdAt' | 'updatedAt'>,
  quantity = 1
): Promise<Staff> {
  const safeQuantity = sanitizeQuantity(quantity);
  const now = new Date().toISOString();
  const newStaffRef = staffCollection(garageId).doc();
  const newStaffPayload = buildStaffPayload(input, now);

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
    const state = resolveSeatUsageState(usage, billing, 0);
    const isAllowed =
      state.limit < 0 || state.currentUsers + safeQuantity <= state.limit;

    // Guard before write: seat allocation cannot exceed current plan capacity.
    if (!isAllowed) {
      throw new StaffQuotaExceededError();
    }

    // Persist staff first, then synchronize usage counter in the same transaction.
    transaction.set(newStaffRef, newStaffPayload);

    if (usageSnap.exists) {
      const nextUsers = state.currentUsers + safeQuantity;
      const nextCounters = withUsersCounterUpdated(state, nextUsers, now);

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
  // Delete keeps current behavior: remove staff document only.
  // Seat/usage reconciliation can be layered later if required by product rules.
  const ref = staffCollection(garageId).doc(staffId);
  const existing = await ref.get();

  if (!existing.exists) {
    return null;
  }

  const staff = mapDoc(existing.id, existing.data() as StaffFirestoreDoc);
  await ref.delete();
  return staff;
}
