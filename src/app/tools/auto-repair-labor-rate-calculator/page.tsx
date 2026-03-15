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
  title: 'Auto Repair Labor Rate Calculator | Garixo',
  description:
    'Free calculator to find the correct labor rate for your auto repair shop. Calculate expenses, technician hours, and profit in seconds.',
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
    title: 'Auto Repair Labor Rate Calculator | Garixo',
    description:
      'Calculate the right hourly labor rate for your shop in under 60 seconds.',
    type: 'website',
    url: 'https://www.garixo.com/tools/auto-repair-labor-rate-calculator'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Auto Repair Labor Rate Calculator | Garixo',
    description:
      'Use a simple calculator to set the right labor rate and hit your profit goals.'
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
      </main>

      <LandingFooter />
    </>
  );
}
