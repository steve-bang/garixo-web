'use client';

import { Check } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils/cn';

type Plan = {
  id: 'starter' | 'growth';
  name: string;
  priceMonthly: number;
  priceAnnual: number;
  annualDiscountPercent: number;
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
    subtitle: 'Best for owner-operated shops with 1-5 mechanics.',
    ctaLabel: 'Start 30-Day Free Trial',
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
    subtitle: 'For growing independent shops with 6-12 mechanics.',
    ctaLabel: 'Start 30-Day Free Trial',
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
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');

  return (
    <div className="mx-auto max-w-[920px] space-y-s4">
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
                <Button
                  type="button"
                  className="w-full"
                  variant={plan.isRecommended ? 'default' : 'secondary'}
                >
                  {plan.ctaLabel}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
