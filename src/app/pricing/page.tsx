import type { Metadata } from 'next';
import { Check } from 'lucide-react';
import Link from 'next/link';

import { LandingFooter } from '@/components/sections/LandingFooter';
import { LandingHeader } from '@/components/sections/LandingHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatCurrencyUsd } from '@/lib/utils/format';

type PricingPlan = {
  id: 'free' | 'starter' | 'growth';
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  annualDiscountPercent: number;
  trialDays: number;
  users: string;
  subtitle: string;
  ctaLabel: string;
  recommended?: boolean;
  features: string[];
};

const plans: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    monthlyPrice: 0,
    annualPrice: 0,
    annualDiscountPercent: 0,
    trialDays: 0,
    users: 'Up to 1 user',
    subtitle: 'Perfect for small shops getting organized',
    ctaLabel: 'Start Free',
    recommended: true,
    features: [
      '1 user',
      '1 location',
      'Up to 25 work orders per month',
      'Customer & vehicle history',
      'Service management',
      'Basic invoices',
      'Community/email support'
    ]
  },
  {
    id: 'starter',
    name: 'Starter',
    monthlyPrice: 79,
    annualPrice: 790,
    annualDiscountPercent: 17,
    trialDays: 14,
    users: 'Up to 5 users',
    subtitle: 'For owner-operated shops that want simple daily control.',
    ctaLabel: 'Start Free for 14 Days',
    recommended: true,
    features: [
      'Unlimited work orders',
      'Staff job assignment',
      'Monthly revenue reports',
      'Remove Garixo branding',
      'Priority email support'
    ]
  },
  {
    id: 'growth',
    name: 'Growth',
    monthlyPrice: 129,
    annualPrice: 1290,
    annualDiscountPercent: 17,
    trialDays: 14,
    users: 'Up to 12 users',
    subtitle: 'For busy garages with more staff and higher daily volume.',
    ctaLabel: 'Scale My Shop',
    features: [
      'Everything in Starter',
      'Mechanic performance tracking',
      'Advanced reports',
      'Workflow management per staff',
      'Early access to new features',
      'Priority support'
    ]
  }
];

const pricingFaqs = [
  {
    question: 'Do I need a credit card to start?',
    answer:
      'No. You can start your free trial without a credit card and see how Garixo fits your daily workflow first.'
  },
  {
    question: 'Can I cancel anytime?',
    answer:
      'Yes. There are no long-term contracts. You can cancel whenever you need from your subscription settings.'
  },
  {
    question: 'How long does setup take?',
    answer:
      'Most independent shops can start in minutes. Garixo is built for non-technical owners and staff.'
  },
  {
    question: 'Which plan should I choose?',
    answer:
      'Starter is best for smaller teams up to 5 users. Growth is best if your shop has more staff or needs deeper reporting.'
  }
];

export const revalidate = false;

export const metadata: Metadata = {
  metadataBase: new URL('https://www.garixo.com'),
  title: 'Garage Management Software Pricing — From $79/mo | Garixo',
  description:
    'Garage management software pricing starts at $79/mo. Work orders, inventory, customers & staff included. 14-day free trial. No credit card needed.',
  keywords: ['garage management software pricing', 'auto repair software cost'],
  alternates: {
    canonical: '/pricing'
  },
  robots: {
    index: true,
    follow: true
  },
  openGraph: {
    title: 'Garage Management Software Pricing — From $79/mo | Garixo',
    description:
      'Garage management software pricing starts at $79/mo. Work orders, inventory, customers & staff included. 14-day free trial. No credit card needed.',
    type: 'website',
    url: 'https://www.garixo.com/pricing'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Garage Management Software Pricing — From $79/mo | Garixo',
    description:
      'Garage management software pricing starts at $79/mo. Work orders, inventory, customers & staff included. 14-day free trial. No credit card needed.'
  }
};

