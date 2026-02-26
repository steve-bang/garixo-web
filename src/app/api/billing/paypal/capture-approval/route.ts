import { NextResponse } from 'next/server';

import { getPayPalPlanMap } from '@/config/billing';
import { captureApprovalInputSchema } from '@/features/billing/schema';
import type {
  BillingCycle,
  BillingStatus,
  PlanCode
} from '@/features/billing/types';
import { auth } from '@/lib/auth';
import { getRequestGarage } from '@/lib/auth/garage-context';
import { errorResponse, successResponse } from '@/lib/api/handler';
import { firebaseAdmin } from '@/lib/firebase-admin';
import { getPayPalSubscription } from '@/services/paypal/paypal-client';
import type { GarageBillingDocument } from '@/types/firebase-models';

const BILLING_DOC_ID = 'current';

type CaptureApprovalApiResult = {
  status: BillingStatus;
  paypalStatus: string | null;
  subscriptionId: string;
};

function mapPayPalStatus(
  paypalStatus: string | undefined,
  fallback: BillingStatus
): BillingStatus {
  const value = paypalStatus?.toUpperCase();

  if (
    value === 'ACTIVE' ||
    value === 'APPROVAL_PENDING' ||
    value === 'APPROVED'
  ) {
    return 'active';
  }
  if (value === 'SUSPENDED') {
    return 'suspended';
  }
  if (value === 'CANCELLED' || value === 'EXPIRED') {
    return 'cancelled';
  }

  return fallback;
}

function resolvePlan(planId: string | null): {
  planCode: PlanCode;
  billingCycle: BillingCycle;
} | null {
  if (!planId) return null;

  const planMap = getPayPalPlanMap();
  const entries: Array<{
    planCode: PlanCode;
    billingCycle: BillingCycle;
    id: string;
  }> = [
    {
      planCode: 'starter',
      billingCycle: 'monthly',
      id: planMap.starter.monthly
    },
    { planCode: 'starter', billingCycle: 'annual', id: planMap.starter.annual },
    { planCode: 'growth', billingCycle: 'monthly', id: planMap.growth.monthly },
    { planCode: 'growth', billingCycle: 'annual', id: planMap.growth.annual }
  ];

  const matched = entries.find((item) => item.id === planId);
  if (!matched) return null;

  return {
    planCode: matched.planCode,
    billingCycle: matched.billingCycle
  };
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

    const body = await request.json().catch(() => null);
    const parsed = captureApprovalInputSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(new Error('Invalid capture request.'), 400);
    }

    const subscription = await getPayPalSubscription(
      parsed.data.subscriptionId
    );
    if (!subscription.id) {
      return errorResponse(new Error('Subscription not found.'), 404);
    }

    const billingRef = firebaseAdmin.db
      .collection('garages')
      .doc(garage.id)
      .collection('billing')
      .doc(BILLING_DOC_ID);

    const billingSnap = await billingRef.get();
    const current = billingSnap.exists
      ? (billingSnap.data() as Partial<GarageBillingDocument>)
      : null;
    const now = new Date().toISOString();

    const resolvedFromPlanId = resolvePlan(subscription.plan_id ?? null);
    const planCode = resolvedFromPlanId?.planCode ?? current?.planCode;
    const billingCycle =
      resolvedFromPlanId?.billingCycle ?? current?.billingCycle;

    if (!planCode || !billingCycle) {
      return errorResponse(new Error('Unable to resolve billing plan.'), 409);
    }

    const status = mapPayPalStatus(
      subscription.status,
      current?.status ?? 'active'
    );

    const payload: GarageBillingDocument = {
      provider: 'paypal',
      planCode,
      billingCycle,
      status,
      trialEndsAt: current?.trialEndsAt ?? null,
      currentPeriodEnd:
        subscription.billing_info?.next_billing_time ??
        current?.currentPeriodEnd ??
        null,
      cancelAtPeriodEnd: current?.cancelAtPeriodEnd ?? false,
      paypalSubscriptionId: subscription.id,
      paypalPlanId: subscription.plan_id ?? current?.paypalPlanId ?? null,
      paypalCustomerId:
        subscription.subscriber?.email_address ??
        current?.paypalCustomerId ??
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

    return successResponse<CaptureApprovalApiResult>({
      status,
      paypalStatus: subscription.status ?? null,
      subscriptionId: subscription.id
    });
  } catch (error) {
    return errorResponse(error);
  }
}
