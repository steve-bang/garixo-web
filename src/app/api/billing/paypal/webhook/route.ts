import { NextResponse } from 'next/server';

/**
 * PayPal Webhook (Billing Subscriptions)
 *
 * Endpoint intent:
 * - Consume PayPal billing webhooks and reconcile local billing state in Firestore.
 *
 * Trust boundary:
 * - Webhook signature verification is mandatory before any state mutation.
 * - Only verified provider events are allowed to affect billing status.
 *
 * Data consistency model:
 * - Idempotent processing using event ids (`lastWebhookEventId` + rolling history).
 * - Subscription snapshots are fetched from PayPal when needed to enrich local data
 *   (plan id, payer/customer refs, next billing time).
 * - Local writes are transaction-based to avoid race conditions on retries.
 *
 * Storage scope:
 * - `garages/{garageId}/billing/current`
 *
 * Lifecycle notes:
 * - This route is the long-term source of truth for status transitions.
 * - Callback/capture endpoints improve UX, while webhook ensures eventual correctness.
 */

import type { BillingStatus } from '@/features/billing/types';
import { firebaseAdmin } from '@/lib/firebase-admin';
import {
  getPayPalSubscription,
  type PayPalSubscription,
  verifyPayPalWebhookSignature
} from '@/services/paypal/paypal-client';
import type { GarageBillingDocument } from '@/types/firebase-models';

const BILLING_DOC_ID = 'current';
const MAX_RECENT_WEBHOOK_IDS = 50;

type PayPalWebhookEvent = {
  id?: string;
  event_type?: string;
  resource?: {
    id?: string;
    custom_id?: string;
    billing_agreement_id?: string;
  };
};

type PayPalSubscriptionSnapshot = {
  customId: string | null;
  planId: string | null;
  nextBillingTime: string | null;
  payerId: string | null;
  paypalCustomerId: string | null;
  lastPaymentTime: string | null;
  isTrialing: boolean;
  updatedAt: string | null;
};

function parseHeader(request: Request, name: string): string {
  return request.headers.get(name) ?? '';
}

function resolveSubscriptionId(event: PayPalWebhookEvent): string | null {
  const resource = event.resource;
  if (!resource) return null;

  // PayPal emits different resource shapes by event family.
  // Normalize to one subscription identifier for downstream processing.
  if (resource.billing_agreement_id) {
    return resource.billing_agreement_id;
  }

  return resource.id ?? null;
}

function isProcessed(eventId: string, billing: GarageBillingDocument): boolean {
  // Protect against duplicate delivery/retries from provider.
  return (
    billing.lastWebhookEventId === eventId ||
    billing.webhookEventIdsRecent.includes(eventId)
  );
}

function dedupeEventIds(ids: string[]): string[] {
  return Array.from(new Set(ids)).slice(-MAX_RECENT_WEBHOOK_IDS);
}

function addMonths(date: Date, months: number): Date {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
}

function addYears(date: Date, years: number): Date {
  const next = new Date(date);
  next.setFullYear(next.getFullYear() + years);
  return next;
}

function fallbackPeriodEnd(billing: GarageBillingDocument, now: Date): string {
  const baseDate = billing.currentPeriodEnd
    ? new Date(billing.currentPeriodEnd)
    : now;

  if (Number.isNaN(baseDate.getTime())) {
    return now.toISOString();
  }

  const next =
    billing.billingCycle === 'annual'
      ? addYears(baseDate, 1)
      : addMonths(baseDate, 1);

  return next.toISOString();
}

function isTrialingSubscription(subscription: PayPalSubscription): boolean {
  const cycles = subscription.billing_info?.cycle_executions ?? [];
  const trialCycle = cycles.find((cycle) => cycle.tenure_type === 'TRIAL');
  if (!trialCycle) {
    return false;
  }

  const completed = trialCycle.cycles_completed ?? 0;
  const remaining = trialCycle.cycles_remaining;
  const total = trialCycle.total_cycles;

  if (typeof remaining === 'number') {
    return remaining > 0;
  }

  if (typeof total === 'number') {
    return total > completed;
  }

  return false;
}

async function resolveBillingRef(
  event: PayPalWebhookEvent,
  subscriptionId: string
) {
  let garageId = event.resource?.custom_id?.trim();
  if (!garageId) {
    try {
      const subscription = await getPayPalSubscription(subscriptionId);
      garageId = subscription.custom_id?.trim();
    } catch {
      garageId = undefined;
    }
  }

  if (garageId) {
    // `custom_id` is written at checkout creation and binds event -> garage scope.
    return firebaseAdmin.db
      .collection('garages')
      .doc(garageId)
      .collection('billing')
      .doc(BILLING_DOC_ID);
  }

  return null;
}

async function fetchSubscriptionSnapshot(
  subscriptionId: string,
  billing: GarageBillingDocument
): Promise<PayPalSubscriptionSnapshot | null> {
  try {
    // Enrich local state from provider-authoritative subscription payload.
    const subscription = await getPayPalSubscription(subscriptionId);
    return {
      customId: subscription.custom_id?.trim() ?? null,
      planId: subscription.plan_id ?? null,
      nextBillingTime:
        subscription.billing_info?.next_billing_time ??
        fallbackPeriodEnd(billing, new Date()),
      payerId: subscription.subscriber?.payer_id ?? null,
      paypalCustomerId:
        subscription.subscriber?.payer_id ??
        subscription.subscriber?.email_address ??
        null,
      lastPaymentTime: subscription.billing_info?.last_payment?.time ?? null,
      isTrialing: isTrialingSubscription(subscription),
      updatedAt:
        subscription.status_update_time ?? subscription.update_time ?? null
    };
  } catch {
    // Webhook flow should continue even if enrichment fails transiently.
    return null;
  }
}

