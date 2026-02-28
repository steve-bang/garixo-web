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
import { getPayPalPlanMap } from '@/config/billing';
import { env } from '@/config/env';
import {
  getPriceByCycle,
  subscriptionPlanConfig
} from '@/features/billing/plan-feature-config';
import { firebaseAdmin } from '@/lib/firebase-admin';
import {
  getPayPalSubscription,
  type PayPalSubscription,
  verifyPayPalWebhookSignature
} from '@/services/paypal/paypal-client';
import {
  sendSubscriptionActivatedEmail,
  sendSubscriptionCancelledEmail,
  sendSubscriptionPaymentFailedEmail,
  sendSubscriptionPaymentSucceededEmail,
  sendSubscriptionSuspendedEmail
} from '@/services/email.service';
import { getGarageById } from '@/services/firebase/garage-service';
import { getUserDocument } from '@/services/firebase/user-sync-service';
import { syncUsageCurrentByPlan } from '@/services/firebase/usage-plan-sync-service';
import type { GarageBillingDocument } from '@/types/firebase-models';
import type { BillingCycle, PlanCode } from '@/features/billing/types';

const BILLING_DOC_ID = 'current';
const MAX_RECENT_WEBHOOK_IDS = 50;
const WEBHOOK_DEBUG_ENABLED = env.DEBUG_PAYPAL_WEBHOOK === 'true';

