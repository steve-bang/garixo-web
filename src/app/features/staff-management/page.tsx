import type { Metadata } from 'next';
import Link from 'next/link';

import { LandingFooter } from '@/components/sections/LandingFooter';
import { LandingHeader } from '@/components/sections/LandingHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export const revalidate = false;

const faqItems = [
  {
    question: 'What is auto repair staff management software?',
    answer:
      'Auto repair staff management software helps garages manage team profiles, job assignments, workload, and staff status in one operational view.'
  },
  {
    question: 'Can I assign mechanics to work orders?',
    answer:
      'Yes. Garixo supports assigning staff to work orders and keeping assignment details clear in daily workflow.'
  },
  {
    question: 'How does staff tracking improve productivity?',
    answer:
      'It reduces idle time, balances workload, and helps owners identify blocked or overloaded team members faster.'
  },
  {
    question: 'Is this suitable for small garages?',
    answer:
      'Yes. Garixo is built for independent shops with small teams and non-technical owners.'
  },
  {
    question: 'Can I control staff permissions?',
    answer:
      'Yes. Garixo supports role-based access patterns for owner, manager, and staff workflows.'
  },
  {
    question: 'Does Garixo track performance?',
    answer:
      'Garixo provides practical operational visibility such as active jobs and completed jobs to support team performance reviews.'
  },
  {
    question: 'Can I monitor staff status and workload?',
    answer:
      'Yes. You can monitor team status and workload indicators like active, free, and overloaded staff.'
  },
  {
    question: 'Is this a payroll or HR system?',
    answer:
      'No. Garixo focuses on garage operations and team productivity, not payroll or enterprise HR features.'
  }
] as const;

const coreFeatures = [
  {
    title: 'Staff Profile Management',
    description: 'Add and maintain team member profiles in one place.',
    benefit: 'Keep your team organized and ready to dispatch.'
  },
  {
    title: 'Role and Permission Control',
    description:
      'Use role-based structure for owner, manager, and staff workflows.',
    benefit: 'Reduce access mistakes and improve accountability.'
  },
  {
    title: 'Assign Mechanics to Work Orders',
    description: 'Assign the right mechanic to each job with clear ownership.',
    benefit: 'Reduce confusion and speed up job start time.'
  },
  {
    title: 'Real-Time Job Assignment Tracking',
    description: 'See who is assigned and how job flow is progressing.',
    benefit: 'Avoid missed handoffs during busy hours.'
  },
  {
    title: 'Workload Visibility',
    description:
      'Monitor team capacity with active, free, and overloaded indicators.',
    benefit: 'Balance workload for faster turnaround.'
  },
  {
    title: 'Status Monitoring',
    description: 'Track staff status such as active, on leave, or inactive.',
    benefit: 'Plan shifts and assignments with better clarity.'
  },
  {
    title: 'Performance Overview',
    description: 'Review practical output context including completed jobs.',
    benefit: 'Coach performance with clear daily signals.'
  },
  {
    title: 'Operational Activity Context',
    description: 'Keep assignment and staff changes visible in your workflow.',
    benefit: 'Improve consistency across your whole team.'
  }
] as const;

export const metadata: Metadata = {
  metadataBase: new URL('https://www.garixo.com'),
  title:
    'Mechanic Staff Management Software — Assign Jobs & Track Workload | Garixo',
  description:
    'Mechanic staff management software for small garages. Assign jobs clearly, track who is free or overloaded, and keep your whole team productive daily.',
  keywords: [
    'mechanic staff management software',
    'garage employee management system',
    'mechanic staff tracking software',
    'auto shop employee management software',
    'assign mechanics to work orders',
    'track mechanic performance',
    'garage team management software',
    'auto shop staff tracking',
    'small auto shop employee system',
    'repair shop productivity tracking'
  ],
  alternates: {
    canonical: '/features/staff-management'
  },
  robots: {
    index: true,
    follow: true
  },
  openGraph: {
    title:
      'Mechanic Staff Management Software — Assign Jobs & Track Workload | Garixo',
    description:
      'Mechanic staff management software for small garages. Assign jobs clearly, track who is free or overloaded, and keep your whole team productive daily.',
    type: 'website',
    url: 'https://www.garixo.com/features/staff-management'
  },
  twitter: {
    card: 'summary_large_image',
    title:
      'Mechanic Staff Management Software — Assign Jobs & Track Workload | Garixo',
    description:
      'Mechanic staff management software for small garages. Assign jobs clearly, track who is free or overloaded, and keep your whole team productive daily.'
  }
};

