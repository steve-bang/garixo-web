import type { Metadata } from 'next';
import { CircleCheck, CircleX } from 'lucide-react';
import Link from 'next/link';

import { LandingFooter } from '@/components/sections/LandingFooter';
import { LandingHeader } from '@/components/sections/LandingHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export const revalidate = false;

const faqItems = [
  {
    question: 'What is independent dealership service management software?',
    answer:
      'It is a simple system that helps independent used car dealers create service work orders, track parts and labor per vehicle, maintain a service history for every unit, and invoice faster — without the cost or complexity of a franchise DMS.'
  },
  {
    question:
      'Does Garixo work for a Buy Here Pay Here lot that does in-house service?',
    answer:
      'Yes. Garixo is well-suited for BHPH operations that handle their own reconditioning and service work. You can track every job per vehicle, see reconditioning cost per unit, and build a service history that supports your sales process.'
  },
  {
    question:
      'Can I track the full service history for each vehicle on my lot?',
    answer:
      'Yes. Every vehicle in Garixo maintains a complete service timeline — pre-sale inspections, oil changes, brake work, detailing, and any additional repairs. You can pull up the full history for any vehicle in seconds.'
  },
  {
    question:
      'Can Garixo help me document pre-sale inspections for post-sale protection?',
    answer:
      'Yes. You can create a detailed work order for every pre-sale inspection, including notes on each item checked, parts replaced, and tech sign-off. This gives you a timestamped record you can reference if a buyer raises a post-sale concern.'
  },
  {
    question:
      'How does Garixo compare to DMS software like CDK or Reynolds & Reynolds?',
    answer:
      'CDK and Reynolds & Reynolds are enterprise DMS platforms built for franchise dealers at $500–2,000+/month. They include OEM integrations, F&I modules, and enterprise reporting. Garixo is none of that — it is simple service workflow software for independent dealers at $79/month. If you need OEM integration, Garixo is not the right fit. If you need clean service records and fast invoicing without the enterprise price, it is.'
  },
  {
    question: 'Can my service tech and I both use Garixo at the same time?',
    answer:
      'Yes. Multiple team members can access Garixo simultaneously from their own devices. The Starter plan supports up to 5 users. The Growth plan supports up to 12.'
  },
  {
    question: 'Does Garixo track reconditioning costs per vehicle?',
    answer:
      'Yes. Every part and labor hour logged on a work order is linked to the vehicle. You can see the total reconditioning cost for any unit at any point in the process.'
  },
  {
    question: 'How long does setup take for a small independent dealership?',
    answer:
      'Most dealers are running their first work orders within 30 minutes. No implementation team, no training manual, no setup call required. Start the 14-day free trial and see how it fits your operation.'
  }
] as const;

const featureHighlights = [
  {
    title: 'Vehicle Service History Per Unit',
    description:
      'Every vehicle on your lot gets its own service timeline — pre-sale inspection, oil change, brake work, detailing, and any warranty-period repairs.',
    benefit:
      "When a buyer asks 'what has been done to this car,' you open Garixo and show them."
  },
  {
    title: 'Quick Service Jobs',
    description:
      'Create a complete job in under 60 seconds — service type, vehicle, tech assigned, parts used, and labor hours.',
    benefit:
      'Works for a quick oil change or a full pre-sale prep with one record from start to finish.'
  },
  {
    title: 'Parts and Labor Cost Per Vehicle',
    description:
      'Track every part and labor hour per work order so you know the true cost of service work done on each unit.',
    benefit:
      'Know your real reconditioning cost per vehicle and protect your margin.'
  },
  {
    title: 'Service Counter Invoicing',
    description:
      'Turn a completed work order into a clean, itemized invoice in one click.',
    benefit:
      'Faster checkout at the service counter with clear records for every job.'
  },
  {
    title: 'Multi-User Access for Small Teams',
    description:
      'Owner, service manager, and tech can each access Garixo from their own device with role-appropriate permissions.',
    benefit:
      "No more 'I thought you updated that job.' Everyone sees the same status."
  },
  {
    title: 'Customer and Vehicle Database',
    description:
      'Keep a searchable record of every customer, every vehicle, and every service visit.',
    benefit:
      'When a repeat customer returns, you see their full history in seconds.'
  }
] as const;

