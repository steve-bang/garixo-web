import type { Metadata } from 'next';
import Link from 'next/link';

import { LandingFooter } from '@/components/sections/LandingFooter';
import { LandingHeader } from '@/components/sections/LandingHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export const revalidate = false;

const faqItems = [
  {
    question: 'What is garage inventory management software?',
    answer:
      'Garage inventory management software helps auto repair shops track parts quantity, usage, and costs in one system to reduce waste and prevent stockouts.'
  },
  {
    question: 'Why does an auto repair shop need inventory tracking?',
    answer:
      'Without tracking, shops lose profit through missing parts, over-ordering, and delayed jobs. Inventory tracking gives owners clear stock visibility and better control.'
  },
  {
    question: 'Can I track parts per work order?',
    answer:
      'Yes. Garixo links parts usage to work orders so your team can see what was used, where it was used, and how it impacts margin.'
  },
  {
    question: 'Does Garixo support low stock alerts?',
    answer:
      'Yes. Garixo highlights low stock parts so you can reorder before repairs are delayed.'
  },
  {
    question: 'Is this suitable for small independent shops?',
    answer:
      'Yes. Garixo is designed for independent shops with 1 to 10 mechanics and simple daily workflows.'
  },
  {
    question: 'How is Garixo different from enterprise inventory software?',
    answer:
      'Garixo focuses on speed, clarity, and practical workflow for small shops. It is not a heavy ERP system with complex setup.'
  },
  {
    question: 'Can Garixo help reduce parts waste?',
    answer:
      'Yes. Real-time tracking and inventory history reduce duplicate purchases, missing parts, and unnecessary emergency orders.'
  },
  {
    question: 'Will this help increase profit per job?',
    answer:
      'Yes. Better parts cost visibility and fewer urgent part purchases help improve margin on completed jobs.'
  }
] as const;

const coreFeatures = [
  {
    title: 'Real-Time Parts Tracking',
    description:
      'See current stock levels instantly so your team always knows what is available.',
    benefit: 'No more guessing before a repair starts.'
  },
  {
    title: 'Automatic Inventory Deduction',
    description:
      'When parts are added to a work order, stock updates automatically.',
    benefit: 'Fewer manual errors and faster front-desk workflow.'
  },
  {
    title: 'Low Stock Alerts',
    description: 'Get clear warnings when high-usage parts are getting low.',
    benefit: 'Avoid job delays and emergency part orders.'
  },
  {
    title: 'Supplier Management',
    description:
      'Keep supplier details and sourcing notes organized in one place.',
    benefit: 'Reorder quickly when stock needs attention.'
  },
  {
    title: 'Cost and Profit Tracking',
    description: 'Track part costs clearly to understand real margin per job.',
    benefit: 'Make smarter pricing decisions with confidence.'
  },
  {
    title: 'Work Order Integration',
    description: 'Inventory is directly connected to your repair workflow.',
    benefit: 'One smooth flow from job creation to billing.'
  },
  {
    title: 'Inventory History Log',
    description: 'Review adjustments and usage with a clean historical record.',
    benefit: 'Better accountability for your team and operation.'
  }
] as const;

export const metadata: Metadata = {
  metadataBase: new URL('https://www.garixo.com'),
  title: 'Auto Parts Inventory Management Software — Track Stock | Garixo',
  description:
    'Auto parts inventory management software for repair shops. Real-time stock tracking, low-stock alerts, and auto-deduct parts on every work order.',
  keywords: [
    'auto parts inventory management software',
    'auto repair inventory software',
    'auto shop parts inventory system',
    'mechanic inventory management',
    'parts tracking for auto repair shop',
    'low stock alerts garage',
    'auto repair parts management',
    'shop inventory control system',
    'small auto shop inventory software'
  ],
  alternates: {
    canonical: '/features/inventory-management'
  },
  robots: {
    index: true,
    follow: true
  },
  openGraph: {
    title: 'Auto Parts Inventory Management Software — Track Stock | Garixo',
    description:
      'Auto parts inventory management software for repair shops. Real-time stock tracking, low-stock alerts, and auto-deduct parts on every work order.',
    type: 'website',
    url: 'https://www.garixo.com/features/inventory-management'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Auto Parts Inventory Management Software — Track Stock | Garixo',
    description:
      'Auto parts inventory management software for repair shops. Real-time stock tracking, low-stock alerts, and auto-deduct parts on every work order.'
  }
};

