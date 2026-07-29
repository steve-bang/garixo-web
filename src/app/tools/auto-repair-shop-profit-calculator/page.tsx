import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

import { ShopProfitCalculator } from '@/components/tools/shop-profit-calculator';
import { LandingFooter } from '@/components/sections/LandingFooter';
import { LandingHeader } from '@/components/sections/LandingHeader';
import { TrackedButtonLink } from '@/components/common/tracked-button-link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export const revalidate = false;

const faqItems = [
  {
    question: 'How much profit should a repair shop make?',
    answer:
      'Most healthy independent shops target a 20–30% profit margin after all costs. This calculator shows what that looks like for your numbers.'
  },
  {
    question: 'What is the average profit margin for auto repair shops?',
    answer:
      'Profit margins vary by region and service mix. Many successful shops aim for 20–30%, but your target should reflect your real expenses.'
  },
  {
    question: 'How do repair shops increase profit?',
    answer:
      'Improve labor rate accuracy, track parts cost, reduce inefficiencies, and price jobs consistently based on real costs.'
  },
  {
    question: 'How much revenue does a mechanic shop make?',
    answer:
      'Revenue depends on job volume and average ticket size. Use the calculator to estimate monthly revenue based on your shop activity.'
  },
  {
    question: 'Why do shops underestimate profit?',
    answer:
      'Many owners forget parts cost, tools, or admin expenses. That makes the profit look higher than it really is.'
  }
] as const;

export const metadata: Metadata = {
  metadataBase: new URL('https://www.garixo.com'),
  title:
    'Auto Repair Shop Profit Calculator — Free Tool for Garage Owners | Garixo',
  description:
    'Free auto repair shop profit calculator. Enter revenue, labor, parts, and overhead — see your real monthly net profit in minutes. No signup needed.',
  keywords: [
    'auto repair shop profit calculator',
    'repair shop profit calculator',
    'auto shop profit margin calculator',
    'garage profit calculator',
    'mechanic shop profit calculator'
  ],
  alternates: {
    canonical: '/tools/auto-repair-shop-profit-calculator'
  },
  robots: {
    index: true,
    follow: true
  },
  openGraph: {
    title:
      'Auto Repair Shop Profit Calculator — Free Tool for Garage Owners | Garixo',
    description:
      'Free auto repair shop profit calculator. Enter revenue, labor, parts, and overhead — see your real monthly net profit in minutes. No signup needed.',
    type: 'website',
    url: 'https://www.garixo.com/tools/auto-repair-shop-profit-calculator'
  },
  twitter: {
    card: 'summary_large_image',
    title:
      'Auto Repair Shop Profit Calculator — Free Tool for Garage Owners | Garixo',
    description:
      'Free auto repair shop profit calculator. Enter revenue, labor, parts, and overhead — see your real monthly net profit in minutes. No signup needed.'
  }
};

