import type { Metadata } from 'next';
import Link from 'next/link';

import { LaborRateCalculator } from '@/components/tools/labor-rate-calculator';
import { LandingFooter } from '@/components/sections/LandingFooter';
import { LandingHeader } from '@/components/sections/LandingHeader';
import { TrackedButtonLink } from '@/components/common/tracked-button-link';
import { Button } from '@/components/ui/button';

export const revalidate = false;

const faqItems = [
  {
    question: 'What is a good labor rate for a mechanic?',
    answer:
      'A good labor rate covers all shop expenses and leaves room for profit. The right number is different for every shop, which is why calculating it based on your real costs is important.'
  },
  {
    question: 'How do auto repair shops calculate labor cost?',
    answer:
      'Most shops divide total monthly expenses by billable hours to find the break-even rate. Then they add desired profit to set the final labor rate.'
  },
  {
    question: 'What is the average mechanic hourly rate in the US?',
    answer:
      'Rates vary by region, shop size, and service mix. Use the calculator to find the rate that fits your specific expenses and workload.'
  },
  {
    question: 'How can I increase my shop profitability?',
    answer:
      'Charge a labor rate that reflects your real costs, track job profitability, and keep work orders organized so your team can complete more jobs per day.'
  },
  {
    question: 'Is this calculator good for small shops?',
    answer:
      'Yes. It is built for independent shops with 1–10 mechanics and focuses on simple inputs with clear results.'
  },
  {
    question: 'Can Garixo help after I set my labor rate?',
    answer:
      'Yes. Garixo applies your labor rate inside work orders and invoices so every job reflects your real pricing.'
  }
] as const;

export const metadata: Metadata = {
  metadataBase: new URL('https://www.garixo.com'),
  title: 'Auto Repair Labor Rate Calculator — Free Tool | Garixo',
  description:
    'Free auto repair labor rate calculator. Enter your shop costs and profit goal — get your break-even and recommended hourly rate in under 60 seconds.',
  keywords: [
    'auto repair labor rate calculator',
    'mechanic hourly rate calculator',
    'garage labor rate calculator',
    'auto shop labor rate formula',
    'repair shop profit calculator'
  ],
  alternates: {
    canonical: '/tools/auto-repair-labor-rate-calculator'
  },
  robots: {
    index: true,
    follow: true
  },
  openGraph: {
    title: 'Auto Repair Labor Rate Calculator — Free Tool | Garixo',
    description:
      'Free auto repair labor rate calculator. Enter your shop costs and profit goal — get your break-even and recommended hourly rate in under 60 seconds.',
    type: 'website',
    url: 'https://www.garixo.com/tools/auto-repair-labor-rate-calculator'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Auto Repair Labor Rate Calculator — Free Tool | Garixo',
    description:
      'Free auto repair labor rate calculator. Enter your shop costs and profit goal — get your break-even and recommended hourly rate in under 60 seconds.'
  }
};