export default function InventoryManagementFeaturePage(): JSX.Element {
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
        name: 'Features',
        item: 'https://www.garixo.com/features'
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Inventory Management',
        item: 'https://www.garixo.com/features/inventory-management'
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

      <LandingHeader />

      <main>
        <section className="border-b border-border bg-background-primary py-s12">
          <div className="mx-auto w-full max-w-[1000px] px-s4 text-center">
            <h1 className="text-[34px] font-bold leading-tight text-text-primary md:text-[52px]">
              Auto Parts Inventory Management Software — Track Stock, Prevent
              Shortages
            </h1>
            <p className="mx-auto mt-s3 max-w-[800px] text-body text-text-secondary">
              Track parts in real time, avoid stockouts during repairs, and
              reduce money loss from over-ordering. Garixo gives small shops a
              simple auto repair inventory software workflow that protects
              revenue every day.
            </p>
            <p className="mt-s2 text-small text-text-secondary">
              Industry context:{' '}
              <a
                href="https://www.ibisworld.com"
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="font-medium text-primary-700 hover:text-primary-800"
              >
                auto parts industry market size $79.6 billion in the US
                (IBISWorld 2025)
              </a>
              .
            </p>
            <div className="mt-s6 flex flex-col justify-center gap-s2 sm:flex-row">
              <Button asChild className="h-12">
                <Link href="/auth/sign-up">Start Free Trial</Link>
              </Button>
              <Button asChild variant="secondary" className="h-12">
                <Link href="#how-it-works">See How It Works</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="border-b border-border bg-background-secondary py-s12">
          <div className="mx-auto w-full max-w-[980px] px-s4">
            <h2 className="text-[30px] font-semibold leading-tight text-text-primary md:text-[38px]">
              Still Managing Parts with Paper or Excel?
            </h2>
            <p className="mt-s3 max-w-[860px] text-body text-text-secondary">
              Many small US shops lose profit because part tracking is manual.
              The team works hard, but inventory errors still happen and jobs
              get delayed.
            </p>
            <div className="mt-s6 grid gap-s3 md:grid-cols-2">
              <Card className="p-s4">
                <h3 className="text-h3">Common problems</h3>
                <ul className="mt-s2 list-disc space-y-s1 pl-s6 text-small text-text-secondary">
                  <li>Lost parts and unclear usage records</li>
                  <li>Out-of-stock parts during active repairs</li>
                  <li>Over-ordering that locks up cash flow</li>
                  <li>No visibility into real part cost per job</li>
                </ul>
              </Card>
              <Card className="p-s4">
                <h3 className="text-h3">Business impact</h3>
                <ul className="mt-s2 list-disc space-y-s1 pl-s6 text-small text-text-secondary">
                  <li>Slower turnaround and unhappy customers</li>
                  <li>Emergency part orders with higher costs</li>
                  <li>Lower profit per completed repair</li>
                  <li>Owner decisions based on guesswork</li>
                </ul>
              </Card>
            </div>
          </div>
        </section>

        <section className="border-b border-border bg-background-primary py-s12">
          <div className="mx-auto w-full max-w-[980px] px-s4">
            <h2 className="text-[30px] font-semibold leading-tight text-text-primary md:text-[38px]">
              Simple Auto Repair Inventory Software That Just Works
            </h2>
            <p className="mt-s3 max-w-[860px] text-body text-text-secondary">
              Garixo is a practical auto shop inventory system built for
              independent garages. It helps your team move faster, avoid parts
              waste, and improve margin with clear daily visibility.
            </p>

            <div className="mt-s4 grid gap-s3 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="p-s4">
                <h3 className="text-h3">Real-time stock tracking</h3>
                <p className="mt-s2 text-small text-text-secondary">
                  Keep live visibility of what is in stock now.
                </p>
              </Card>
              <Card className="p-s4">
                <h3 className="text-h3">Low stock alerts</h3>
                <p className="mt-s2 text-small text-text-secondary">
                  Reorder before repairs get delayed.
                </p>
              </Card>
              <Card className="p-s4">
                <h3 className="text-h3">Profit visibility per job</h3>
                <p className="mt-s2 text-small text-text-secondary">
                  Understand parts cost impact on each repair.
                </p>
              </Card>
            </div>
          </div>
        </section>

        <section className="border-b border-border bg-background-primary py-s12">
          <div className="mx-auto w-full max-w-[980px] px-s4">
            <h2 className="text-[30px] font-semibold leading-tight text-text-primary md:text-[38px]">
              Core Features
            </h2>
            <div className="mt-s4 grid gap-s3 md:grid-cols-2">
              {coreFeatures.map((feature) => (
                <Card key={feature.title} className="p-s4">
                  <h3 className="text-h3">{feature.title}</h3>
                  <p className="mt-s2 text-small text-text-secondary">
                    {feature.description}
                  </p>
                  <p className="mt-s2 text-small font-medium text-text-primary">
                    {feature.benefit}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section
          id="how-it-works"
          className="border-b border-border bg-background-secondary py-s12"
        >
          <div className="mx-auto w-full max-w-[980px] px-s4">
            <h2 className="text-[30px] font-semibold leading-tight text-text-primary md:text-[38px]">
              How It Works in 3 Simple Steps
            </h2>
            <div className="mt-s4 grid gap-s3 md:grid-cols-3">
              <Card className="p-s4">
                <p className="text-primary text-caption font-semibold">
                  Step 1
                </p>
                <h3 className="mt-s1 text-h3">Add your parts</h3>
                <p className="mt-s2 text-small text-text-secondary">
                  Set quantity, cost, and reorder level for each item.
                </p>
              </Card>
              <Card className="p-s4">
                <p className="text-primary text-caption font-semibold">
                  Step 2
                </p>
                <h3 className="mt-s1 text-h3">Use parts in work orders</h3>
                <p className="mt-s2 text-small text-text-secondary">
                  Stock updates automatically when parts are used.
                </p>
              </Card>
              <Card className="p-s4">
                <p className="text-primary text-caption font-semibold">
                  Step 3
                </p>
                <h3 className="mt-s1 text-h3">Track stock and get alerts</h3>
                <p className="mt-s2 text-small text-text-secondary">
                  Reorder early and keep jobs moving without interruption.
                </p>
              </Card>
            </div>
          </div>
        </section>

        <section className="border-b border-border bg-background-primary py-s12">
          <div className="mx-auto w-full max-w-[980px] px-s4">
            <h2 className="text-[30px] font-semibold leading-tight text-text-primary md:text-[38px]">
              Who It&apos;s For
            </h2>
            <ul className="mt-s4 grid gap-s2 text-small text-text-secondary sm:grid-cols-2 lg:grid-cols-3">
              <li>General repair shops</li>
              <li>Tire shops</li>
              <li>Quick lube shops</li>
              <li>Mobile mechanics</li>
              <li>Growing independent shops</li>
            </ul>

            <h3 className="mt-s8 text-h2">Related Tools to Run Your Shop</h3>
            <p className="mt-s2 text-small text-text-secondary">
              Connect inventory with your full workflow for better daily
              control:
            </p>
            <div className="mt-s4 grid gap-s2 md:grid-cols-2">
              <Link
                href="/features/work-orders-management"
                className="group flex items-center justify-between rounded-md border border-border bg-surface-default px-s3 py-s3 text-small text-text-primary transition-colors hover:border-primary-300 hover:bg-primary-50"
              >
                <span className="font-medium">
                  Work Order Management Software
                </span>
                <span className="text-primary transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </Link>
              <Link
                href="/features/customers-management"
                className="group flex items-center justify-between rounded-md border border-border bg-surface-default px-s3 py-s3 text-small text-text-primary transition-colors hover:border-primary-300 hover:bg-primary-50"
              >
                <span className="font-medium">Customers Management System</span>
                <span className="text-primary transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </Link>
              <Link
                href="/features/staff-management"
                className="group flex items-center justify-between rounded-md border border-border bg-surface-default px-s3 py-s3 text-small text-text-primary transition-colors hover:border-primary-300 hover:bg-primary-50"
              >
                <span className="font-medium">Staff Management Software</span>
                <span className="text-primary transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </Link>
              <Link
                href="/pricing"
                className="group flex items-center justify-between rounded-md border border-border bg-surface-default px-s3 py-s3 text-small text-text-primary transition-colors hover:border-primary-300 hover:bg-primary-50"
              >
                <span className="font-medium">Garage Pricing Plans</span>
                <span className="text-primary transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-slate-900 py-s12">
          <div className="mx-auto w-full max-w-[900px] px-s4 text-center">
            <h2 className="text-[30px] font-semibold text-white md:text-[40px]">
              Stop Losing Money on Parts
            </h2>
            <p className="mx-auto mt-s2 max-w-[700px] text-body text-slate-300">
              Reduce parts waste, avoid emergency orders, free up cash flow, and
              track real part cost with a simple inventory workflow your team
              can use every day.
            </p>
            <div className="mt-s4">
              <Button
                asChild
                className="h-12 bg-surface-default text-primary-800 hover:bg-primary-50"
              >
                <Link href="/auth/sign-up">
                  Start Free Trial - No Credit Card Required
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="border-b border-border bg-background-primary py-s12">
          <div className="mx-auto w-full max-w-[980px] px-s4">
            <h2 className="text-[30px] font-semibold leading-tight text-text-primary md:text-[38px]">
              Frequently Asked Questions
            </h2>
            <div className="mt-s4 space-y-s3">
              {faqItems.map((faq) => (
                <Card key={faq.question} className="p-s4">
                  <h3 className="text-h3">{faq.question}</h3>
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
