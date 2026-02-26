import { NextResponse } from 'next/server';

import type { BillingStatus } from '@/features/billing/types';
import { firebaseAdmin } from '@/lib/firebase-admin';
import {
  getPayPalSubscription,
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

function parseHeader(request: Request, name: string): string {
  return request.headers.get(name) ?? '';
}

function resolveSubscriptionId(event: PayPalWebhookEvent): string | null {
  const resource = event.resource;
  if (!resource) return null;

  // PayPal may use different resource shapes depending on event type.
  // We normalize both known fields to the canonical subscription ID.
  if (resource.billing_agreement_id) {
    return resource.billing_agreement_id;
  }

  return resource.id ?? null;
}

function isProcessed(eventId: string, billing: GarageBillingDocument): boolean {
  // Fast idempotency check to avoid double-applying webhook retries.
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

async function resolveBillingRef(event: PayPalWebhookEvent) {
  const garageId = event.resource?.custom_id?.trim();
  if (garageId) {
    // `custom_id` is set at subscription creation and points to garage scope.
    return firebaseAdmin.db
      .collection('garages')
      .doc(garageId)
      .collection('billing')
      .doc(BILLING_DOC_ID);
  }

  return null;
}

async function resolvePeriodEnd(
  subscriptionId: string,
  billing: GarageBillingDocument
): Promise<string> {
  try {
    // Prefer PayPal authoritative next billing date for period boundaries.
    const subscription = await getPayPalSubscription(subscriptionId);
    if (subscription.billing_info?.next_billing_time) {
      return subscription.billing_info.next_billing_time;
    }
  } catch {
    // Fall back to deterministic local period calculation when PayPal lookup fails.
  }

  return fallbackPeriodEnd(billing, new Date());
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
    // Unknown/non-billing events are acknowledged to avoid infinite retries.
    return NextResponse.json({ success: true });
  }

  const billingRef = await resolveBillingRef(event);
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
      // Idempotent return for duplicate webhook deliveries.
      return;
    }

    const now = new Date().toISOString();
    const updates: Partial<GarageBillingDocument> = {
      status,
      paypalSubscriptionId: subscriptionId,
      lastWebhookEventId: eventId,
      webhookEventIdsRecent: dedupeEventIds([
        ...(billing.webhookEventIdsRecent ?? []),
        eventId
      ]),
      updatedAt: now
    };

    if (status === 'cancelled') {
      updates.cancelAtPeriodEnd = false;
    }

    if (eventType === 'PAYMENT.SALE.COMPLETED') {
      // Renewal success advances subscription window.
      updates.currentPeriodEnd = await resolvePeriodEnd(
        subscriptionId,
        billing
      );
      updates.cancelAtPeriodEnd = false;
    }

    if (
      eventType === 'BILLING.SUBSCRIPTION.ACTIVATED' ||
      eventType === 'BILLING.SUBSCRIPTION.RE-ACTIVATED'
    ) {
      updates.currentPeriodEnd = await resolvePeriodEnd(
        subscriptionId,
        billing
      );
    }

    transaction.set(billingRef, updates, { merge: true });
  });

  return NextResponse.json({ success: true });
}