export default function PricingPage(): JSX.Element {
  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': 'https://www.garixo.com/#app',
    name: 'Garixo',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    url: 'https://www.garixo.com/pricing',
    description:
      'Garage management software pricing for independent auto repair shops.',
    offers: plans.map((plan) => ({
      '@type': 'Offer',
      name: `${plan.name} Monthly`,
      price: String(plan.monthlyPrice),
      priceCurrency: 'USD',
      url: 'https://www.garixo.com/auth/sign-up',
      availability: 'https://schema.org/InStock'
    }))
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://www.garixo.com/'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Pricing',
        item: 'https://www.garixo.com/pricing'
      }
    ]
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: pricingFaqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <LandingHeader />

      <main>
        <section className="border-b border-border bg-background-primary py-s12">
          <div className="mx-auto w-full max-w-[980px] px-s4 text-center">
            <h1 className="text-[34px] font-bold leading-tight text-text-primary md:text-[50px]">
              Simple Pricing for Independent Garage Owners
            </h1>
            <p className="mx-auto mt-s3 max-w-[760px] text-body text-text-secondary">
              No hidden fees. No long setup. Start your free trial and run work
              orders, customer history, and daily operations in one clear
              system.
            </p>
            <div className="mt-s4 flex flex-wrap items-center justify-center gap-s2">
              <Badge variant="success">14-day free trial</Badge>
              <Badge variant="default">No contract</Badge>
              <Badge variant="default">Cancel anytime</Badge>
            </div>
          </div>
        </section>

        <section className="bg-background-primary py-s10">
          <div className="mx-auto grid w-full max-w-[980px] gap-s4 px-s4 md:grid-cols-2">
            {plans
              .filter((plan) => plan.id !== 'free')
              .map((plan) => (
                <Card
                  key={plan.id}
                  className={`relative flex h-full flex-col p-s4 ${
                    plan.recommended ? 'border-primary-300 shadow-sm' : ''
                  }`}
                >
                  {plan.recommended ? (
                    <Badge
                      className="absolute right-s3 top-s3"
                      variant="success"
                    >
                      Most Popular
                    </Badge>
                  ) : null}

                  <div className="space-y-s1">
                    <h2 className="text-h2">{plan.name}</h2>
                    <p className="text-small text-text-muted">
                      {plan.subtitle}
                    </p>
                  </div>

                  <div className="mt-s3 rounded-md border border-border bg-surface-default p-s3">
                    <p className="text-h2 font-bold text-text-primary">
                      {formatCurrencyUsd(plan.monthlyPrice)}
                      <span className="ml-1 text-small font-medium text-text-muted">
                        /month
                      </span>
                    </p>
                    <p className="text-small text-text-muted">
                      {formatCurrencyUsd(plan.annualPrice)}/year • save{' '}
                      {plan.annualDiscountPercent}%
                    </p>
                    <p className="mt-s1 text-caption text-text-secondary">
                      {plan.users}
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
                    <Button asChild className="h-11 w-full">
                      <Link href="/auth/sign-up">{plan.ctaLabel}</Link>
                    </Button>
                  </div>
                </Card>
              ))}
          </div>
        </section>

        <section className="border-y border-border bg-background-secondary py-s10">
          <div className="mx-auto w-full max-w-[980px] px-s4">
            <div className="grid gap-s3 text-center md:grid-cols-3">
              <Card className="p-s4">
                <h3 className="text-h3">Built for Non-Technical Owners</h3>
                <p className="mt-s2 text-small text-text-secondary">
                  Clear screens, simple actions, and fast onboarding for busy
                  garage teams.
                </p>
              </Card>
              <Card className="p-s4">
                <h3 className="text-h3">Setup in Minutes</h3>
                <p className="mt-s2 text-small text-text-secondary">
                  Start using Garixo quickly without complex migration steps.
                </p>
              </Card>
              <Card className="p-s4">
                <h3 className="text-h3">Revenue-Focused</h3>
                <p className="mt-s2 text-small text-text-secondary">
                  If Garixo helps close one extra repair order, it can pay for
                  itself.
                </p>
              </Card>
            </div>
          </div>
        </section>

        <section className="bg-background-primary py-s10">
          <div className="mx-auto w-full max-w-[900px] px-s4">
            <h2 className="text-center text-h2">Common Questions</h2>
            <div className="mt-s4 space-y-s3">
              {pricingFaqs.map((faq) => (
                <Card key={faq.question} className="p-s4">
                  <h3 className="text-body font-semibold text-text-primary">
                    {faq.question}
                  </h3>
                  <p className="mt-s2 text-small text-text-secondary">
                    {faq.answer}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </>
  );
}
