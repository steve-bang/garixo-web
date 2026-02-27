'use client';

import { Check } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { PlanCode } from '@/features/billing/types';
import {
  captureSubscriptionApproval,
  createSubscription,
  getBillingSnapshot,
  type BillingSnapshotResult
} from '@/features/settings/subscription.service';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils/cn';
import { formatCurrencyUsd, formatDate } from '@/lib/utils/format';

type Plan = {
  id: 'free' | 'starter' | 'growth';
  name: string;
  priceMonthly: number;
  priceAnnual: number;
  annualDiscountPercent: number;
  trialDays: number;
  subtitle: string;
  ctaLabel: string;
  isRecommended?: boolean;
  features: string[];
  featureConfig: Record<string, FeatureRule>;
  tier: number;
};

type FeatureResetPolicy = 'monthly' | 'yearly' | 'forever';

type FeatureRule = {
  enabled: boolean;
  limit: number;
  resetPolicy: FeatureResetPolicy;
};
type BillingCycle = 'monthly' | 'annual';

const plans: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    tier: 1,
    priceMonthly: 0,
    priceAnnual: 0,
    annualDiscountPercent: 0,
    trialDays: 0,
    subtitle: 'Perfect for small shops getting organized',
    ctaLabel: 'Start Free',
    isRecommended: false,
    features: [
      '1 user',
      '1 location',
      'Up to 25 work orders per month',
      'Customer & vehicle history',
      'Service management',
      'Basic invoices',
      'Community/email support'
    ],
    featureConfig: {
      users: { enabled: true, limit: 1, resetPolicy: 'forever' },
      locations: { enabled: true, limit: 1, resetPolicy: 'forever' },
      workOrders: { enabled: true, limit: 25, resetPolicy: 'monthly' },
      customerVehicleHistory: {
        enabled: true,
        limit: -1,
        resetPolicy: 'forever'
      },
      serviceManagement: { enabled: true, limit: -1, resetPolicy: 'forever' },
      basicInvoices: { enabled: true, limit: -1, resetPolicy: 'forever' },
      communityEmailSupport: {
        enabled: true,
        limit: -1,
        resetPolicy: 'forever'
      }
    }
  },
  {
    id: 'starter',
    name: 'Starter',
    tier: 2,
    priceMonthly: 79,
    priceAnnual: 790,
    annualDiscountPercent: 17,
    trialDays: 14,
    subtitle: 'For shop owners who want better control and fewer mistakes.',
    ctaLabel: 'Start Free for 14 Days',
    isRecommended: true,
    features: [
      'Up to 5 users',
      '1 location',
      'Work order management and status tracking',
      'Customer and vehicle history',
      'Services and parts listing',
      'Basic invoice generation',
      'Email support'
    ],
    featureConfig: {
      users: { enabled: true, limit: 5, resetPolicy: 'forever' },
      locations: { enabled: true, limit: 1, resetPolicy: 'forever' },
      workOrderManagement: { enabled: true, limit: -1, resetPolicy: 'forever' },
      customerVehicleHistory: {
        enabled: true,
        limit: -1,
        resetPolicy: 'forever'
      },
      servicesPartsListing: {
        enabled: true,
        limit: -1,
        resetPolicy: 'forever'
      },
      basicInvoiceGeneration: {
        enabled: true,
        limit: -1,
        resetPolicy: 'forever'
      },
      emailSupport: { enabled: true, limit: -1, resetPolicy: 'forever' }
    }
  },
  {
    id: 'growth',
    name: 'Growth',
    tier: 3,
    priceMonthly: 129,
    priceAnnual: 1290,
    annualDiscountPercent: 17,
    trialDays: 14,
    subtitle: 'For busy garages that need structure and team accountability.',
    ctaLabel: 'Scale My Shop',
    features: [
      'Up to 12 users',
      '1 location',
      'Everything in Starter',
      'Staff workflow management',
      'Deeper reports',
      'Priority email support'
    ],
    featureConfig: {
      users: { enabled: true, limit: 12, resetPolicy: 'forever' },
      locations: { enabled: true, limit: 1, resetPolicy: 'forever' },
      everythingInStarter: { enabled: true, limit: -1, resetPolicy: 'forever' },
      staffWorkflowManagement: {
        enabled: true,
        limit: -1,
        resetPolicy: 'forever'
      },
      deeperReports: { enabled: true, limit: -1, resetPolicy: 'forever' },
      priorityEmailSupport: { enabled: true, limit: -1, resetPolicy: 'forever' }
    }
  }
];