export default function LaborRateCalculatorPage(): JSX.Element {
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
        name: 'Auto Repair Labor Rate Calculator',
        item: 'https://www.garixo.com/tools/auto-repair-labor-rate-calculator'
      }
    ]
  };

  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Auto Repair Labor Rate Calculator',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    url: 'https://www.garixo.com/tools/auto-repair-labor-rate-calculator',
    description:
      'Calculate break-even and recommended labor rates for independent auto repair shops.',
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
    name: 'Auto Repair Labor Rate Calculator',
    url: 'https://www.garixo.com/tools/auto-repair-labor-rate-calculator',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description:
      'Free calculator for independent auto repair shop owners to find their break-even and recommended hourly labor rate in 60 seconds.',
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

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Calculate Auto Repair Labor Rate',
    description:
      'Step-by-step guide to calculating the correct hourly labor rate for your auto repair shop.',
    step: [
      {
        '@type': 'HowToStep',
        name: 'Gather Your Monthly Expenses',
        text: "Collect all your shop's monthly expenses, including rent, utilities, salaries, parts, and other overhead costs."
      },
      {
        '@type': 'HowToStep',
        name: 'Determine Billable Hours',
        text: 'Calculate the total number of billable hours your mechanics work in a month. This is typically the number of mechanics multiplied by their working hours minus any non-billable time.'
      },
      {
        '@type': 'HowToStep',
        name: 'Calculate Break-Even Rate',
        text: 'Divide your total monthly expenses by the total billable hours to find your break-even labor rate.'
      },
      {
        '@type': 'HowToStep',
        name: 'Set Your Profit Goal',
        text: 'Decide on a profit margin you want to achieve and add that to your break-even rate to determine your final labor rate.'
      },
      {
        '@type': 'HowToStep',
        name: 'Use the Calculator',
        text: 'Enter your expenses, billable hours, and profit goal into the Auto Repair Labor Rate Calculator to get instant results.'
      }
    ]
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

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />

      <LandingHeader />

      <main>
        <section className="border-b border-border bg-background-primary py-s12">
          <div className="mx-auto w-full max-w-[1000px] px-s4 text-center">
            <p className="inline-flex items-center rounded-full border border-primary-100 bg-primary-50 px-s3 py-s1 text-caption font-semibold text-primary-700">
              Free Tool for Independent Shops
            </p>
            <h1 className="mt-s4 text-[34px] font-bold leading-tight text-text-primary md:text-[52px]">
              Auto Repair Labor Rate Calculator
            </h1>
            <p className="mx-auto mt-s3 max-w-[760px] text-body text-text-secondary">
              Find the correct hourly labor rate for your repair shop in 60
              seconds.
            </p>
            <div className="mt-s6 flex flex-col justify-center gap-s2 sm:flex-row">
              <TrackedButtonLink
                href="#calculator"
                eventName="labor_rate_calculator_cta_hero"
                className="h-12"
              >
                Calculate My Labor Rate
              </TrackedButtonLink>
              <Button asChild variant="secondary" className="h-12">
                <Link href="/pricing">See Garixo Pricing</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="bg-background-secondary py-s10">
          <div className="mx-auto w-full max-w-[1000px] px-s4">
            <div className="space-y-s3 text-left">
              <h2 className="text-h2 text-text-primary">
                What is a labor rate and why it matters
              </h2>
              <p className="text-body text-text-secondary">
                Your labor rate is the hourly price you charge for technician
                time. It’s the foundation of your profit. If the rate is too
                low, every job quietly loses money. If it’s too high, you risk
                pushback from customers. Industry benchmarks show the{' '}
                <a
                  href="https://lookupaplate.com/blog/auto-repair-industry-statistics"
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="font-medium text-primary-700 underline-offset-2 hover:underline"
                >
                  average auto repair labor rate ranges from $45 to $170 per
                  hour in the US
                </a>
                , but the right number still depends on your costs and capacity.
                This calculator is designed for independent shops that want a
                clear, realistic number based on real expenses, team capacity,
                and profit goals — not guesswork. Use it when pricing services,
                reviewing margins, or deciding whether it’s time for a rate
                adjustment.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-background-primary py-s12" id="calculator">
          <div className="mx-auto w-full max-w-[1200px] px-s4">
            <div className="mb-s8 space-y-s2 text-center">
              <h2 className="text-h1 text-text-primary">
                Step-by-step labor rate calculator
              </h2>
              <p className="text-body text-text-secondary">
                Follow the steps below. Your results update instantly as you
                type.
              </p>
            </div>
            <LaborRateCalculator />
          </div>
        </section>

        <section className="bg-background-primary pb-s12">
          <div className="mx-auto w-full max-w-[1100px] px-s4">
            <div className="rounded-xl border border-border bg-surface-default p-s6 text-center shadow-sm">
              <h2 className="text-[28px] font-semibold text-text-primary">
                Now that you know your rate — are you hitting it every day?
              </h2>
              <p className="mx-auto mt-s3 max-w-[760px] text-body text-text-secondary">
                Garixo shows real labor revenue per job, per technician, and per
                day so you can track whether your labor rate is actually turning
                into profit.
              </p>
              <div className="mt-s6 flex flex-col justify-center gap-s2 sm:flex-row">
                <TrackedButtonLink
                  href="/auth/sign-up"
                  eventName="labor_rate_calculator_cta_result"
                  className="h-12"
                >
                  Start Free Trial — No Credit Card Needed
                </TrackedButtonLink>
                <Button asChild variant="secondary" className="h-12">
                  <Link href="/features/work-orders-management">
                    Job Management Software
                  </Link>
                </Button>
              </div>
              <p className="mt-s4 text-small text-text-muted">
                Also useful:{' '}
                <Link
                  href="/tools/auto-repair-shop-profit-calculator"
                  className="font-medium text-primary-700 underline-offset-2 hover:underline"
                >
                  Auto Repair Shop Profit Calculator →
                </Link>
              </p>
            </div>
          </div>
        </section>

        <section className="bg-background-secondary py-s12">
          <div className="mx-auto w-full max-w-[1100px] px-s4">
            <div className="space-y-s6">
              <div className="space-y-s3">
                <h2 className="text-h1 text-text-primary">
                  Average US auto repair labor rate (benchmarks)
                </h2>
                <p className="text-body text-text-secondary">
                  Labor rates vary by state, shop type, and cost of doing
                  business. Industry reporting shows rates can range from under
                  $100 per hour to well above $200 per hour depending on the
                  market. Recent national reporting also indicates that a large
                  share of independent shops cluster around the $120–$159 per
                  hour range. Use these benchmarks as context, then calculate
                  the right rate for your shop using your own expense and
                  capacity data.
                </p>
              </div>

              <div className="space-y-s3">
                <h2 className="text-h1 text-text-primary">
                  How location affects labor rates (urban vs. rural)
                </h2>
                <p className="text-body text-text-secondary">
                  Rates rise in higher-cost metro areas because rent, wages, and
                  utilities are higher. Rural shops often price lower, but still
                  need to cover overhead and maintain healthy margins. If your
                  shop competes in a higher-cost market, your labor rate has to
                  reflect the real cost of running your bays, not just what the
                  shop down the street is charging.
                </p>
              </div>

              <div className="space-y-s3">
                <h2 className="text-h1 text-text-primary">
                  Door rate vs. effective rate
                </h2>
                <p className="text-body text-text-secondary">
                  The door rate is the posted hourly price on your counter or
                  estimate. The effective rate is what you actually collect
                  after discounts, comebacks, unbilled time, and warranty work.
                  A shop can advertise $140/hour but only realize $110/hour if
                  billable hours are leaking. Use this calculator to set a
                  strong door rate, then track your effective rate with real job
                  data.
                </p>
              </div>

              <div className="space-y-s3">
                <h2 className="text-h1 text-text-primary">
                  How to use the result from this calculator
                </h2>
                <p className="text-body text-text-secondary">
                  Start with the break-even rate — that’s the minimum you need
                  to charge to keep the shop running. Then focus on the
                  recommended rate to reach your profit target. If your current
                  rate is below the recommendation, you can close the gap by
                  adjusting pricing, improving productivity, or tightening parts
                  margins. If the recommended rate feels high, revisit your
                  expenses or your target profit to find a realistic path
                  forward.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </>
  );
}