type PayPalWebhookEvent = {
  id?: string;
  event_type?: string;
  resource?: {
    id?: string;
    custom_id?: string;
    billing_agreement_id?: string;
    status?: string;
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

function redactHeaders(headers: Headers): Record<string, string> {
  const output: Record<string, string> = {};
  for (const [key, value] of headers.entries()) {
    const lower = key.toLowerCase();
    const isSensitive =
      lower === 'authorization' ||
      lower === 'paypal-transmission-sig' ||
      lower === 'cookie' ||
      lower === 'set-cookie' ||
      lower.includes('token') ||
      lower.includes('secret') ||
      lower.includes('signature');
    output[key] = isSensitive ? '[REDACTED]' : value;
  }

  return output;
}

function toWebhookLogPayload(event: PayPalWebhookEvent): {
  id: string | null;
  eventType: string | null;
  subscriptionId: string | null;
  status: string | null;
} {
  return {
    id: event.id ?? null,
    eventType: event.event_type ?? null,
    subscriptionId:
      event.resource?.billing_agreement_id ?? event.resource?.id ?? null,
    status: event.resource?.status ?? null
  };
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

async function resolveBillingRef(
  event: PayPalWebhookEvent,
  subscriptionId: string
): Promise<{
  garageId: string;
  billingRef: any;
} | null> {
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
    const billingRef = firebaseAdmin.db
      .collection('garages')
      .doc(garageId)
      .collection('billing')
      .doc(BILLING_DOC_ID);
    return { garageId, billingRef };
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

function shouldSyncUsageForEvent(eventType: string): boolean {
  return (
    eventType === 'BILLING.SUBSCRIPTION.ACTIVATED' ||
    eventType === 'BILLING.SUBSCRIPTION.RE-ACTIVATED' ||
    eventType === 'BILLING.SUBSCRIPTION.CANCELLED' ||
    eventType === 'BILLING.SUBSCRIPTION.SUSPENDED'
  );
}

function shouldSendActivatedEmail(eventType: string): boolean {
  return (
    eventType === 'BILLING.SUBSCRIPTION.ACTIVATED' ||
    eventType === 'BILLING.SUBSCRIPTION.RE-ACTIVATED'
  );
}

function shouldSendPaymentFailedEmail(eventType: string): boolean {
  return eventType === 'BILLING.SUBSCRIPTION.PAYMENT.FAILED';
}

function shouldSendPaymentSucceededEmail(eventType: string): boolean {
  return eventType === 'PAYMENT.SALE.COMPLETED';
}

function shouldSendCancelledEmail(eventType: string): boolean {
  return eventType === 'BILLING.SUBSCRIPTION.CANCELLED';
}

function shouldSendSuspendedEmail(eventType: string): boolean {
  return eventType === 'BILLING.SUBSCRIPTION.SUSPENDED';
}

function toFirstName(fullName?: string): string | undefined {
  if (!fullName) return undefined;
  const first = fullName.trim().split(/\s+/)[0];
  return first || undefined;
}

function hasLocalTrialSignal(billing: GarageBillingDocument): boolean {
  if (billing.status === 'trialing') {
    return true;
  }

  if (billing.lastPaidAt == null) {
    return true;
  }

  if (!billing.trialEndsAt) {
    return false;
  }

  const trialEndTime = new Date(billing.trialEndsAt).getTime();
  return !Number.isNaN(trialEndTime) && trialEndTime > Date.now();
}

export async function POST(request: Request): Promise<NextResponse> {
  if (WEBHOOK_DEBUG_ENABLED) {
    console.info('[billing][webhook] incoming request', {
      method: request.method,
      url: request.url,
      headers: redactHeaders(request.headers)
    });
  }

  let event: PayPalWebhookEvent;

  try {
    event = (await request.json()) as PayPalWebhookEvent;
    if (WEBHOOK_DEBUG_ENABLED) {
      console.info(
        '[billing][webhook] parsed payload',
        toWebhookLogPayload(event)
      );
    }
  } catch {
    if (WEBHOOK_DEBUG_ENABLED) {
      console.error('[billing][webhook] failed to parse JSON payload');
    }
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
    if (WEBHOOK_DEBUG_ENABLED) {
      console.warn(
        '[billing][webhook] missing required PayPal signature headers',
        {
          transmissionId,
          transmissionTime,
          transmissionSigPresent: Boolean(transmissionSig),
          certUrl,
          authAlgo
        }
      );
    }
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
    if (WEBHOOK_DEBUG_ENABLED) {
      console.warn('[billing][webhook] signature verification failed', {
        transmissionId,
        eventId: event.id ?? null,
        eventType: event.event_type ?? null
      });
    }
    return NextResponse.json(
      { success: false, error: 'Invalid webhook.' },
      { status: 400 }
    );
  }

  const eventId = event.id?.trim();
  const eventType = event.event_type?.trim();
  const subscriptionId = resolveSubscriptionId(event);
  if (!eventId || !eventType || !subscriptionId) {
    if (WEBHOOK_DEBUG_ENABLED) {
      console.warn('[billing][webhook] missing required event fields', {
        eventId,
        eventType,
        subscriptionId
      });
    }
    return NextResponse.json({ success: true });
  }

  const status = eventStatus(eventType);
  if (!status) {
    // Acknowledge unknown/non-target events to avoid unnecessary retries.
    console.info('[billing][webhook] ignored unsupported event type', {
      eventId,
      eventType,
      subscriptionId
    });
    return NextResponse.json({ success: true });
  }

  const billingScope = await resolveBillingRef(event, subscriptionId);
  if (!billingScope) {
    console.warn('[billing][webhook] billing document not resolved', {
      eventId,
      eventType,
      subscriptionId,
      customId: event.resource?.custom_id ?? null
    });
    return NextResponse.json({ success: true });
  }
  const { garageId, billingRef } = billingScope;

  let syncedPlanCode: PlanCode | null = null;
  let previousBillingStatus: BillingStatus | null = null;
  let skipPostProcessing = false;

  await firebaseAdmin.db.runTransaction(async (transaction: any) => {
    const snap = await transaction.get(billingRef);
    if (!snap.exists) {
      skipPostProcessing = true;
      return;
    }

    const billing = snap.data() as GarageBillingDocument;
    if (isProcessed(eventId, billing)) {
      // Safe no-op on duplicate event.
      console.info('[billing][webhook] duplicate event skipped', {
        eventId,
        eventType,
        subscriptionId
      });
      skipPostProcessing = true;
      return;
    }
    previousBillingStatus = billing.status;

    const subscriptionSnapshot = await fetchSubscriptionSnapshot(
      subscriptionId,
      billing
    );
    const fallbackNow = new Date().toISOString();
    const now = subscriptionSnapshot?.updatedAt ?? fallbackNow;
    const resolvedPlan = resolvePlan(subscriptionSnapshot?.planId ?? null);
    const shouldKeepTrialing =
      status === 'active' &&
      (subscriptionSnapshot?.isTrialing === true ||
        hasLocalTrialSignal(billing));

    const nextStatus: BillingStatus = shouldKeepTrialing ? 'trialing' : status;

    const updates: Partial<GarageBillingDocument> = {
      status: nextStatus,
      paypalSubscriptionId: subscriptionId,
      paypalPlanId:
        subscriptionSnapshot?.planId ?? billing.paypalPlanId ?? null,
      planCode: resolvedPlan?.planCode ?? billing.planCode,
      billingCycle: resolvedPlan?.billingCycle ?? billing.billingCycle,
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

    if (WEBHOOK_DEBUG_ENABLED) {
      console.info('[billing][webhook] billing updated', {
        eventId,
        eventType,
        subscriptionId,
        nextStatus,
        nextPeriodEnd: updates.currentPeriodEnd ?? null,
        lastPaidAt: updates.lastPaidAt ?? null
      });
    }

    syncedPlanCode = updates.planCode ?? billing.planCode;
  });

  if (skipPostProcessing) {
    return NextResponse.json({ success: true });
  }

  // Keep usage feature gates and limits aligned with the current effective plan
  // for key subscription lifecycle transitions.
  if (shouldSyncUsageForEvent(eventType) && syncedPlanCode) {
    await syncUsageCurrentByPlan(garageId, syncedPlanCode);
  }

  if (shouldSendActivatedEmail(eventType)) {
    try {
      const [garage, billingSnap] = await Promise.all([
        getGarageById(garageId),
        billingRef.get()
      ]);

      const billing = billingSnap.exists
        ? (billingSnap.data() as GarageBillingDocument)
        : null;

      if (garage?.ownerUserId && billing) {
        const owner = await getUserDocument(garage.ownerUserId);
        if (owner?.email) {
          const plan =
            subscriptionPlanConfig.find(
              (item) => item.id === billing.planCode
            ) ?? null;
          const dashboardUrl = new URL(
            '/dashboard',
            env.NEXTAUTH_URL
          ).toString();
          const websiteUrl = new URL('/', env.NEXTAUTH_URL).toString();
          const nextBillingDate = billing.currentPeriodEnd
            ? new Date(billing.currentPeriodEnd)
            : new Date();

          await sendSubscriptionActivatedEmail({
            recipientEmail: owner.email,
            firstName: toFirstName(owner.name),
            planName: plan?.name ?? billing.planCode,
            billingCycle: billing.billingCycle,
            price: plan ? getPriceByCycle(plan, billing.billingCycle) : 0,
            nextBillingDate: Number.isNaN(nextBillingDate.getTime())
              ? new Date()
              : nextBillingDate,
            dashboardLink: dashboardUrl,
            supportEmail:
              env.NEXT_PUBLIC_APP_SUPPORT_EMAIL ?? 'support@garixo.com',
            websiteUrl
          });
        }
      }
    } catch (error) {
      console.error('[billing][webhook] activation email send failed', {
        eventId,
        eventType,
        subscriptionId,
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  if (shouldSendPaymentFailedEmail(eventType)) {
    try {
      const [garage, billingSnap] = await Promise.all([
        getGarageById(garageId),
        billingRef.get()
      ]);

      const billing = billingSnap.exists
        ? (billingSnap.data() as GarageBillingDocument)
        : null;

      if (garage?.ownerUserId && billing) {
        const owner = await getUserDocument(garage.ownerUserId);
        if (owner?.email) {
          const plan =
            subscriptionPlanConfig.find(
              (item) => item.id === billing.planCode
            ) ?? null;
          const updateBillingLink = new URL(
            '/dashboard/settings/subscription',
            env.NEXTAUTH_URL
          ).toString();
          const websiteUrl = new URL('/', env.NEXTAUTH_URL).toString();
          const billingDate = billing.updatedAt
            ? new Date(billing.updatedAt)
            : new Date();
          const gracePeriodDate = new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
          );

          await sendSubscriptionPaymentFailedEmail({
            recipientEmail: owner.email,
            firstName: toFirstName(owner.name),
            planName: plan?.name ?? billing.planCode,
            amount: plan ? getPriceByCycle(plan, billing.billingCycle) : 0,
            billingDate: Number.isNaN(billingDate.getTime())
              ? new Date()
              : billingDate,
            gracePeriodDate,
            updateBillingLink,
            supportEmail:
              env.NEXT_PUBLIC_APP_SUPPORT_EMAIL ?? 'support@garixo.com',
            websiteUrl
          });
        }
      }
    } catch (error) {
      console.error('[billing][webhook] payment failed email send failed', {
        eventId,
        eventType,
        subscriptionId,
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  if (shouldSendPaymentSucceededEmail(eventType)) {
    try {
      const [garage, billingSnap] = await Promise.all([
        getGarageById(garageId),
        billingRef.get()
      ]);

      const billing = billingSnap.exists
        ? (billingSnap.data() as GarageBillingDocument)
        : null;

      if (garage?.ownerUserId && billing) {
        const owner = await getUserDocument(garage.ownerUserId);
        if (owner?.email) {
          const plan =
            subscriptionPlanConfig.find(
              (item) => item.id === billing.planCode
            ) ?? null;
          const dashboardUrl = new URL(
            '/dashboard',
            env.NEXTAUTH_URL
          ).toString();
          const websiteUrl = new URL('/', env.NEXTAUTH_URL).toString();
          const billedAt = billing.lastPaidAt
            ? new Date(billing.lastPaidAt)
            : new Date();
          const nextBillingDate = billing.currentPeriodEnd
            ? new Date(billing.currentPeriodEnd)
            : new Date();

          const emailInput = {
            recipientEmail: owner.email,
            firstName: toFirstName(owner.name),
            planName: plan?.name ?? billing.planCode,
            billingCycle: billing.billingCycle,
            amount: plan ? getPriceByCycle(plan, billing.billingCycle) : 0,
            billedAt: Number.isNaN(billedAt.getTime()) ? new Date() : billedAt,
            nextBillingDate: Number.isNaN(nextBillingDate.getTime())
              ? new Date()
              : nextBillingDate,
            dashboardLink: dashboardUrl,
            supportEmail:
              env.NEXT_PUBLIC_APP_SUPPORT_EMAIL ?? 'support@garixo.com',
            websiteUrl
          } as const;

          await sendSubscriptionPaymentSucceededEmail(emailInput);
        }
      }
    } catch (error) {
      console.error('[billing][webhook] payment succeeded email send failed', {
        eventId,
        eventType,
        subscriptionId,
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  if (shouldSendCancelledEmail(eventType)) {
    try {
      const [garage, billingSnap] = await Promise.all([
        getGarageById(garageId),
        billingRef.get()
      ]);

      const billing = billingSnap.exists
        ? (billingSnap.data() as GarageBillingDocument)
        : null;

      if (garage?.ownerUserId && billing) {
        const owner = await getUserDocument(garage.ownerUserId);
        if (owner?.email) {
          const plan =
            subscriptionPlanConfig.find(
              (item) => item.id === billing.planCode
            ) ?? null;
          const dashboardUrl = new URL(
            '/dashboard',
            env.NEXTAUTH_URL
          ).toString();
          const resubscribeLink = new URL(
            '/dashboard/settings/subscription',
            env.NEXTAUTH_URL
          ).toString();
          const websiteUrl = new URL('/', env.NEXTAUTH_URL).toString();
          const accessEndsAt = billing.currentPeriodEnd
            ? new Date(billing.currentPeriodEnd)
            : new Date();

          await sendSubscriptionCancelledEmail({
            recipientEmail: owner.email,
            firstName: toFirstName(owner.name),
            planName: plan?.name ?? billing.planCode,
            billingCycle: billing.billingCycle,
            accessEndsAt: Number.isNaN(accessEndsAt.getTime())
              ? new Date()
              : accessEndsAt,
            dashboardLink: dashboardUrl,
            resubscribeLink,
            supportEmail:
              env.NEXT_PUBLIC_APP_SUPPORT_EMAIL ?? 'support@garixo.com',
            websiteUrl
          });
        }
      }
    } catch (error) {
      console.error('[billing][webhook] cancelled email send failed', {
        eventId,
        eventType,
        subscriptionId,
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  if (shouldSendSuspendedEmail(eventType)) {
    try {
      const [garage, billingSnap] = await Promise.all([
        getGarageById(garageId),
        billingRef.get()
      ]);

      const billing = billingSnap.exists
        ? (billingSnap.data() as GarageBillingDocument)
        : null;

      if (garage?.ownerUserId && billing) {
        const owner = await getUserDocument(garage.ownerUserId);
        if (owner?.email) {
          const plan =
            subscriptionPlanConfig.find(
              (item) => item.id === billing.planCode
            ) ?? null;
          const dashboardUrl = new URL(
            '/dashboard',
            env.NEXTAUTH_URL
          ).toString();
          const restoreAccessLink = new URL(
            '/dashboard/settings/subscription',
            env.NEXTAUTH_URL
          ).toString();
          const websiteUrl = new URL('/', env.NEXTAUTH_URL).toString();

          await sendSubscriptionSuspendedEmail({
            recipientEmail: owner.email,
            firstName: toFirstName(owner.name),
            planName: plan?.name ?? billing.planCode,
            billingCycle: billing.billingCycle,
            restoreAccessLink,
            dashboardLink: dashboardUrl,
            supportEmail:
              env.NEXT_PUBLIC_APP_SUPPORT_EMAIL ?? 'support@garixo.com',
            websiteUrl
          });
        }
      }
    } catch (error) {
      console.error('[billing][webhook] suspended email send failed', {
        eventId,
        eventType,
        subscriptionId,
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  if (WEBHOOK_DEBUG_ENABLED) {
    console.info('[billing][webhook] processed successfully', {
      eventId,
      eventType,
      subscriptionId
    });
  }
  return NextResponse.json({ success: true });
}