export const metadata: Metadata = {
  metadataBase: new URL('https://www.garixo.com'),
  title:
    'Dealership Service Department Software — Simple & Affordable | Garixo',
  description:
    'Dealership service department software for faster service lanes. Manage work orders, advisor handoffs, and vehicle history in one workflow. Start free.',
  keywords: [
    'dealership service department software',
    'dealership service management software',
    'dealership work order system',
    'auto dealer service software',
    'service department workflow software',
    'dealer repair management software'
  ],
  alternates: {
    canonical: '/solutions/garage-management-software-for-dealerships'
  },
  robots: {
    index: true,
    follow: true
  },
  openGraph: {
    title:
      'Dealership Service Department Software — Simple & Affordable | Garixo',
    description:
      'Dealership service department software for faster service lanes. Manage work orders, advisor handoffs, and vehicle history in one workflow. Start free.',
    type: 'website',
    url: 'https://www.garixo.com/solutions/garage-management-software-for-dealerships'
  },
  twitter: {
    card: 'summary_large_image',
    title:
      'Dealership Service Department Software — Simple & Affordable | Garixo',
    description:
      'Dealership service department software for faster service lanes. Manage work orders, advisor handoffs, and vehicle history in one workflow. Start free.'
  }
};

export default function DealershipSolutionsPage(): JSX.Element {
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
        name: 'Solutions',
        item: 'https://www.garixo.com/solutions'
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Garage Management Software for Dealerships',
        item: 'https://www.garixo.com/solutions/garage-management-software-for-dealerships'
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
            <p className="inline-flex items-center rounded-full border border-primary-100 bg-primary-50 px-s3 py-s1 text-caption font-semibold text-primary-700">
              Built for Independent dealers and multi-bay service shops
            </p>
            <h1 className="mt-s4 text-[34px] font-bold leading-tight text-text-primary md:text-[52px]">
              Independent Dealership Service Software — Simple Jobs, Vehicle
              History & Faster Billing
            </h1>
            <p className="mx-auto mt-s3 max-w-[820px] text-body text-text-secondary">
              Run your service department without a $500/month DMS. Garixo gives
              independent dealers and growing service shops clean jobs, advisor
              notes, and vehicle history — at a fraction of the cost.
            </p>
            <div className="mt-s6 flex flex-col justify-center gap-s2 sm:flex-row">
              <Button asChild className="h-12">
                <Link href="/auth/sign-up">Start Free Trial</Link>
              </Button>
              <Button asChild variant="secondary" className="h-12">
                <Link href="/pricing">View Pricing</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="bg-background-primary py-s12">
          <div className="mx-auto w-full max-w-[1100px] px-s4">
            <div className="grid gap-s6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div className="space-y-s3">
                <h2 className="text-h2 text-text-primary">
                  Still managing dealership service jobs across spreadsheets?
                </h2>
                <p className="text-body text-text-secondary">
                  When advisors, techs, and parts are not connected in one
                  system, work slows down and customers wait longer.
                </p>
                <ul className="space-y-s2 text-small text-text-secondary">
                  <li>Advisor handoffs lose notes and approvals.</li>
                  <li>Service lane status is hard to see at a glance.</li>
                  <li>
                    Parts usage and warranty notes get split across tools.
                  </li>
                  <li>Billing slows down at the end of the day.</li>
                </ul>
              </div>
              <Card className="space-y-s3 border border-border bg-surface-default p-s4">
                <h3 className="text-h3 text-text-primary">
                  A clear dealership service workflow
                </h3>
                <p className="text-small text-text-secondary">
                  Garixo connects work orders, parts, and invoices in one place
                  so advisors can keep service lines moving.
                </p>
                <Button asChild className="h-11">
                  <Link href="/auth/sign-up">Start in minutes</Link>
                </Button>
              </Card>
            </div>
          </div>
        </section>

        <section className="bg-background-secondary py-s12">
          <div className="mx-auto w-full max-w-[1100px] px-s4">
            <div className="space-y-s3 text-center">
              <h2 className="text-h2 text-text-primary">
                The Service Problems Independent Dealers Know Well
              </h2>
              <p className="mx-auto max-w-[860px] text-body text-text-secondary">
                Independent dealerships run lean. The same person who sells a
                car on Monday might be coordinating service work on Tuesday.
                Without a clean system, service jobs fall through the cracks —
                and that costs you money and reputation.
              </p>
            </div>
            <div className="mt-s6 grid gap-s4 md:grid-cols-2">
              <Card className="space-y-s2 border border-border bg-surface-default p-s4">
                <p className="text-small font-semibold text-text-primary">
                  A customer brings back a car they bought 3 months ago.
                </p>
                <p className="text-small text-text-secondary">
                  They say the issue was there when they bought it. You have no
                  pre-sale inspection record, no photos, and no documentation.
                  You absorb the cost rather than push back without evidence.
                </p>
              </Card>
              <Card className="space-y-s2 border border-border bg-surface-default p-s4">
                <p className="text-small font-semibold text-text-primary">
                  Your service tech finished a job and invoiced it on paper.
                </p>
                <p className="text-small text-text-secondary">
                  Two weeks later, a customer disputes a charge. The parts list
                  is incomplete and labor hours are missing, so you settle for
                  less than you charged.
                </p>
              </Card>
              <Card className="space-y-s2 border border-border bg-surface-default p-s4">
                <p className="text-small font-semibold text-text-primary">
                  A buyer asks: “What service work has been done on this car?”
                </p>
                <p className="text-small text-text-secondary">
                  You search through a filing cabinet and hope the inspection
                  sheet was filed. Half the time you come up empty.
                </p>
              </Card>
              <Card className="space-y-s2 border border-border bg-surface-default p-s4">
                <p className="text-small font-semibold text-text-primary">
                  You are paying $300+/month for dealer software.
                </p>
                <p className="text-small text-text-secondary">
                  Your 4-person operation uses 10% of what it does. The rest is
                  enterprise features for 50-location chains.
                </p>
              </Card>
            </div>
          </div>
        </section>

        <section className="bg-background-primary py-s12">
          <div className="mx-auto w-full max-w-[1100px] px-s4">
            <div className="grid gap-s6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
              <div className="space-y-s3">
                <h2 className="text-h2 text-text-primary">
                  Simple Service Management Built for Independent Dealers — Not
                  Enterprise Chains
                </h2>
                <p className="text-body text-text-secondary">
                  Garixo gives your service operation one clean system for every
                  vehicle that comes through your lot for service or pre-sale
                  preparation. Create a work order in 60 seconds, track every
                  part and labor hour, build a service history for every unit,
                  and invoice cleanly at the counter. Your team does not need a
                  training manual. Your lot does not need an IT department. You
                  just need something that works — today.
                </p>
              </div>
              <Card className="space-y-s3 border border-border bg-surface-default p-s4">
                <h3 className="text-h3 text-text-primary">
                  What your team sees at a glance
                </h3>
                <ul className="space-y-s2 text-small text-text-secondary">
                  <li>Service history per unit, ready for buyers.</li>
                  <li>Parts and labor tracked on every job.</li>
                  <li>Invoices built from real service entries.</li>
                  <li>Clear status without extra admin overhead.</li>
                </ul>
              </Card>
            </div>
          </div>
        </section>

        <section className="bg-surface-default py-s12">
          <div className="mx-auto w-full max-w-[1100px] px-s4">
            <div className="text-center">
              <h2 className="text-h2 text-text-primary">
                Features Built for Independent Dealer Service Operations
              </h2>
              <p className="mx-auto mt-s2 max-w-[760px] text-body text-text-secondary">
                Every feature serves one goal — clean service records, fast
                invoicing, and vehicles that sell with documented history.
              </p>
            </div>
            <div className="mt-s6 grid gap-s4 md:grid-cols-2 xl:grid-cols-3">
              {featureHighlights.map((feature) => (
                <Card key={feature.title} className="space-y-s2 p-s4">
                  <h3 className="text-h3 text-text-primary">{feature.title}</h3>
                  <p className="text-small text-text-secondary">
                    {feature.description}
                  </p>
                  <p className="text-caption font-medium text-primary-700">
                    {feature.benefit}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-background-secondary py-s12">
          <div className="mx-auto w-full max-w-[1000px] px-s4">
            <div className="text-center">
              <h2 className="text-h2 text-text-primary">
                Built for Independent Dealers — Not Franchise Operations
              </h2>
            </div>
            <div className="mt-s6 grid gap-s4 md:grid-cols-2">
              <Card className="space-y-s3 border border-border bg-surface-default p-s4">
                <h3 className="text-h3 text-text-primary">
                  Garixo is the right fit if you are
                </h3>
                <ul className="space-y-s2 text-small text-text-secondary">
                  <li>
                    An independent used car dealer with 1–15 service bays.
                  </li>
                  <li>
                    A Buy Here Pay Here lot doing in-house service and
                    reconditioning.
                  </li>
                  <li>A small dealer group (2–4 locations) without a DMS.</li>
                  <li>
                    A dealer using Excel, paper ROs, or a basic invoicing tool.
                  </li>
                  <li>
                    Tired of paying $300+/month for dealer software you use 10%
                    of.
                  </li>
                </ul>
              </Card>
              <Card className="space-y-s3 border border-border bg-surface-default p-s4">
                <h3 className="text-h3 text-text-primary">
                  Garixo is NOT the right fit for
                </h3>
                <ul className="space-y-s2 text-small text-text-secondary">
                  <li>
                    Franchise dealerships that require OEM DMS integrations
                    (CDK, Reynolds).
                  </li>
                  <li>
                    Large dealer groups (10+ locations) needing enterprise
                    reporting.
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        </section>

        <section className="bg-background-primary py-s12">
          <div className="mx-auto w-full max-w-[1000px] px-s4">
            <div className="grid gap-s6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <Card className="space-y-s3 p-s4">
                <h3 className="text-h3 text-text-primary">How it works</h3>
                <ol className="space-y-s3 text-small text-text-secondary">
                  <li>1. Capture intake details and advisor notes.</li>
                  <li>2. Track status, parts, and warranty context.</li>
                  <li>3. Complete the job and finalize billing.</li>
                </ol>
              </Card>
              <div className="space-y-s3">
                <h2 className="text-h2 text-text-primary">
                  Turn service workflow into clear revenue
                </h2>
                <p className="text-body text-text-secondary">
                  Track parts cost and labor quickly. Know what each job is
                  worth and reduce admin time at the counter.
                </p>
                <div className="flex flex-col gap-s2 sm:flex-row">
                  <Button asChild className="h-11">
                    <Link href="/auth/sign-up">Start Free Trial</Link>
                  </Button>
                  <Button asChild variant="secondary" className="h-11">
                    <Link href="/features/work-orders-management">
                      Job Management Software
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-surface-default py-s12">
          <div className="mx-auto w-full max-w-[980px] px-s4">
            <div className="space-y-s3 text-center">
              <h2 className="text-h2 text-text-primary">
                What Service Operations Look Like for an Independent Dealer
                Using Garixo
              </h2>
            </div>
            <div className="mt-s6 space-y-s4">
              <Card className="space-y-s2 border border-border bg-surface-default p-s4">
                <p className="text-small font-semibold text-text-primary">
                  Monday
                </p>
                <p className="text-small text-text-secondary">
                  A 2021 Honda CR-V comes off the auction. You create a work
                  order in Garixo: oil change, brake inspection, rear wiper, and
                  interior detail. Every item logged with parts cost recorded.
                </p>
              </Card>
              <Card className="space-y-s2 border border-border bg-surface-default p-s4">
                <p className="text-small font-semibold text-text-primary">
                  Wednesday
                </p>
                <p className="text-small text-text-secondary">
                  The CR-V is ready for the lot. The work order is closed. Total
                  reconditioning cost: $284. You price the vehicle knowing your
                  actual all-in cost.
                </p>
              </Card>
              <Card className="space-y-s2 border border-border bg-surface-default p-s4">
                <p className="text-small font-semibold text-text-primary">
                  Friday
                </p>
                <p className="text-small text-text-secondary">
                  A buyer asks what service work has been done. You open Garixo
                  and show the full service record from the week. They see
                  documented care and sign the same day.
                </p>
              </Card>
              <Card className="space-y-s2 border border-border bg-surface-default p-s4">
                <p className="text-small font-semibold text-text-primary">
                  Six weeks later
                </p>
                <p className="text-small text-text-secondary">
                  The buyer calls about a check engine light. The pre-sale
                  inspection shows a clear OBD scan, so you have documentation
                  to back it up.
                </p>
              </Card>
              <Card className="space-y-s2 border border-border bg-surface-default p-s4">
                <p className="text-small font-semibold text-text-primary">
                  End of month
                </p>
                <p className="text-small text-text-secondary">
                  You review the 14 vehicles reconditioned this month. Average
                  reconditioning cost: $310. You spot three units where labor
                  costs were underestimated and adjust pricing for next month.
                </p>
              </Card>
            </div>
          </div>
        </section>

        <section className="bg-surface-default py-s12">
          <div className="mx-auto w-full max-w-[1000px] px-s4">
            <div className="text-center">
              <h2 className="text-h2 text-text-primary">
                Before Garixo vs. After Garixo
              </h2>
            </div>
            <div className="mt-s6 overflow-hidden rounded-xl border border-border bg-surface-default">
              <table className="w-full border-collapse text-left">
                <thead className="bg-surface-hover">
                  <tr>
                    <th className="border-b border-border px-s4 py-s3 text-small font-semibold text-text-primary">
                      <span className="inline-flex items-center gap-s2">
                        <CircleX
                          aria-hidden="true"
                          className="size-4 text-state-error"
                        />
                        Before Garixo
                      </span>
                    </th>
                    <th className="border-b border-border px-s4 py-s3 text-small font-semibold text-text-primary">
                      <span className="inline-flex items-center gap-s2">
                        <CircleCheck
                          aria-hidden="true"
                          className="size-4 text-state-success"
                        />
                        After Garixo
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody className="text-small text-text-secondary">
                  <tr>
                    <td className="border-b border-border px-s4 py-s3">
                      Buyer asks about service history — you search through
                      paper folders.
                    </td>
                    <td className="border-b border-border px-s4 py-s3">
                      Complete service timeline per vehicle — show buyers in 10
                      seconds.
                    </td>
                  </tr>
                  <tr>
                    <td className="border-b border-border px-s4 py-s3">
                      Post-sale dispute with no documentation to back up the
                      pre-sale inspection.
                    </td>
                    <td className="border-b border-border px-s4 py-s3">
                      Full work order record at every stage — documentation when
                      you need it.
                    </td>
                  </tr>
                  <tr>
                    <td className="border-b border-border px-s4 py-s3">
                      Real reconditioning cost per unit is a guess.
                    </td>
                    <td className="border-b border-border px-s4 py-s3">
                      Every part and labor hour tracked per unit — know your
                      real margin.
                    </td>
                  </tr>
                  <tr>
                    <td className="border-b border-border px-s4 py-s3">
                      Service invoices created manually, missing parts or labor.
                    </td>
                    <td className="border-b border-border px-s4 py-s3">
                      Complete invoices auto-built from work order entries —
                      nothing missed.
                    </td>
                  </tr>
                  <tr>
                    <td className="px-s4 py-s3">
                      Paying $300+/mo for dealer software using 10% of its
                      features.
                    </td>
                    <td className="px-s4 py-s3">
                      Full service workflow for $79/mo — pay for what you
                      actually use.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="bg-background-primary py-s12">
          <div className="mx-auto w-full max-w-[980px] px-s4">
            <Card className="space-y-s4 border border-border bg-surface-default p-s6 text-center">
              <h2 className="text-h2 text-text-primary">
                Simple pricing for independent dealerships
              </h2>
              <div className="grid gap-s4 md:grid-cols-2">
                <div className="rounded-lg border border-border bg-background-primary p-s4 text-left">
                  <p className="text-caption font-semibold uppercase text-primary-700">
                    Starter
                  </p>
                  <p className="mt-s2 text-h3 text-text-primary">$79/month</p>
                  <p className="text-small text-text-secondary">
                    Up to 5 users
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-background-primary p-s4 text-left">
                  <p className="text-caption font-semibold uppercase text-primary-700">
                    Growth
                  </p>
                  <p className="mt-s2 text-h3 text-text-primary">$129/month</p>
                  <p className="text-small text-text-secondary">
                    Up to 12 users + advanced reports
                  </p>
                </div>
              </div>
              <p className="text-small text-text-secondary">
                14-day free trial — no credit card required. No annual contract.
                Cancel anytime. Built for lean teams, not enterprise chains.
              </p>
              <div className="flex flex-col justify-center gap-s2 sm:flex-row">
                <Button asChild className="h-12">
                  <Link href="/auth/sign-up">Start Free Trial</Link>
                </Button>
                <Button asChild variant="secondary" className="h-12">
                  <Link href="/pricing">View Pricing</Link>
                </Button>
              </div>
            </Card>
          </div>
        </section>

        <section className="bg-surface-default py-s12">
          <div className="mx-auto w-full max-w-[980px] px-s4">
            <div className="text-center">
              <h2 className="text-h2 text-text-primary">FAQ</h2>
              <p className="mt-s2 text-small text-text-secondary">
                Common questions from dealership service teams.
              </p>
            </div>
            <div className="mt-s6 space-y-s3">
              {faqItems.map((faq) => (
                <Card key={faq.question} className="space-y-s2 p-s4">
                  <h3 className="text-h3 text-text-primary">{faq.question}</h3>
                  <p className="text-small text-text-secondary">{faq.answer}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-background-primary py-s12">
          <div className="mx-auto w-full max-w-[980px] px-s4 text-center">
            <h2 className="text-h2 text-text-primary">
              Ready to modernize dealership service?
            </h2>
            <p className="mx-auto mt-s3 max-w-[720px] text-body text-text-secondary">
              Start your free trial and simplify service workflow in minutes.
            </p>
            <div className="mt-s6 flex flex-col justify-center gap-s2 sm:flex-row">
              <Button asChild className="h-12">
                <Link href="/auth/sign-up">Start Free Trial</Link>
              </Button>
              <Button asChild variant="secondary" className="h-12">
                <Link href="/features/inventory-management">
                  Inventory Management Software
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="bg-surface-default py-s10">
          <div className="mx-auto w-full max-w-[980px] px-s4 text-center">
            <p className="text-small font-medium text-text-secondary">
              Explore related resources:
            </p>
            <div className="mt-s3 flex flex-col items-center justify-center gap-s2 text-small sm:flex-row sm:flex-wrap">
              <Link
                href="/features/customers-management"
                className="font-medium text-primary-700 underline-offset-2 hover:underline"
              >
                vehicle service history tracking
              </Link>
              <span className="hidden text-text-muted sm:inline">•</span>
              <Link
                href="/features/inventory-management"
                className="font-medium text-primary-700 underline-offset-2 hover:underline"
              >
                parts inventory management
              </Link>
              <span className="hidden text-text-muted sm:inline">•</span>
              <Link
                href="/features/work-orders-management"
                className="font-medium text-primary-700 underline-offset-2 hover:underline"
              >
                work order management system
              </Link>
              <span className="hidden text-text-muted sm:inline">•</span>
              <Link
                href="/pricing"
                className="font-medium text-primary-700 underline-offset-2 hover:underline"
              >
                Garixo pricing — from $79/mo
              </Link>
              <span className="hidden text-text-muted sm:inline">•</span>
              <Link
                href="/tools/auto-repair-shop-profit-calculator"
                className="font-medium text-primary-700 underline-offset-2 hover:underline"
              >
                auto repair shop profit calculator
              </Link>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </>
  );
}
