import { NextResponse } from 'next/server';

/**
 * Capture Approval (PayPal Subscription)
 *
 * Endpoint intent:
 * - Runs when the user returns from PayPal approval flow.
 * - Reconciles local Firestore billing state with current PayPal subscription data.
 *
 * Why this exists:
 * - Webhooks are asynchronous and may arrive later.
 * - This route gives the UI immediate consistency after redirect.
 *
 * Key responsibilities:
 * - Enforce owner-only authorization and garage ownership checks.
 * - Fetch PayPal subscription by id and validate garage binding via `custom_id`.
 * - Derive internal status (`trialing`, `active`, etc.) from provider state.
 * - Persist canonical billing fields in `garages/{garageId}/billing/current`.
 *
 * Note:
 * - Webhook processing remains the long-term source of truth for lifecycle events.
 */

import { getPayPalPlanMap } from '@/config/billing';
import { env } from '@/config/env';
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
import {
  getPayPalSubscription,
  type PayPalSubscription
} from '@/services/paypal/paypal-client';
import { syncUsageCurrentByPlan } from '@/services/firebase/usage-plan-sync-service';
import type { GarageBillingDocument } from '@/types/firebase-models';

const BILLING_DOC_ID = 'current';
const WEBHOOK_DEBUG_ENABLED = env.DEBUG_PAYPAL_WEBHOOK === 'true';

type CaptureApprovalApiResult = {
  status: BillingStatus;
  paypalStatus: string | null;
  subscriptionId: string;
};

function mapPayPalStatus(
  paypalStatus: string | undefined,
  fallback: BillingStatus
): BillingStatus {
  // Normalize provider-specific status values to the internal billing enum.
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

function isTrialingSubscription(subscription: PayPalSubscription): boolean {
  // Trial state is inferred from PayPal cycle metadata, not only top-level status.
  if (subscription.status !== 'ACTIVE') {
    return false;
  }

  const billingInfo = subscription.billing_info;
  if (!billingInfo) {
    return false;
  }

  const cycles = billingInfo.cycle_executions ?? [];

  const trialCycle = cycles.find(
    (cycle) =>
      cycle.tenure_type === 'TRIAL' &&
      cycle.total_cycles &&
      cycle.total_cycles > 0
  );

  if (!trialCycle) {
    return false;
  }

  const regularCycle = cycles.find((cycle) => cycle.tenure_type === 'REGULAR');

  if (
    regularCycle &&
    regularCycle.cycles_completed &&
    regularCycle.cycles_completed > 0
  ) {
    return false;
  }

  const nextBillingTime = billingInfo.next_billing_time;
  if (!nextBillingTime) {
    return false;
  }

  const now = new Date();
  const nextBillingDate = new Date(nextBillingTime);

  return now < nextBillingDate;
}

function summarizeCycles(subscription: PayPalSubscription): Array<{
  tenureType: string;
  completed: number;
  remaining: number | null;
  total: number | null;
}> {
  const cycles = subscription.billing_info?.cycle_executions ?? [];
  return cycles.map((cycle) => ({
    tenureType: cycle.tenure_type ?? 'UNKNOWN',
    completed: cycle.cycles_completed ?? 0,
    remaining:
      typeof cycle.cycles_remaining === 'number'
        ? cycle.cycles_remaining
        : null,
    total: typeof cycle.total_cycles === 'number' ? cycle.total_cycles : null
  }));
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
    if (WEBHOOK_DEBUG_ENABLED) {
      console.info('[billing][capture-approval] fetched subscription', {
        requestedSubscriptionId: parsed.data.subscriptionId,
        paypalSubscriptionId: subscription.id,
        paypalStatus: subscription.status ?? null,
        planId: subscription.plan_id ?? null,
        nextBillingTime: subscription.billing_info?.next_billing_time ?? null,
        cycles: summarizeCycles(subscription)
      });
    }

    if (!subscription.id) {
      return errorResponse(new Error('Subscription not found.'), 404);
    }
    if (subscription.custom_id && subscription.custom_id !== garage.id) {
      return errorResponse(
        new Error('Subscription does not belong to this garage.'),
        403
      );
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

    const mappedStatus = mapPayPalStatus(
      subscription.status,
      current?.status ?? 'active'
    );

    // Product rule: if no successful payment has been recorded yet, treat as trialing.
    // Keep a safety guard to avoid overriding terminal statuses.
    const hasTrialingTenureByCycle = isTrialingSubscription(subscription);
    const hasTrialingTenureByBillingState = current?.lastPaidAt == null;
    const hasTrialingTenure =
      (hasTrialingTenureByBillingState || hasTrialingTenureByCycle) &&
      mappedStatus !== 'cancelled' &&
      mappedStatus !== 'suspended';

    // Use trialing while the subscription is still in trial tenure; otherwise keep mapped status.
    const status: BillingStatus = hasTrialingTenure ? 'trialing' : mappedStatus;
    const periodEnd =
      subscription.billing_info?.next_billing_time ??
      current?.currentPeriodEnd ??
      null;
    const lastPaymentAt = subscription.billing_info?.last_payment?.time ?? null;

    const payload: GarageBillingDocument = {
      provider: 'paypal',
      planCode,
      billingCycle,
      status,
      trialEndsAt: hasTrialingTenure ? periodEnd : null,
      currentPeriodEnd: periodEnd,
      lastPaidAt: hasTrialingTenure
        ? (current?.lastPaidAt ?? null)
        : lastPaymentAt,
      cancelAtPeriodEnd: current?.cancelAtPeriodEnd ?? false,
      paypalSubscriptionId: subscription.id,
      paypalPlanId: subscription.plan_id ?? current?.paypalPlanId ?? null,
      paypalCustomerId:
        subscription.subscriber?.payer_id ??
        subscription.subscriber?.email_address ??
        current?.paypalCustomerId ??
        null,
      payerId: subscription.subscriber?.payer_id ?? current?.payerId ?? null,
      founderEligible: current?.founderEligible ?? true,
      founderLockedUntil: current?.founderLockedUntil ?? null,
      lastWebhookEventId: current?.lastWebhookEventId ?? null,
      webhookEventIdsRecent: current?.webhookEventIdsRecent ?? [],
      createdAt: current?.createdAt ?? now,
      updatedAt:
        subscription.status_update_time ?? subscription.update_time ?? now
    };

    if (WEBHOOK_DEBUG_ENABLED) {
      console.info('[billing][capture-approval] computed status', {
        subscriptionId: subscription.id,
        previousStatus: current?.status ?? null,
        mappedStatus,
        hasTrialingTenure,
        finalStatus: status,
        trialEndsAt: payload.trialEndsAt,
        currentPeriodEnd: payload.currentPeriodEnd
      });
    }

    await billingRef.set(payload, { merge: true });
    await syncUsageCurrentByPlan(garage.id, planCode);
    if (WEBHOOK_DEBUG_ENABLED) {
      console.info('[billing][capture-approval] billing document updated', {
        subscriptionId: subscription.id,
        finalStatus: payload.status
      });
    }

    return successResponse<CaptureApprovalApiResult>({
      status,
      paypalStatus: subscription.status ?? null,
      subscriptionId: subscription.id
    });
  } catch (error) {
    return errorResponse(error);
  }
}