export default function ShopProfitCalculatorPage(): JSX.Element {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
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
        name: 'Tools',
        item: 'https://www.garixo.com/tools'
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Auto Repair Shop Profit Calculator',
        item: 'https://www.garixo.com/tools/auto-repair-shop-profit-calculator'
      }
    ]
  };

  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Auto Repair Shop Profit Calculator',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    url: 'https://www.garixo.com/tools/auto-repair-shop-profit-calculator',
    description:
      'Free auto repair shop profit calculator. Enter revenue, labor, parts, and overhead — see your real monthly net profit in minutes. No signup needed.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Garixo',
      url: 'https://www.garixo.com'
    }
  };

  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Auto Repair Shop Profit Calculator',
    url: 'https://www.garixo.com/tools/auto-repair-shop-profit-calculator',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description:
      'Free auto repair shop profit calculator. Enter revenue, labor, parts, and overhead — see your real monthly net profit in minutes. No signup needed.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    },
    provider: {
      '@type': 'Organization',
      name: 'Garixo',
      url: 'https://www.garixo.com'
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />

      <LandingHeader />

      <main>
        <section className="border-b border-border bg-background-primary py-s12">
          <div className="mx-auto w-full max-w-[1200px] px-s4">
            <div className="grid items-center gap-s8 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="text-center lg:text-left">
                <p className="inline-flex items-center rounded-full border border-primary-100 bg-primary-50 px-s3 py-1 text-caption font-semibold text-primary-700">
                  Free Profit Tool for Garage Owners
                </p>
                <h1 className="mt-s4 text-[34px] font-bold leading-tight text-text-primary md:text-[52px]">
                  Auto Repair Shop Profit Calculator
                </h1>
                <p className="mt-s3 max-w-[640px] text-body text-text-secondary">
                  Find out how much profit your repair shop actually makes. Many
                  garage owners underestimate their true costs — this tool shows
                  the real monthly profit in minutes.
                </p>
                <div className="mt-s6 flex flex-col justify-center gap-s2 sm:flex-row lg:justify-start">
                  <TrackedButtonLink
                    href="#calculator"
                    eventName="shop_profit_calculator_cta_hero"
                    className="h-12"
                  >
                    Calculate My Shop Profit
                  </TrackedButtonLink>
                  <Button asChild variant="secondary" className="h-12">
                    <Link href="/pricing">See Garixo Pricing</Link>
                  </Button>
                </div>
              </div>
              <div className="mx-auto w-full max-w-[520px]">
                <div className="overflow-hidden rounded-2xl border border-border bg-surface-default shadow-sm ring-1 ring-primary-100/40">
                  <Image
                    src="/images/tools/repair-shop-profit-calculator-hero.webp"
                    alt="Auto repair shop monthly profit calculator showing revenue, parts cost, labor, overhead, and net margin breakdown for independent garages"
                    width={1040}
                    height={840}
                    className="h-auto w-full object-cover"
                    priority
                    sizes="(max-width: 1024px) 90vw, 520px"
                  />
                </div>
                <p className="mt-s3 text-center text-caption text-text-muted lg:text-left">
                  See revenue, cost, and net profit in one simple view.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-background-primary py-s12" id="calculator">
          <div className="mx-auto w-full max-w-[1200px] px-s4">
            <div className="mb-s8 space-y-s2 text-center">
              <h2 className="text-h1 text-text-primary">
                Step-by-step profit calculator
              </h2>
              <p className="text-body text-text-secondary">
                Answer a few quick questions. Results update instantly.
              </p>
            </div>
            <ShopProfitCalculator />
            <p className="mt-s6 text-center text-small text-text-muted">
              Parts cost can make or break your margin. For a helpful benchmark,
              see{' '}
              <a
                href="https://ratchetandwrench.com"
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="font-medium text-primary-700 underline-offset-2 hover:underline"
              >
                what is a good profit margin for an auto repair shop
              </a>
              .
            </p>
          </div>
        </section>

        <section className="bg-background-secondary py-s12">
          <div className="mx-auto w-full max-w-[1100px] space-y-s8 px-s4">
            <div className="space-y-s3">
              <h2 className="text-h1 text-text-primary">
                How profitable is an auto repair shop?
              </h2>
              <p className="text-body text-text-secondary">
                Profitability depends on job volume, ticket size, and how well
                you control labor, parts, and overhead. This calculator shows
                what your current mix delivers.
              </p>
            </div>
            <div className="space-y-s3">
              <h2 className="text-h1 text-text-primary">
                Average profit margin for repair shops
              </h2>
              <p className="text-body text-text-secondary">
                Most independent auto repair shops target a net profit margin
                between 20% and 30%. Shops below 15% are typically losing money
                to labor inefficiency or parts leakage. High-performing shops
                above 30% usually have strong labor pricing, low overhead per
                bay, and tight parts cost control. Use the calculator above to
                see where your shop stands and what margin your current numbers
                actually produce.
              </p>
            </div>
            <div className="space-y-s3">
              <h2 className="text-h1 text-text-primary">
                How to increase repair shop profitability
              </h2>
              <p className="text-body text-text-secondary">
                Track job profitability, improve labor pricing, and avoid parts
                leakage. Small improvements can add thousands per month.
              </p>
            </div>
            <div className="space-y-s3">
              <h2 className="text-h1 text-text-primary">
                Common mistakes that reduce shop profit
              </h2>
              <p className="text-body text-text-secondary">
                Ignoring parts cost, underpricing labor, and not tracking
                overhead all create invisible losses that add up quickly.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-background-secondary py-s12">
          <div className="mx-auto w-full max-w-[1100px] px-s4">
            <Card className="space-y-s4 border border-border bg-surface-default p-s8 text-center shadow-sm">
              <h2 className="text-[32px] font-semibold text-text-primary">
                Ready to grow shop profit with confidence?
              </h2>
              <p className="text-body text-text-secondary">
                Garixo helps independent garages track revenue, cost, and profit
                in one clean dashboard.
              </p>
              <div className="flex flex-col justify-center gap-s2 sm:flex-row">
                <TrackedButtonLink
                  href="https://app.garixo.com/register"
                  eventName="shop_profit_calculator_cta_footer"
                  className="h-12"
                >
                  Start Free
                </TrackedButtonLink>
                <Button asChild variant="secondary" className="h-12">
                  <Link href="/pricing">View Pricing</Link>
                </Button>
              </div>
            </Card>
          </div>
        </section>
      </main>

      <LandingFooter />
    </>
  );
}