function eventStatus(eventType: string): BillingStatus | null {
  if (
    eventType === 'BILLING.SUBSCRIPTION.ACTIVATED' ||
    eventType === 'BILLING.SUBSCRIPTION.RE-ACTIVATED'
  ) {
    return 'active';
  }

  if (eventType === 'BILLING.SUBSCRIPTION.CANCELLED') {
    return 'cancelled';
  }

  if (eventType === 'BILLING.SUBSCRIPTION.PAYMENT.FAILED') {
    return 'past_due';
  }

  if (eventType === 'BILLING.SUBSCRIPTION.SUSPENDED') {
    return 'suspended';
  }

  if (eventType === 'PAYMENT.SALE.COMPLETED') {
    return 'active';
  }

  return null;
}

export async function POST(request: Request): Promise<NextResponse> {
  let event: PayPalWebhookEvent;

  try {
    event = (await request.json()) as PayPalWebhookEvent;
  } catch {
    return NextResponse.json({ success: true });
  }

  const transmissionId = parseHeader(request, 'paypal-transmission-id');
  const transmissionTime = parseHeader(request, 'paypal-transmission-time');
  const transmissionSig = parseHeader(request, 'paypal-transmission-sig');
  const certUrl = parseHeader(request, 'paypal-cert-url');
  const authAlgo = parseHeader(request, 'paypal-auth-algo');

  if (
    !transmissionId ||
    !transmissionTime ||
    !transmissionSig ||
    !certUrl ||
    !authAlgo
  ) {
    return NextResponse.json(
      { success: false, error: 'Invalid webhook.' },
      { status: 400 }
    );
  }

  const signatureValid = await verifyPayPalWebhookSignature({
    webhookEvent: event,
    transmissionId,
    transmissionTime,
    transmissionSig,
    certUrl,
    authAlgo
  });

  if (!signatureValid) {
    // Reject unsigned/untrusted events before touching persistence.
    return NextResponse.json(
      { success: false, error: 'Invalid webhook.' },
      { status: 400 }
    );
  }

  const eventId = event.id?.trim();
  const eventType = event.event_type?.trim();
  const subscriptionId = resolveSubscriptionId(event);
  if (!eventId || !eventType || !subscriptionId) {
    return NextResponse.json({ success: true });
  }

  const status = eventStatus(eventType);
  if (!status) {
    // Acknowledge unknown/non-target events to avoid unnecessary retries.
    return NextResponse.json({ success: true });
  }

  const billingRef = await resolveBillingRef(event, subscriptionId);
  if (!billingRef) {
    return NextResponse.json({ success: true });
  }

  await firebaseAdmin.db.runTransaction(async (transaction: any) => {
    const snap = await transaction.get(billingRef);
    if (!snap.exists) {
      return;
    }

    const billing = snap.data() as GarageBillingDocument;
    if (isProcessed(eventId, billing)) {
      // Safe no-op on duplicate event.
      return;
    }

    const subscriptionSnapshot = await fetchSubscriptionSnapshot(
      subscriptionId,
      billing
    );
    const fallbackNow = new Date().toISOString();
    const now = subscriptionSnapshot?.updatedAt ?? fallbackNow;
    const nextStatus: BillingStatus =
      status === 'active' && subscriptionSnapshot?.isTrialing
        ? 'trialing'
        : status;

    const updates: Partial<GarageBillingDocument> = {
      status: nextStatus,
      paypalSubscriptionId: subscriptionId,
      paypalPlanId:
        subscriptionSnapshot?.planId ?? billing.paypalPlanId ?? null,
      payerId: subscriptionSnapshot?.payerId ?? billing.payerId ?? null,
      paypalCustomerId:
        subscriptionSnapshot?.paypalCustomerId ??
        billing.paypalCustomerId ??
        null,
      lastWebhookEventId: eventId,
      webhookEventIdsRecent: dedupeEventIds([
        ...(billing.webhookEventIdsRecent ?? []),
        eventId
      ]),
      updatedAt: now
    };

    if (nextStatus === 'trialing') {
      updates.trialEndsAt =
        subscriptionSnapshot?.nextBillingTime ?? billing.trialEndsAt ?? null;
      updates.currentPeriodEnd =
        subscriptionSnapshot?.nextBillingTime ??
        fallbackPeriodEnd(billing, new Date());
    } else if (billing.status === 'trialing') {
      updates.trialEndsAt = null;
    }

    if (nextStatus === 'cancelled') {
      updates.cancelAtPeriodEnd = false;
    }

    if (eventType === 'PAYMENT.SALE.COMPLETED') {
      // Payment success advances cycle boundary and stamps latest paid time.
      updates.currentPeriodEnd =
        subscriptionSnapshot?.nextBillingTime ??
        fallbackPeriodEnd(billing, new Date());
      updates.lastPaidAt = subscriptionSnapshot?.lastPaymentTime ?? now;
      updates.cancelAtPeriodEnd = false;
    }

    if (
      eventType === 'BILLING.SUBSCRIPTION.ACTIVATED' ||
      eventType === 'BILLING.SUBSCRIPTION.RE-ACTIVATED'
    ) {
      updates.currentPeriodEnd =
        subscriptionSnapshot?.nextBillingTime ??
        fallbackPeriodEnd(billing, new Date());
    }

    transaction.set(billingRef, updates, { merge: true });
  });

  return NextResponse.json({ success: true });
}