function isNoSubscriptionYet(snapshot: BillingSnapshotResult): boolean {
  return (
    snapshot.paypalSubscriptionId == null &&
    snapshot.trialEndsAt == null &&
    snapshot.currentPeriodEnd == null &&
    snapshot.lastPaidAt == null &&
    snapshot.planCode == null
  );
}

function getStatusMessage(snapshot: BillingSnapshotResult): string {
  if (isNoSubscriptionYet(snapshot)) {
    return 'You are almost ready. Pick a plan to start running your shop with Garixo.';
  }

  if (snapshot.planCode === 'free') {
    return 'You are on the Free plan. Upgrade anytime when your shop is ready for more users and advanced workflows.';
  }

  if (snapshot.status === 'trialing') {
    const trialEnd = formatDate(snapshot.trialEndsAt, {
      fallback: '',
      options: {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }
    });
    return trialEnd
      ? `Your free trial is active through ${trialEnd}. Explore everything before you decide.`
      : 'Your free trial is active. You can explore all features now.';
  }

  if (snapshot.status === 'active') {
    const nextBilling = formatDate(snapshot.currentPeriodEnd, {
      fallback: '',
      options: {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }
    });
    return nextBilling
      ? `Your plan is active. Next billing date: ${nextBilling}.`
      : 'Your plan is active and your shop is fully set.';
  }

  if (snapshot.status === 'past_due') {
    return 'We could not process your latest payment. Update billing to keep your shop running smoothly.';
  }

  if (snapshot.status === 'cancelled') {
    return 'Your subscription is canceled. Restart anytime when you are ready.';
  }

  return 'Your subscription is temporarily paused. Review billing to restore full access.';
}

function getStatusBadgeVariant(
  status: BillingSnapshotResult['status']
): 'default' | 'success' | 'warning' | 'info' {
  if (status === 'trialing' || status === 'active') {
    return 'success';
  }
  if (status === 'past_due') {
    return 'warning';
  }
  if (status === 'suspended') {
    return 'info';
  }
  return 'default';
}

