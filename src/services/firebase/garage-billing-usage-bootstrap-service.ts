import type {
  GarageBillingDocument,
  GarageUsageCurrentDocument,
  GarageUsageCounterItem
} from '@/types/firebase-models';
import { firebaseAdmin } from '@/lib/firebase-admin';

const BILLING_DOC_ID = 'current';
const USAGE_DOC_ID = 'current';

function toMonthlyPeriodBounds(now: Date): {
  periodKey: string;
  periodStartAt: string;
  periodEndAt: string;
} {
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  const nextMonthStart = new Date(Date.UTC(year, month + 1, 1, 0, 0, 0, 0));
  const monthEnd = new Date(nextMonthStart.getTime() - 1);

  return {
    periodKey: `${year}-${String(month + 1).padStart(2, '0')}`,
    periodStartAt: new Date(Date.UTC(year, month, 1, 0, 0, 0, 0)).toISOString(),
    periodEndAt: monthEnd.toISOString()
  };
}

function buildFreeTierBilling(nowIso: string): GarageBillingDocument {
  return {
    provider: 'paypal',
    planCode: 'free',
    billingCycle: 'monthly',
    status: 'active',
    trialEndsAt: null,
    currentPeriodEnd: null,
    lastPaidAt: null,
    cancelAtPeriodEnd: false,
    paypalSubscriptionId: null,
    paypalPlanId: null,
    paypalCustomerId: null,
    payerId: null,
    founderEligible: true,
    founderLockedUntil: null,
    lastWebhookEventId: null,
    webhookEventIdsRecent: [],
    createdAt: nowIso,
    updatedAt: nowIso
  };
}

function buildFreeTierUsageCounters(nowIso: string): GarageUsageCounterItem[] {
  return [
    {
      key: 'users',
      value: 0,
      limit: 1,
      resetPolicy: 'forever',
      enabled: true,
      updatedAt: nowIso
    },
    {
      key: 'locations',
      value: 1,
      limit: 1,
      resetPolicy: 'forever',
      enabled: true,
      updatedAt: nowIso
    },
    {
      key: 'workOrders',
      value: 0,
      limit: 25,
      resetPolicy: 'monthly',
      enabled: true,
      updatedAt: nowIso
    },
    {
      key: 'customerVehicleHistory',
      value: 0,
      limit: -1,
      resetPolicy: 'forever',
      enabled: true,
      updatedAt: nowIso
    },
    {
      key: 'serviceManagement',
      value: 0,
      limit: -1,
      resetPolicy: 'forever',
      enabled: true,
      updatedAt: nowIso
    },
    {
      key: 'basicInvoices',
      value: 0,
      limit: -1,
      resetPolicy: 'forever',
      enabled: true,
      updatedAt: nowIso
    },
    {
      key: 'communityEmailSupport',
      value: 0,
      limit: -1,
      resetPolicy: 'forever',
      enabled: true,
      updatedAt: nowIso
    }
  ];
}

function buildFreeTierUsage(now: Date): GarageUsageCurrentDocument {
  const nowIso = now.toISOString();
  const period = toMonthlyPeriodBounds(now);

  return {
    periodKey: period.periodKey,
    periodStartAt: period.periodStartAt,
    periodEndAt: period.periodEndAt,
    counters: buildFreeTierUsageCounters(nowIso),
    createdAt: nowIso,
    updatedAt: nowIso
  };
}

/**
 * Ensures onboarding-created garages have baseline free-tier billing + usage docs.
 * The write is idempotent and does not overwrite existing billing/usage state.
 */
export async function ensureGarageBillingAndUsageBootstrap(
  garageId: string
): Promise<void> {
  const garageRef = firebaseAdmin.db.collection('garages').doc(garageId);
  const billingRef = garageRef.collection('billing').doc(BILLING_DOC_ID);
  const usageRef = garageRef.collection('usage').doc(USAGE_DOC_ID);
  const now = new Date();
  const nowIso = now.toISOString();

  await firebaseAdmin.db.runTransaction(async (tx: any) => {
    const [billingSnap, usageSnap] = await Promise.all([
      tx.get(billingRef),
      tx.get(usageRef)
    ]);

    if (!billingSnap.exists) {
      tx.set(billingRef, buildFreeTierBilling(nowIso));
    }

    if (!usageSnap.exists) {
      tx.set(usageRef, buildFreeTierUsage(now));
    }
  });
}
