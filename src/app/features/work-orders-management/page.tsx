import type { Metadata } from 'next';
import Link from 'next/link';

import { LandingFooter } from '@/components/sections/LandingFooter';
import { LandingHeader } from '@/components/sections/LandingHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export const revalidate = false;

const faqItems = [
  {
    question: 'What is auto repair work order software?',
    answer:
      'Auto repair work order software helps shops create, assign, track, and complete repair jobs in one digital workflow instead of paper tickets.'
  },
  {
    question: 'How does digital work order software help small garages?',
    answer:
      'It reduces missed jobs, improves mechanic coordination, speeds approvals, and gives owners clearer control over daily operations.'
  },
  {
    question: 'Can I track job status in real time?',
    answer:
      'Yes. Garixo helps your team track each job from pending to in progress to completed in real time.'
  },
  {
    question: 'Can I connect work orders to inventory?',
    answer:
      'Yes. Parts added to work orders can connect with inventory flow to improve stock visibility and reduce delays.'
  },
  {
    question: 'Is this suitable for small independent shops?',
    answer:
      'Yes. Garixo is built for owner-operated auto shops with 1 to 10 mechanics and simple day-to-day workflows.'
  },
  {
    question: 'Does Garixo support mobile access?',
    answer:
      'Yes. Garixo is mobile-friendly so owners and staff can manage jobs from tablet or phone while moving around the shop.'
  },
  {
    question: 'How is Garixo different from enterprise systems?',
    answer:
      'Garixo focuses on simple, practical workflows for independent garages and avoids complex ERP-style setup.'
  },
  {
    question: 'Can work order management help increase profit per job?',
    answer:
      'Yes. Better job tracking, clearer service and parts records, and faster invoicing help improve margin on each repair.'
  }
] as const;

const coreFeatures = [
  {
    title: 'Quick Work Order Creation',
    description:
      'Create complete work orders in seconds with customer, vehicle, and issue details.',
    benefit: 'Never lose a repair ticket again.'
  },
  {
    title: 'Job Status Tracking',
    description:
      'Track job flow through clear stages from pending to completed.',
    benefit: 'Know what every vehicle needs right now.'
  },
  {
    title: 'Assign Mechanics',
    description: 'Assign the right mechanic quickly and keep workload visible.',
    benefit: 'Reduce wait time and improve team output.'
  },
  {
    title: 'Add Services and Parts',
    description: 'Build each job with labor and parts in one place.',
    benefit: 'Capture full value of every repair.'
  },
  {
    title: 'Automatic Cost Calculation',
    description: 'Totals update automatically as services and parts change.',
    benefit: 'Avoid undercharging and billing mistakes.'
  },
  {
    title: 'Inventory Integration',
    description: 'Work orders connect to stock usage and parts flow.',
    benefit: 'Avoid stock surprises during active jobs.'
  },
  {
    title: 'Customer and Vehicle History',
    description: 'Every job links to customer and vehicle records.',
    benefit: 'Deliver faster repeat service with context.'
  },
  {
    title: 'Digital Record Archive',
    description: 'Keep a searchable timeline of completed work orders.',
    benefit: 'No more paper folders or missing records.'
  },
  {
    title: 'Profit Per Job Tracking',
    description: 'Track real job value using service and parts details.',
    benefit: 'Focus on the repairs that grow your revenue.'
  }
] as const;

export const metadata: Metadata = {
  metadataBase: new URL('https://www.garixo.com'),
  title: 'Work Order Management Software for Auto Repair Shops | Garixo',
  description:
    'Work order management software for auto repair shops. Create, assign, and close repair jobs from check-in to invoice. Simple and fast digital workflow.',
  keywords: [
    'work order management software auto repair',
    'garage work order management system',
    'auto shop work order software',
    'mechanic work order app',
    'mechanic work order management',
    'create work orders for auto repair',
    'digital work order system',
    'track repair jobs',
    'auto repair job tracking software',
    'small auto shop management software',
    'repair shop workflow management'
  ],
  alternates: {
    canonical: '/features/work-orders-management'
  },
  robots: {
    index: true,
    follow: true
  },
  openGraph: {
    title: 'Work Order Management Software for Auto Repair Shops | Garixo',
    description:
      'Work order management software for auto repair shops. Create, assign, and close repair jobs from check-in to invoice. Simple and fast digital workflow.',
    type: 'website',
    url: 'https://www.garixo.com/features/work-orders-management'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Work Order Management Software for Auto Repair Shops | Garixo',
    description:
      'Work order management software for auto repair shops. Create, assign, and close repair jobs from check-in to invoice. Simple and fast digital workflow.'
  }
};

