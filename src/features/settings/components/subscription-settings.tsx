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
  createSubscription
} from '@/features/settings/subscription.service';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils/cn';

type Plan = {
  id: 'starter' | 'growth';
  name: string;
  priceMonthly: number;
  priceAnnual: number;
  annualDiscountPercent: number;
  trialDays: number;
  subtitle: string;
  ctaLabel: string;
  isRecommended?: boolean;
  features: string[];
};
type BillingCycle = 'monthly' | 'annual';

const plans: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
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
    ]
  },
  {
    id: 'growth',
    name: 'Growth',
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
    ]
  }
];

function formatUsd(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value);
}

export function SubscriptionSettings(): JSX.Element {
  const toast = useToast();
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [pendingPlan, setPendingPlan] = useState<string | null>(null);
  const [isHandlingCallback, setIsHandlingCallback] = useState(false);
  const callbackHandledRef = useRef(false);

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

    void captureSubscriptionApproval({
      subscriptionId: callbackSubscriptionId
    })
      .then(() => {
        toast.success('Your subscription has been confirmed.');
      })
      .catch((error) => {
        toast.error(
          error instanceof Error
            ? error.message
            : 'Could not confirm payment. Please try again.'
        );
      })
      .finally(() => {
        setIsHandlingCallback(false);
        finishCallback();
      });
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
        {plans.map((plan) => {
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
                  {formatUsd(currentPrice)}
                  <span className="ml-1 text-small font-medium text-text-muted">
                    /{billingCycle === 'monthly' ? 'month' : 'year'}
                  </span>
                </p>
                <p className="text-caption text-text-muted">
                  {billingCycle === 'monthly'
                    ? `${formatUsd(plan.priceAnnual)}/year • save ${plan.annualDiscountPercent}%`
                    : `${formatUsd(plan.priceMonthly)}/month equivalent`}
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