export function SubscriptionSettings(): JSX.Element {
  const toast = useToast();
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [pendingPlan, setPendingPlan] = useState<string | null>(null);
  const [isHandlingCallback, setIsHandlingCallback] = useState(false);
  const [billingSnapshot, setBillingSnapshot] =
    useState<BillingSnapshotResult | null>(null);
  const [isBillingLoading, setBillingLoading] = useState(true);
  const callbackHandledRef = useRef(false);

  const loadBillingSnapshot = async () => {
    setBillingLoading(true);
    try {
      const data = await getBillingSnapshot();
      setBillingSnapshot(data);
    } catch {
      setBillingSnapshot(null);
    } finally {
      setBillingLoading(false);
    }
  };

  useEffect(() => {
    void loadBillingSnapshot();
  }, []);

  useEffect(() => {
    if (callbackHandledRef.current) {
      return;
    }

    const search = new URLSearchParams(window.location.search);
    const paypalState = search.get('paypal');
    if (paypalState !== 'success' && paypalState !== 'cancelled') {
      return;
    }

    callbackHandledRef.current = true;
    const callbackSubscriptionId =
      search.get('subscription_id') ??
      search.get('ba_token') ??
      search.get('token');

    const finishCallback = () => {
      router.replace('/dashboard/settings/subscription');
    };

    if (paypalState === 'cancelled') {
      toast.info('Payment was cancelled. You can try again anytime.');
      finishCallback();
      return;
    }

    if (!callbackSubscriptionId) {
      toast.error('Could not confirm payment. Please try again.');
      finishCallback();
      return;
    }

    // Defer state update to avoid sync setState in effect body lint violation.
    queueMicrotask(() => setIsHandlingCallback(true));

    void (async () => {
      try {
        await captureSubscriptionApproval({
          subscriptionId: callbackSubscriptionId
        });
        await loadBillingSnapshot();
        toast.success('Your subscription has been confirmed.');
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : 'Could not confirm payment. Please try again.'
        );
      } finally {
        setIsHandlingCallback(false);
        finishCallback();
      }
    })();
  }, [router, toast]);

  const onUpgrade = async (planCode: PlanCode) => {
    const pendingKey = `${planCode}-${billingCycle}`;
    setPendingPlan(pendingKey);

    try {
      const result = await createSubscription({
        planCode,
        billingCycle
      });
      window.location.assign(result.approveUrl);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Unable to continue to payment. Please try again.'
      );
      setPendingPlan(null);
    }
  };

  const maxTrialDays = Math.max(...plans.map((plan) => plan.trialDays));

  return (
    <div className="mx-auto max-w-[920px] space-y-s4">
      {isBillingLoading ? (
        <Card className="p-s3">
          <div className="h-5 w-48 animate-pulse rounded-md bg-surface-hover" />
        </Card>
      ) : billingSnapshot ? (
        <Card className="flex items-center justify-between gap-s3 p-s3">
          <p className="text-small text-text-secondary">
            {getStatusMessage(billingSnapshot)}
          </p>
          {isNoSubscriptionYet(billingSnapshot) ? (
            <Badge variant="default">Not started</Badge>
          ) : (
            <Badge
              variant={getStatusBadgeVariant(billingSnapshot.status)}
              className="capitalize"
            >
              {billingSnapshot.status.replace('_', ' ')}
            </Badge>
          )}
        </Card>
      ) : null}

      {isHandlingCallback ? (
        <Card className="p-s3">
          <div className="flex items-center gap-s2">
            <span className="size-4 animate-spin rounded-full border-2 border-border-strong border-t-transparent" />
            <p className="text-small text-text-secondary">
              Confirming your PayPal payment...
            </p>
          </div>
        </Card>
      ) : null}

      <header className="space-y-s2 text-center">
        <h2 className="text-h2">Simple pricing. Built for garage owners.</h2>
        <p className="text-small text-text-muted">
          No contract. No setup fee. Start in minutes.
        </p>
      </header>

      <div className="flex justify-center">
        <div className="inline-flex rounded-md border border-border bg-surface-default p-1">
          <Button
            type="button"
            size="sm"
            variant={billingCycle === 'monthly' ? 'default' : 'ghost'}
            onClick={() => setBillingCycle('monthly')}
          >
            Monthly
          </Button>
          <Button
            type="button"
            size="sm"
            variant={billingCycle === 'annual' ? 'default' : 'ghost'}
            onClick={() => setBillingCycle('annual')}
          >
            Annual
          </Button>
        </div>
      </div>

      <div className="grid gap-s3 md:grid-cols-2">
        {plans
          .filter((plan) => plan.id !== 'free')
          .map((plan) => {
            const currentPrice =
              billingCycle === 'monthly' ? plan.priceMonthly : plan.priceAnnual;
            const pendingKey = `${plan.id}-${billingCycle}`;
            const isPending = pendingPlan === pendingKey;

            return (
              <Card
                key={plan.id}
                className={cn(
                  'relative flex h-full flex-col p-s4',
                  plan.isRecommended ? 'border-primary-300 shadow-sm' : ''
                )}
              >
                {plan.isRecommended ? (
                  <Badge
                    variant="success"
                    className="absolute right-s3 top-s3 px-s2 py-1"
                  >
                    Most popular
                  </Badge>
                ) : null}

                <div className="space-y-s1">
                  <h3 className="text-h3">{plan.name}</h3>
                  <p className="text-small text-text-muted">{plan.subtitle}</p>
                </div>

                <div className="mt-s3 rounded-md border border-border bg-surface-default p-s3">
                  <p className="text-h2 font-bold text-text-primary">
                    {formatCurrencyUsd(currentPrice)}
                    <span className="ml-1 text-small font-medium text-text-muted">
                      /{billingCycle === 'monthly' ? 'month' : 'year'}
                    </span>
                  </p>
                  <p className="text-caption text-text-muted">
                    {billingCycle === 'monthly'
                      ? `${formatCurrencyUsd(plan.priceAnnual)}/year • save ${plan.annualDiscountPercent}%`
                      : `${formatCurrencyUsd(plan.priceMonthly)}/month equivalent`}
                  </p>
                </div>

                <ul className="mt-s4 space-y-s2">
                  {plan.features.map((feature) => (
                    <li
                      key={`${plan.id}-${feature}`}
                      className="flex items-start gap-s2 text-small text-text-secondary"
                    >
                      <Check className="mt-[2px] size-4 text-success-700" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto space-y-s2 pt-s4">
                  <p className="text-caption text-text-muted">
                    {plan.trialDays}-day free trial included
                  </p>
                  <Button
                    type="button"
                    className="w-full"
                    variant={plan.isRecommended ? 'default' : 'secondary'}
                    disabled={pendingPlan !== null || isHandlingCallback}
                    onClick={() => void onUpgrade(plan.id)}
                  >
                    {isPending ? 'Opening secure checkout...' : plan.ctaLabel}
                  </Button>
                </div>
              </Card>
            );
          })}
      </div>
    </div>
  );
}
