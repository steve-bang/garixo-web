import { NextResponse } from 'next/server';

/**
 * Create Subscription (PayPal)
 *
 * Endpoint intent:
 * - Starts a PayPal subscription checkout flow for the authenticated garage context.
 * - Returns PayPal approval URL for frontend redirect.
 *
 * Data-flow responsibilities:
 * - Validate requested plan and billing cycle.
 * - Resolve internal plan -> PayPal plan id mapping.
 * - Create PayPal subscription with return/cancel callback URLs.
 * - Persist local billing snapshot before redirect so callback/webhook handlers
 *   always have a deterministic local reference document.
 *
 * Security model:
 * - Requires authenticated session.
 * - Uses garage context from session to scope write path:
 *   `garages/{garageId}/billing/current`
 *
 * Notes:
 * - This endpoint initializes/updates checkout context; it does not finalize
 *   billing lifecycle state. Final status reconciliation happens in
 *   capture-approval/webhook handlers.
 */

import { getPayPalPlanId } from '@/config/billing';
import { env } from '@/config/env';
import { createSubscriptionInputSchema } from '@/features/billing/schema';
import type { BillingStatus } from '@/features/billing/types';
import { auth } from '@/lib/auth';
import { getRequestGarageId } from '@/lib/auth/garage-context';
import { errorResponse, successResponse } from '@/lib/api/handler';
import { firebaseAdmin } from '@/lib/firebase-admin';
import { createPayPalSubscription } from '@/services/paypal/paypal-client';
import type { GarageBillingDocument } from '@/types/firebase-models';

type CreateSubscriptionApiResult = {
  approveUrl: string;
  subscriptionId: string;
};

const BILLING_DOC_ID = 'current';

function getBaseUrl(request: Request): string {
  const requestOrigin = request.headers.get('origin');
  if (requestOrigin) {
    return requestOrigin;
  }

  return new URL(env.NEXTAUTH_URL).origin;
}

function normalizeStatus(
  current?: Partial<GarageBillingDocument> | null
): BillingStatus {
  // Keep the last known status unless we need an initial default.
  return current?.status ?? 'cancelled';
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const session = await auth();
    // Billing checkout creation is user-scoped and requires authentication.
    if (!session?.user?.id) {
      return errorResponse(new Error('Unauthorized'), 401);
    }

    const garageId = await getRequestGarageId(session);
    if (!garageId) {
      return errorResponse(new Error('Garage not found'), 404);
    }

    const body = await request.json().catch(() => null);
    const parsed = createSubscriptionInputSchema.safeParse(body);
    // Guard early with strict schema validation to avoid invalid plan/cycle combinations.
    if (!parsed.success) {
      return errorResponse(new Error('Invalid subscription request'), 400);
    }

    const planId = getPayPalPlanId(
      parsed.data.planCode,
      parsed.data.billingCycle
    );
    const baseUrl = getBaseUrl(request);

    const { subscription, approveUrl } = await createPayPalSubscription({
      planId,
      returnUrl: `${baseUrl}/dashboard/settings/subscription?paypal=success`,
      cancelUrl: `${baseUrl}/dashboard/settings/subscription?paypal=cancelled`,
      // custom_id lets webhook processing map events back to the correct garage.
      customId: garageId
    });

    if (!subscription.id || !approveUrl) {
      return errorResponse(
        new Error('Unable to start subscription checkout at this time.'),
        502
      );
    }

    const billingRef = firebaseAdmin.db
      .collection('garages')
      .doc(garageId)
      .collection('billing')
      .doc(BILLING_DOC_ID);

    const billingSnap = await billingRef.get();
    const current = billingSnap.exists
      ? (billingSnap.data() as Partial<GarageBillingDocument>)
      : null;
    const now = new Date().toISOString();

    // Persist checkout context before redirect to avoid race conditions between
    // callback/webhook arrivals and local billing document initialization.
    const payload: GarageBillingDocument = {
      provider: 'paypal',
      planCode: parsed.data.planCode,
      billingCycle: parsed.data.billingCycle,
      status: normalizeStatus(current),
      trialEndsAt: current?.trialEndsAt ?? null,
      currentPeriodEnd: current?.currentPeriodEnd ?? null,
      lastPaidAt: current?.lastPaidAt ?? null,
      cancelAtPeriodEnd: current?.cancelAtPeriodEnd ?? false,
      paypalSubscriptionId: subscription.id,
      paypalPlanId: subscription.plan_id ?? planId,
      paypalCustomerId:
        current?.paypalCustomerId ??
        subscription.subscriber?.email_address ??
        null,
      payerId: subscription.subscriber?.payer_id ?? current?.payerId ?? null,
      founderEligible: current?.founderEligible ?? true,
      founderLockedUntil: current?.founderLockedUntil ?? null,
      lastWebhookEventId: current?.lastWebhookEventId ?? null,
      webhookEventIdsRecent: current?.webhookEventIdsRecent ?? [],
      createdAt: current?.createdAt ?? now,
      updatedAt: now
    };

    await billingRef.set(payload, { merge: true });

    // Frontend should always redirect to this URL for user approval.
    return successResponse<CreateSubscriptionApiResult>({
      approveUrl,
      subscriptionId: subscription.id
    });
  } catch (error) {
    return errorResponse(error);
  }
}
