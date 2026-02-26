import { NextResponse } from 'next/server';

import { cancelSubscriptionInputSchema } from '@/features/billing/schema';
import type { BillingStatus } from '@/features/billing/types';
import { auth } from '@/lib/auth';
import { getRequestGarage } from '@/lib/auth/garage-context';
import { errorResponse, successResponse } from '@/lib/api/handler';
import { firebaseAdmin } from '@/lib/firebase-admin';
import { cancelPayPalSubscription } from '@/services/paypal/paypal-client';
import type { GarageBillingDocument } from '@/types/firebase-models';

const BILLING_DOC_ID = 'current';

type CancelSubscriptionApiResult = {
  status: BillingStatus;
  cancelAtPeriodEnd: boolean;
  subscriptionId: string;
};

function hasFuturePeriod(periodEnd: string | null | undefined): boolean {
  if (!periodEnd) return false;
  const time = new Date(periodEnd).getTime();
  if (Number.isNaN(time)) return false;
  return time > Date.now();
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'owner') {
      return errorResponse(
        new Error('Only garage owners can request this action.'),
        403
      );
    }

    const garage = await getRequestGarage(session);
    if (!garage) {
      return errorResponse(new Error('Garage not found.'), 404);
    }
    if (garage.ownerUserId !== session.user.id) {
      return errorResponse(
        new Error('Only garage owners can request this action.'),
        403
      );
    }

    const body = await request.json().catch(() => ({}));
    const parsed = cancelSubscriptionInputSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(new Error('Invalid cancellation request.'), 400);
    }

    const billingRef = firebaseAdmin.db
      .collection('garages')
      .doc(garage.id)
      .collection('billing')
      .doc(BILLING_DOC_ID);

    const billingSnap = await billingRef.get();
    if (!billingSnap.exists) {
      return errorResponse(new Error('Subscription not found.'), 404);
    }

    const billing = billingSnap.data() as GarageBillingDocument;
    if (!billing.paypalSubscriptionId) {
      return errorResponse(new Error('Subscription not found.'), 404);
    }

    // Call PayPal first. Local state is updated only after upstream cancellation request succeeds.
    await cancelPayPalSubscription(
      billing.paypalSubscriptionId,
      parsed.data.reason
    );

    const now = new Date().toISOString();
    const keepActiveUntilPeriodEnd = hasFuturePeriod(billing.currentPeriodEnd);
    const status: BillingStatus = keepActiveUntilPeriodEnd
      ? 'active'
      : 'cancelled';

    await billingRef.set(
      {
        status,
        cancelAtPeriodEnd: keepActiveUntilPeriodEnd,
        updatedAt: now
      } satisfies Partial<GarageBillingDocument>,
      { merge: true }
    );

    return successResponse<CancelSubscriptionApiResult>({
      status,
      cancelAtPeriodEnd: keepActiveUntilPeriodEnd,
      subscriptionId: billing.paypalSubscriptionId
    });
  } catch (error) {
    return errorResponse(error);
  }
}