export default function StaffManagementFeaturePage(): JSX.Element {
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
        name: 'Staff Management',
        item: 'https://www.garixo.com/features/staff-management'
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
              Mechanic Staff Management Software — Assign Jobs, Track Workload
              Daily
            </h1>
            <p className="mx-auto mt-s3 max-w-[820px] text-body text-text-secondary">
              Assign jobs clearly, track team productivity, and improve daily
              execution with a garage employee management system built for small
              owner-operated shops.
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
              Is Your Garage Team Working at Full Capacity?
            </h2>
            <p className="mt-s3 max-w-[860px] text-body text-text-secondary">
              Without clear staff visibility, good technicians lose time and
              jobs slow down.
            </p>
            <p className="mt-s2 text-small text-text-secondary">
              Industry context:{' '}
              <a
                href="https://www.ratchetandwrench.com"
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="font-medium text-primary-700 hover:text-primary-800"
              >
                average auto repair shop productivity rate is 70–85%
              </a>
              .
            </p>
            <div className="mt-s6 grid gap-s3 md:grid-cols-2">
              <Card className="p-s4">
                <h3 className="text-h3">Operational pain</h3>
                <ul className="mt-s2 list-disc space-y-s1 pl-s6 text-small text-text-secondary">
                  <li>No clear assignment ownership per job</li>
                  <li>Mechanics asking what to do next</li>
                  <li>No quick view of team productivity</li>
                  <li>Job delays caused by handoff confusion</li>
                </ul>
              </Card>
              <Card className="p-s4">
                <h3 className="text-h3">Business impact</h3>
                <ul className="mt-s2 list-disc space-y-s1 pl-s6 text-small text-text-secondary">
                  <li>Lower daily completed jobs</li>
                  <li>More idle time across the team</li>
                  <li>Reduced service throughput</li>
                  <li>Less predictable daily revenue</li>
                </ul>
              </Card>
            </div>
          </div>
        </section>

        <section className="border-b border-border bg-background-primary py-s12">
          <div className="mx-auto w-full max-w-[980px] px-s4">
            <h2 className="text-[30px] font-semibold leading-tight text-text-primary md:text-[38px]">
              Your Garage Team at a Glance
            </h2>
            <p className="mt-s3 max-w-[860px] text-body text-text-secondary">
              Garixo gives owners one practical team view to run operations with
              less confusion and faster decision-making.
            </p>
            <div className="mt-s4 grid gap-s3 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="p-s4">
                <p className="text-caption text-text-muted">Total Staff</p>
                <p className="mt-s1 text-h2 text-text-primary">8</p>
                <p className="mt-s1 text-small text-text-secondary">
                  Full team visibility
                </p>
              </Card>
              <Card className="p-s4">
                <p className="text-caption text-text-muted">Active Today</p>
                <p className="mt-s1 text-h2 text-success-700">6</p>
                <p className="mt-s1 text-small text-text-secondary">
                  Ready on current jobs
                </p>
              </Card>
              <Card className="p-s4">
                <p className="text-caption text-text-muted">Free Staff</p>
                <p className="mt-s1 text-h2 text-primary-700">2</p>
                <p className="mt-s1 text-small text-text-secondary">
                  Available for new jobs
                </p>
              </Card>
              <Card className="p-s4">
                <p className="text-caption text-text-muted">Overloaded</p>
                <p className="mt-s1 text-h2 text-warning-700">1</p>
                <p className="mt-s1 text-small text-text-secondary">
                  Needs workload rebalance
                </p>
              </Card>
            </div>
            <div className="mt-s4 rounded-md border border-border bg-background-secondary p-s4">
              <ul className="list-disc space-y-s1 pl-s6 text-small text-text-secondary">
                <li>See all staff members in one place</li>
                <li>Review assigned work orders quickly</li>
                <li>Track status and workload distribution</li>
                <li>Rebalance jobs before delays happen</li>
              </ul>
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
                <h3 className="mt-s1 text-h3">Add your team members</h3>
                <p className="mt-s2 text-small text-text-secondary">
                  Create staff profiles with role and contact details.
                </p>
              </Card>
              <Card className="p-s4">
                <p className="text-primary text-caption font-semibold">
                  Step 2
                </p>
                <h3 className="mt-s1 text-h3">Assign jobs in work orders</h3>
                <p className="mt-s2 text-small text-text-secondary">
                  Set clear ownership for every active repair job.
                </p>
              </Card>
              <Card className="p-s4">
                <p className="text-primary text-caption font-semibold">
                  Step 3
                </p>
                <h3 className="mt-s1 text-h3">Track output and workload</h3>
                <p className="mt-s2 text-small text-text-secondary">
                  Use daily workload and completion context to optimize team
                  flow.
                </p>
              </Card>
            </div>
          </div>
        </section>

        <section className="border-b border-border bg-background-primary py-s12">
          <div className="mx-auto w-full max-w-[980px] px-s4">
            <h2 className="text-[30px] font-semibold leading-tight text-text-primary md:text-[38px]">
              More Organization. More Completed Jobs. More Revenue.
            </h2>
            <p className="mt-s3 max-w-[860px] text-body text-text-secondary">
              Better staff coordination improves throughput. When assignments
              are clear, your team finishes more jobs with less idle time and
              fewer delays.
            </p>
            <ul className="mt-s4 list-disc space-y-s1 pl-s6 text-small text-text-secondary">
              <li>Reduce idle time across mechanics</li>
              <li>Improve daily job turnaround speed</li>
              <li>Increase daily completed job capacity</li>
              <li>Avoid miscommunication during handoffs</li>
              <li>Track team output to support revenue planning</li>
            </ul>
          </div>
        </section>

        <section className="border-b border-border bg-background-primary py-s12">
          <div className="mx-auto w-full max-w-[980px] px-s4">
            <h2 className="text-[30px] font-semibold leading-tight text-text-primary md:text-[38px]">
              Who It&apos;s For
            </h2>
            <ul className="mt-s4 grid gap-s2 text-small text-text-secondary sm:grid-cols-2 lg:grid-cols-3">
              <li>2-3 bay garages</li>
              <li>Growing 5-10 mechanic shops</li>
              <li>Tire shops</li>
              <li>Quick lube centers</li>
              <li>Expanding independent garages</li>
            </ul>

            <h3 className="mt-s8 text-h2">Related Tools to Run Your Shop</h3>
            <p className="mt-s2 text-small text-text-secondary">
              Connect staff workflow with your full garage system:
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
                <span className="font-medium">Customer Management System</span>
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
              Take Control of Your Garage Team Today
            </h2>
            <p className="mx-auto mt-s2 max-w-[720px] text-body text-slate-300">
              Keep assignments clear, improve productivity, and support daily
              revenue growth with a simple staff management workflow.
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