export default function WorkOrdersManagementFeaturePage(): JSX.Element {
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
        name: 'Work Orders Management',
        item: 'https://www.garixo.com/features/work-orders-management'
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
              Work Order Management Software for Auto Repair Shops — Track Every
              Job
            </h1>
            <p className="mx-auto mt-s3 max-w-[820px] text-body text-text-secondary">
              Track every repair job, organize your team, and improve revenue
              per repair with a simple garage work order management system built
              for owner-operated shops.
            </p>
            <div className="mt-s6 flex flex-col justify-center gap-s2 sm:flex-row">
              <Button asChild className="h-12">
                <Link href="https://app.garixo.com/register">Start Free Trial</Link>
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
              Still Managing Jobs on Paper or Whiteboard?
            </h2>
            <p className="mt-s3 max-w-[860px] text-body text-text-secondary">
              Many small garages lose time and money because repair jobs are not
              tracked in one clear system.
            </p>
            <div className="mt-s6 grid gap-s3 md:grid-cols-2">
              <Card className="p-s4">
                <h3 className="text-h3">Daily pain points</h3>
                <ul className="mt-s2 list-disc space-y-s1 pl-s6 text-small text-text-secondary">
                  <li>Lost repair tickets and unclear handoff</li>
                  <li>No live status across open jobs</li>
                  <li>Mechanics waiting for instructions</li>
                  <li>Customers calling for updates all day</li>
                </ul>
              </Card>
              <Card className="p-s4">
                <h3 className="text-h3">Revenue impact</h3>
                <ul className="mt-s2 list-disc space-y-s1 pl-s6 text-small text-text-secondary">
                  <li>Missed upsells and forgotten line items</li>
                  <li>No clear parts usage per job</li>
                  <li>Delayed invoices and slower cash collection</li>
                  <li>Undercharging due to poor job visibility</li>
                </ul>
                <p className="mt-s3 text-small text-text-secondary">
                  Industry context:{' '}
                  <a
                    href="https://lookupaplate.com/blog/auto-repair-industry-statistics"
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="font-medium text-primary-700 hover:text-primary-800"
                  >
                    auto repair shops lose 10–30% revenue from unbilled labor
                    and parts
                  </a>
                  .
                </p>
              </Card>
            </div>
          </div>
        </section>

        <section className="border-b border-border bg-background-primary py-s12">
          <div className="mx-auto w-full max-w-[980px] px-s4">
            <h2 className="text-[30px] font-semibold leading-tight text-text-primary md:text-[38px]">
              A Simple Garage Work Order Management System That Just Works
            </h2>
            <p className="mt-s3 max-w-[860px] text-body text-text-secondary">
              Garixo gives your team one practical workflow to create, assign,
              track, and complete repair jobs with less confusion and better
              speed.
            </p>

            <div className="mt-s4 grid gap-s3 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="p-s4">
                <h3 className="text-h3">Create work orders in seconds</h3>
                <p className="mt-s2 text-small text-text-secondary">
                  Start jobs quickly with customer, vehicle, and issue details.
                </p>
              </Card>
              <Card className="p-s4">
                <h3 className="text-h3">Track every job stage</h3>
                <p className="mt-s2 text-small text-text-secondary">
                  Pending, in progress, waiting parts, and completed in one
                  view.
                </p>
              </Card>
              <Card className="p-s4">
                <h3 className="text-h3">Invoice faster</h3>
                <p className="mt-s2 text-small text-text-secondary">
                  Move from completed work to invoice with less friction.
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
            <p className="mt-s2 text-small text-text-secondary">
              Helpful reference:{' '}
              <a
                href="https://www.ftc.gov"
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="font-medium text-primary-700 hover:text-primary-800"
              >
                what to include in an auto repair invoice
              </a>
              .
            </p>
            <div className="mt-s4 grid gap-s3 md:grid-cols-3">
              <Card className="p-s4">
                <p className="text-primary text-caption font-semibold">
                  Step 1
                </p>
                <h3 className="mt-s1 text-h3">Create a work order</h3>
                <p className="mt-s2 text-small text-text-secondary">
                  Add customer, vehicle, and repair details.
                </p>
              </Card>
              <Card className="p-s4">
                <p className="text-primary text-caption font-semibold">
                  Step 2
                </p>
                <h3 className="mt-s1 text-h3">Add services and parts</h3>
                <p className="mt-s2 text-small text-text-secondary">
                  Build the job scope and cost in one place.
                </p>
              </Card>
              <Card className="p-s4">
                <p className="text-primary text-caption font-semibold">
                  Step 3
                </p>
                <h3 className="mt-s1 text-h3">Complete job and invoice</h3>
                <p className="mt-s2 text-small text-text-secondary">
                  Finish work, confirm totals, and bill faster.
                </p>
              </Card>
            </div>
          </div>
        </section>

        <section className="border-b border-border bg-background-primary py-s12">
          <div className="mx-auto w-full max-w-[980px] px-s4">
            <h2 className="text-[30px] font-semibold leading-tight text-text-primary md:text-[38px]">
              Turn Every Repair Into Measurable Profit
            </h2>
            <p className="mt-s3 max-w-[860px] text-body text-text-secondary">
              Work orders are where your revenue happens. With clean job data,
              your shop can price better, bill faster, and keep more profit.
            </p>
            <ul className="mt-s4 list-disc space-y-s1 pl-s6 text-small text-text-secondary">
              <li>Track parts cost versus service price clearly</li>
              <li>Avoid undercharging on labor and materials</li>
              <li>Identify high-margin services faster</li>
              <li>Improve repeat business through reliable service history</li>
            </ul>
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
              <li>Quick lube centers</li>
              <li>Mobile mechanics</li>
              <li>Growing multi-bay shops</li>
            </ul>

            <h3 className="mt-s8 text-h2">Related Tools to Run Your Shop</h3>
            <p className="mt-s2 text-small text-text-secondary">
              Connect work orders with your full operation:
            </p>
            <div className="mt-s4 grid gap-s2 md:grid-cols-2">
              <Link
                href="/features/inventory-management"
                className="group flex items-center justify-between rounded-md border border-border bg-surface-default px-s3 py-s3 text-small text-text-primary transition-colors hover:border-primary-300 hover:bg-primary-50"
              >
                <span className="font-medium">
                  Inventory Management Software
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
                <span className="font-medium">Staff Management</span>
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
              Stop Losing Jobs. Start Controlling Your Garage.
            </h2>
            <p className="mx-auto mt-s2 max-w-[720px] text-body text-slate-300">
              Keep every repair organized, improve team speed, and increase
              revenue per job with a simple work order system built for
              independent shops.
            </p>
            <div className="mt-s4">
              <Button
                asChild
                className="h-12 bg-surface-default text-primary-800 hover:bg-primary-50"
              >
                <Link href="https://app.garixo.com/register">
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
