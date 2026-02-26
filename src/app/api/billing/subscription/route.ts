import { NextResponse } from 'next/server';

import type { BillingSnapshot } from '@/features/billing/types';
import { auth } from '@/lib/auth';
import { getRequestGarageId } from '@/lib/auth/garage-context';
import { errorResponse, successResponse } from '@/lib/api/handler';
import { firebaseAdmin } from '@/lib/firebase-admin';
import type { GarageBillingDocument } from '@/types/firebase-models';

const BILLING_DOC_ID = 'current';

function normalizeBillingSnapshot(
  billing: Partial<GarageBillingDocument> | null
): BillingSnapshot {
  const now = new Date().toISOString();

  return {
    provider: billing?.provider ?? 'paypal',
    planCode: billing?.planCode ?? 'starter',
    billingCycle: billing?.billingCycle ?? 'monthly',
    status: billing?.status ?? 'cancelled',
    trialEndsAt: billing?.trialEndsAt ?? null,
    currentPeriodEnd: billing?.currentPeriodEnd ?? null,
    lastPaidAt: billing?.lastPaidAt ?? null,
    cancelAtPeriodEnd: billing?.cancelAtPeriodEnd ?? false,
    paypalSubscriptionId: billing?.paypalSubscriptionId ?? null,
    paypalPlanId: billing?.paypalPlanId ?? null,
    payerId: billing?.payerId ?? null,
    founderEligible: billing?.founderEligible ?? true,
    founderLockedUntil: billing?.founderLockedUntil ?? null,
    updatedAt: billing?.updatedAt ?? now
  };
}

export async function GET(): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse(new Error('Unauthorized'), 401);
    }

    const garageId = await getRequestGarageId(session);
    if (!garageId) {
      return errorResponse(new Error('Garage not found.'), 404);
    }

    const billingRef = firebaseAdmin.db
      .collection('garages')
      .doc(garageId)
      .collection('billing')
      .doc(BILLING_DOC_ID);
    const snap = await billingRef.get();
    const billing = snap.exists
      ? (snap.data() as Partial<GarageBillingDocument>)
      : null;

    return successResponse(normalizeBillingSnapshot(billing));
  } catch (error) {
    return errorResponse(error);
  }
}
