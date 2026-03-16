import type { Metadata } from 'next';
import Link from 'next/link';

import { LandingFooter } from '@/components/sections/LandingFooter';
import { LandingHeader } from '@/components/sections/LandingHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export const revalidate = false;

const faqItems = [
  {
    question: 'What is auto body shop management software?',
    answer:
      'Auto body shop management software is a digital system that helps collision repair shops create and track repair jobs through each stage, manage parts ordering, document damage at intake, and generate accurate invoices at delivery — all without paper ROs or spreadsheets.'
  },
  {
    question:
      'Can Garixo track a repair job through multiple stages like body, paint, and assembly?',
    answer:
      'Yes. You can track every job through custom repair stages from intake to delivery. Each stage is visible to the whole team so everyone knows where every car stands without a morning briefing.'
  },
  {
    question: 'Can I attach damage notes and intake details to a work order?',
    answer:
      'Yes. You can add detailed notes, damage descriptions, and customer instructions directly to the work order at check-in. These notes follow the job through every stage and appear on the final invoice.'
  },
  {
    question: 'How does Garixo handle parts that have a lead time of 3–7 days?',
    answer:
      'You can log ordered parts, expected arrival dates, and the job they belong to directly in the work order. This lets you schedule tech time only after parts are confirmed as received — so you stop assigning bays to jobs that cannot move yet.'
  },
  {
    question:
      'How does Garixo compare to CCC ONE or Mitchell Connect for a small body shop?',
    answer:
      'CCC ONE and Mitchell Connect are enterprise platforms built for large multi-shop operators at $200–400+/month. Garixo is designed for independent body shops with 1–4 bays that need clean job tracking and fast invoicing without a six-month implementation process. At $79/month, the difference in price alone covers the software cost many times over.'
  },
  {
    question:
      'Does Garixo support insurance documentation or supplement requests?',
    answer:
      'Garixo does not have built-in insurance claim integration, but it gives you a complete, itemized job record — parts, labor, notes, and stage history — that you can use to support supplement requests and document repairs for insurance purposes.'
  },
  {
    question: 'Is Garixo suitable for a 2-bay independent body shop?',
    answer:
      'Yes. Garixo is built for exactly this — small independent shops with lean teams that need a clear workflow without the cost or complexity of enterprise software.'
  },
  {
    question: 'How quickly can a body shop get started with Garixo?',
    answer:
      'Most independent shops are creating their first repair work orders within 30 minutes of signing up. The 14-day free trial requires no credit card and no setup call.'
  }
] as const;

const featureHighlights = [
  {
    title: 'Multi-Stage Repair Job Tracking',
    description:
      'Track every collision job through clear stages: Intake → Parts Ordered → Body Work → Paint → Assembly → QC → Ready for Delivery.',
    benefit:
      'Everyone sees the current stage, and bottlenecks surface before they cause delays.'
  },
  {
    title: 'Intake Notes and Damage Documentation',
    description:
      'Capture damage details, customer instructions, and pre-existing conditions at check-in.',
    benefit:
      'Every job starts with a complete record that follows the car through the shop.'
  },
  {
    title: 'Parts Lead Time Tracking',
    description:
      'Log ordered parts, supplier, expected arrival date, and link them to the repair stage that needs them.',
    benefit: 'Avoid scheduling tech time on jobs that cannot move forward yet.'
  },
  {
    title: 'Repair Job Cost Tracking',
    description:
      'Capture every part, material, and labor hour as work progresses, not after the fact.',
    benefit:
      'Close every repair with accurate cost-to-revenue visibility before delivery.'
  },
  {
    title: 'Active Repair Job Dashboard',
    description:
      'See all active jobs, their current stage, days in shop, and tech assignment in one view.',
    benefit: 'Know where every car stands without a morning briefing.'
  },
  {
    title: 'Clean Delivery Invoices',
    description:
      "Generate an itemized invoice the moment a job hits 'Ready for Delivery.'",
    benefit:
      'Present a professional invoice at pickup without last-minute scrambling.'
  }
] as const;

export const metadata: Metadata = {
  metadataBase: new URL('https://www.garixo.com'),
  title:
    'Auto Body Shop Management Software — Repair Workflow & Parts | Garixo',
  description:
    'Auto body shop management software for collision repair teams. Organize work orders, track parts, invoice faster. Simple setup, no enterprise complexity.',
  keywords: [
    'auto body shop management software',
    'collision repair shop software',
    'auto body work order system',
    'auto body shop workflow software',
    'small auto body shop software'
  ],
  alternates: {
    canonical: '/solutions/garage-management-software-for-auto-body-shops'
  },
  robots: {
    index: true,
    follow: true
  },
  openGraph: {
    title:
      'Auto Body Shop Management Software — Repair Workflow & Parts | Garixo',
    description:
      'Auto body shop management software for collision repair teams. Organize work orders, track parts, invoice faster. Simple setup, no enterprise complexity.',
    type: 'website',
    url: 'https://www.garixo.com/solutions/garage-management-software-for-auto-body-shops'
  },
  twitter: {
    card: 'summary_large_image',
    title:
      'Auto Body Shop Management Software — Repair Workflow & Parts | Garixo',
    description:
      'Auto body shop management software for collision repair teams. Organize work orders, track parts, invoice faster. Simple setup, no enterprise complexity.'
  }
};

export default function AutoBodyShopSolutionsPage(): JSX.Element {
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
        name: 'Garage Management Software for Auto Body Shops',
        item: 'https://www.garixo.com/solutions/garage-management-software-for-auto-body-shops'
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
              Built for Auto Body Shops
            </p>
            <h1 className="mt-s4 text-[34px] font-bold leading-tight text-text-primary md:text-[52px]">
              Auto Body Shop Management Software — Organize Multi-Day Repairs
              from Intake to Delivery
            </h1>
            <p className="mx-auto mt-s3 max-w-[820px] text-body text-text-secondary">
              Keep collision repairs organized with stage tracking, photo
              documentation, and clear parts decisions. Garixo helps body shops
              stay on schedule, manage supplements, and deliver repairs faster.
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
                  Still managing collision repairs on paper?
                </h2>
                <p className="text-body text-text-secondary">
                  Auto body repairs involve many steps and moving parts. When
                  jobs and parts are tracked separately, delays and mistakes
                  increase.
                </p>
                <ul className="space-y-s2 text-small text-text-secondary">
                  <li>
                    Teardown, body work, paint, and reassembly fall out of sync
                    without a clear stage tracker.
                  </li>
                  <li>
                    OEM vs. aftermarket parts decisions get lost across
                    insurance jobs.
                  </li>
                  <li>
                    Supplemental parts and labor updates are hard to track
                    mid-repair.
                  </li>
                  <li>
                    Photo documentation is scattered, slowing approvals and
                    delivery.
                  </li>
                </ul>
              </div>
              <Card className="space-y-s3 border border-border bg-surface-default p-s4">
                <h3 className="text-h3 text-text-primary">
                  A clear auto body workflow in one place
                </h3>
                <p className="text-small text-text-secondary">
                  Garixo connects repair work orders, parts, and invoices in one
                  simple workflow so your team can stay focused on the repair.
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
                Why Collision Repairs Are Hard to Manage Without the Right
                System
              </h2>
              <p className="mx-auto max-w-[860px] text-body text-text-secondary">
                Auto body repair is different from every other shop type. Jobs
                run for days, not hours. Parts have lead times. Customers call
                every day for updates. Margin lives or dies on whether every
                part, every labor hour, and every supplement gets captured.
              </p>
            </div>

            <div className="mt-s6 grid gap-s4 md:grid-cols-2">
              <Card className="space-y-s2 border border-border bg-surface-default p-s4">
                <p className="text-small font-semibold text-text-primary">
                  A customer’s car has been in your shop for 5 days.
                </p>
                <p className="text-small text-text-secondary">
                  They call for a status update. You stop a paint job, dig
                  through paper ROs, and guess. They leave a 3-star review that
                  night.
                </p>
              </Card>
              <Card className="space-y-s2 border border-border bg-surface-default p-s4">
                <p className="text-small font-semibold text-text-primary">
                  Your parts for a bumper repair are 3 days late.
                </p>
                <p className="text-small text-text-secondary">
                  The tech moves to another job. By day 5 no one remembers which
                  car was waiting, and the customer gets a surprise delay call.
                </p>
              </Card>
              <Card className="space-y-s2 border border-border bg-surface-default p-s4">
                <p className="text-small font-semibold text-text-primary">
                  A supplement request takes 30 extra minutes per job.
                </p>
                <p className="text-small text-text-secondary">
                  Your original estimate is on a sticky note. The adjuster wants
                  itemized documentation. You piece it together from memory and
                  texts every time.
                </p>
              </Card>
              <Card className="space-y-s2 border border-border bg-surface-default p-s4">
                <p className="text-small font-semibold text-text-primary">
                  Your invoice at delivery is wrong.
                </p>
                <p className="text-small text-text-secondary">
                  Extra parts were ordered mid-repair but never added to the
                  ticket. A $280 door molding disappears from billing.
                </p>
              </Card>
              <Card className="space-y-s2 border border-border bg-surface-default p-s4 md:col-span-2">
                <p className="text-small font-semibold text-text-primary">
                  Enterprise shop software costs too much.
                </p>
                <p className="text-small text-text-secondary">
                  CCC ONE, Mitchell Connect, and Audatex are built for large MSO
                  chains at $200–$400+/mo. A 2-bay independent body shop does
                  not need — or want — that complexity.
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
                  One Workflow for Every Stage of a Collision Repair
                </h2>
                <p className="text-body text-text-secondary">
                  Garixo gives your team one place to run every active repair
                  job from intake to delivery — without the overhead of
                  enterprise software. Create the job in 60 seconds, track parts
                  ordered and parts arrived, move through each repair stage,
                  attach intake notes, and close with a clean invoice. Every
                  person on your team sees the same current status. No more
                  morning briefings to align on what is done and what is
                  waiting.
                </p>
              </div>
              <Card className="space-y-s3 border border-border bg-surface-default p-s4">
                <h3 className="text-h3 text-text-primary">
                  What your team sees at a glance
                </h3>
                <ul className="space-y-s2 text-small text-text-secondary">
                  <li>Live stage status for every active vehicle.</li>
                  <li>Parts ordered vs. parts arrived tracking.</li>
                  <li>Photo notes tied to each repair stage.</li>
                  <li>One clean invoice at delivery.</li>
                </ul>
              </Card>
            </div>
          </div>
        </section>

        <section className="bg-surface-default py-s12">
          <div className="mx-auto w-full max-w-[1100px] px-s4">
            <div className="grid gap-s6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
              <div className="space-y-s3">
                <h2 className="text-h2 text-text-primary">
                  Insurance-ready documentation without the chaos
                </h2>
                <p className="text-body text-text-secondary">
                  Keep claim-related details together so approvals and
                  supplements do not slow down delivery. Every stage, photo, and
                  part decision lives inside the repair order for clean
                  documentation.
                </p>
                <ul className="space-y-s2 text-small text-text-secondary">
                  <li>All photos and notes tied to the exact repair stage.</li>
                  <li>Supplements recorded with context and timestamps.</li>
                  <li>Parts decisions documented for adjuster clarity.</li>
                </ul>
              </div>
              <div className="grid gap-s3">
                <Card className="space-y-s2 border border-border bg-surface-default p-s4">
                  <p className="text-caption font-semibold uppercase tracking-wide text-primary-700">
                    Photo & Note Timeline
                  </p>
                  <p className="text-small text-text-secondary">
                    Store documentation by repair stage so everyone sees the
                    same evidence.
                  </p>
                </Card>
                <Card className="space-y-s2 border border-border bg-surface-default p-s4">
                  <p className="text-caption font-semibold uppercase tracking-wide text-primary-700">
                    Supplement Tracking
                  </p>
                  <p className="text-small text-text-secondary">
                    Add parts and labor updates mid-repair without losing the
                    original estimate.
                  </p>
                </Card>
                <Card className="space-y-s2 border border-border bg-surface-default p-s4">
                  <p className="text-caption font-semibold uppercase tracking-wide text-primary-700">
                    OEM vs. Aftermarket
                  </p>
                  <p className="text-small text-text-secondary">
                    Track part decisions clearly for insurers and customers.
                  </p>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-surface-default py-s12">
          <div className="mx-auto w-full max-w-[1100px] px-s4">
            <div className="text-center">
              <h2 className="text-h2 text-text-primary">
                Features Built for Multi-Day Collision Repair Workflow
              </h2>
              <p className="mx-auto mt-s2 max-w-[760px] text-body text-text-secondary">
                Designed for independent body shops managing 5–25 active repairs
                at a time — not for large MSO chains with enterprise IT budgets.
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

        <section className="bg-background-primary py-s12">
          <div className="mx-auto w-full max-w-[980px] px-s4">
            <Card className="space-y-s4 border border-border bg-surface-default p-s6">
              <p className="text-caption font-semibold uppercase tracking-wide text-primary-700">
                Competitive Positioning
              </p>
              <h2 className="text-h2 text-text-primary">
                Not CCC ONE. Not Mitchell. Just Simple Collision Workflow at
                $79/mo.
              </h2>
              <div className="space-y-s3 text-body text-text-secondary">
                <p>
                  Enterprise collision software was built for large multi-shop
                  operators. CCC ONE starts at $300+/month. Mitchell Connect
                  requires annual contracts and onboarding teams. If you run an
                  independent body shop with 1–4 bays, you do not need a
                  platform designed for 50-location MSO chains.
                </p>
                <p>
                  Garixo gives you the workflow that matters — job tracking,
                  parts management, and clean invoicing — without the enterprise
                  price tag, the six-month setup, or the training manual nobody
                  reads.
                </p>
                <p className="font-semibold text-text-primary">
                  Independent. Affordable. Ready in 30 minutes.
                </p>
              </div>
            </Card>
          </div>
        </section>

        <section className="bg-surface-default py-s12">
          <div className="mx-auto w-full max-w-[1000px] px-s4">
            <div className="text-center">
              <h2 className="text-h2 text-text-primary">
                Before and After Garixo
              </h2>
              <p className="mt-s2 text-small text-text-secondary">
                See the day-to-day difference when your collision workflow is
                tracked in one place.
              </p>
            </div>
            <div className="mt-s6 overflow-hidden rounded-xl border border-border bg-surface-default">
              <table className="w-full border-collapse text-left">
                <thead className="bg-surface-hover">
                  <tr>
                    <th className="border-b border-border px-s4 py-s3 text-small font-semibold text-text-primary">
                      ❌ Before Garixo
                    </th>
                    <th className="border-b border-border px-s4 py-s3 text-small font-semibold text-text-primary">
                      ✅ After Garixo
                    </th>
                  </tr>
                </thead>
                <tbody className="text-small text-text-secondary">
                  <tr>
                    <td className="border-b border-border px-s4 py-s3">
                      Customer calls daily for status — you stop work to answer
                      and give a vague update.
                    </td>
                    <td className="border-b border-border px-s4 py-s3">
                      Accurate status available instantly — real answers in
                      under 10 seconds.
                    </td>
                  </tr>
                  <tr>
                    <td className="border-b border-border px-s4 py-s3">
                      Parts delays discovered only when a tech is already
                      scheduled for that job.
                    </td>
                    <td className="border-b border-border px-s4 py-s3">
                      Parts lead time tracked per job — schedule tech time after
                      parts are confirmed.
                    </td>
                  </tr>
                  <tr>
                    <td className="border-b border-border px-s4 py-s3">
                      Supplement requests pieced together from sticky notes and
                      memory.
                    </td>
                    <td className="border-b border-border px-s4 py-s3">
                      Complete documentation captured at every stage for clean
                      supplement support.
                    </td>
                  </tr>
                  <tr>
                    <td className="border-b border-border px-s4 py-s3">
                      Additional parts and labor missed on the invoice at
                      delivery.
                    </td>
                    <td className="border-b border-border px-s4 py-s3">
                      Every part and labor hour logged as work progresses — zero
                      missed line items.
                    </td>
                  </tr>
                  <tr>
                    <td className="px-s4 py-s3">
                      Paying $300+/mo for enterprise software you never use.
                    </td>
                    <td className="px-s4 py-s3">
                      Full collision workflow at $79/mo — no enterprise
                      overhead.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="bg-background-primary py-s12">
          <div className="mx-auto w-full max-w-[1000px] px-s4">
            <div className="grid gap-s6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <Card className="space-y-s3 p-s4">
                <h3 className="text-h3 text-text-primary">How it works</h3>
                <ol className="space-y-s3 text-small text-text-secondary">
                  <li>
                    1. Create the repair order and capture intake details.
                  </li>
                  <li>
                    2. Track stages, parts, and supplements as work progresses.
                  </li>
                  <li>3. Complete the job and send the invoice.</li>
                </ol>
              </Card>
              <div className="space-y-s3">
                <h2 className="text-h2 text-text-primary">
                  Turn collision repairs into clear revenue
                </h2>
                <p className="text-body text-text-secondary">
                  Track parts cost and labor quickly. Know what each repair is
                  worth and reduce admin time at the front desk.
                </p>
                <div className="flex flex-col gap-s2 sm:flex-row">
                  <Button asChild className="h-11">
                    <Link href="/auth/sign-up">Start Free Trial</Link>
                  </Button>
                  <Button asChild variant="secondary" className="h-11">
                    <Link href="/features/work-orders-management">
                      Work Order Management Software
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
                What Running a Busy Body Shop Looks Like With Garixo
              </h2>
              <p className="mx-auto max-w-[780px] text-body text-text-secondary">
                A clear example of how a multi-day collision repair moves
                through intake, parts, and delivery when your team shares one
                workflow.
              </p>
            </div>
            <div className="mt-s6 space-y-s4">
              <Card className="space-y-s2 border border-border bg-surface-default p-s4">
                <p className="text-small font-semibold text-text-primary">
                  Monday 8:00am
                </p>
                <p className="text-small text-text-secondary">
                  A Toyota Camry comes in for front-end collision repair. You
                  create the work order in Garixo in 60 seconds. You attach
                  intake notes: cracked bumper cover, bent hood, right headlight
                  needs replacement. You log three parts on order from the
                  dealer — expected Thursday.
                </p>
              </Card>
              <Card className="space-y-s2 border border-border bg-surface-default p-s4">
                <p className="text-small font-semibold text-text-primary">
                  Monday 8:05am
                </p>
                <p className="text-small text-text-secondary">
                  The customer asks when her car will be ready. You tell her:
                  parts arrive Thursday, body work Friday, paint Monday,
                  delivery Tuesday. She gets a real answer and stops calling
                  every day.
                </p>
              </Card>
              <Card className="space-y-s2 border border-border bg-surface-default p-s4">
                <p className="text-small font-semibold text-text-primary">
                  Thursday 2:00pm
                </p>
                <p className="text-small text-text-secondary">
                  Parts arrive. You update the work order in Garixo: parts
                  received. The tech gets the job assigned. Bay 1 is now
                  scheduled for Friday morning. No one had to ask who was doing
                  it or when.
                </p>
              </Card>
              <Card className="space-y-s2 border border-border bg-surface-default p-s4">
                <p className="text-small font-semibold text-text-primary">
                  Friday
                </p>
                <p className="text-small text-text-secondary">
                  Body work is done. The stage moves to Paint. You add two more
                  line items discovered during teardown: a cracked inner bracket
                  and additional clips. They are captured in the work order
                  immediately. Nothing is forgotten.
                </p>
              </Card>
              <Card className="space-y-s2 border border-border bg-surface-default p-s4">
                <p className="text-small font-semibold text-text-primary">
                  Tuesday
                </p>
                <p className="text-small text-text-secondary">
                  The car is ready. You open the work order. The invoice builds
                  itself from every part and labor entry made throughout the
                  job. You review it in 2 minutes. The customer picks up, pays,
                  done — no surprises or missing charges.
                </p>
              </Card>
            </div>
          </div>
        </section>

        <section className="bg-surface-default py-s12">
          <div className="mx-auto w-full max-w-[980px] px-s4">
            <Card className="space-y-s4 border border-border bg-surface-default p-s6">
              <p className="text-caption font-semibold uppercase tracking-wide text-primary-700">
                Trusted by independent body shops
              </p>
              <p className="text-h3 text-text-primary">
                “We cut our approval delays by keeping photos and supplements
                inside the repair order. Everyone sees the same stage and we
                finish jobs faster.”
              </p>
              <div className="text-small text-text-secondary">
                <p className="font-medium text-text-primary">
                  Danielle M., Owner
                </p>
                <p>Collision repair shop in Phoenix, AZ</p>
              </div>
            </Card>
          </div>
        </section>

        <section className="bg-background-primary py-s12">
          <div className="mx-auto w-full max-w-[980px] px-s4 text-center">
            <h2 className="text-h2 text-text-primary">
              Built for busy auto body shops
            </h2>
            <p className="mx-auto mt-s3 max-w-[720px] text-body text-text-secondary">
              Garixo keeps your repair workflow organized, your parts tracked,
              and your invoices fast — without the complexity of enterprise
              systems.
            </p>
            <div className="mt-s6 flex flex-col justify-center gap-s2 sm:flex-row">
              <Button asChild className="h-12">
                <Link href="/auth/sign-up">Start Free Trial</Link>
              </Button>
              <Button asChild variant="secondary" className="h-12">
                <Link href="/pricing">Garage Pricing Plans</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="bg-surface-default py-s12">
          <div className="mx-auto w-full max-w-[980px] px-s4">
            <div className="text-center">
              <h2 className="text-h2 text-text-primary">FAQ</h2>
              <p className="mt-s2 text-small text-text-secondary">
                Common questions from auto body shop owners.
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
              Ready to modernize your body shop?
            </h2>
            <p className="mx-auto mt-s3 max-w-[720px] text-body text-text-secondary">
              Start your free trial and simplify repair workflow in minutes.
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
          <div className="mx-auto w-full max-w-[980px] px-s4">
            <div className="rounded-2xl border border-border bg-surface-default p-s6 text-center shadow-sm">
              <p className="text-caption font-semibold uppercase tracking-wide text-primary-700">
                Explore related resources
              </p>
              <p className="mt-s2 text-small text-text-secondary">
                Keep building your collision workflow with these tools and
                guides.
              </p>
              <div className="mt-s4 grid gap-s3 sm:grid-cols-2">
                <Link
                  href="/features/inventory-management"
                  className="rounded-lg border border-border bg-background-primary px-s4 py-s3 text-left text-small font-medium text-text-primary shadow-xs transition hover:border-primary-200 hover:bg-primary-50/60"
                >
                  Parts inventory management for auto shops
                </Link>
                <Link
                  href="/features/work-orders-management"
                  className="rounded-lg border border-border bg-background-primary px-s4 py-s3 text-left text-small font-medium text-text-primary shadow-xs transition hover:border-primary-200 hover:bg-primary-50/60"
                >
                  Work order management software
                </Link>
                <Link
                  href="/pricing"
                  className="rounded-lg border border-border bg-background-primary px-s4 py-s3 text-left text-small font-medium text-text-primary shadow-xs transition hover:border-primary-200 hover:bg-primary-50/60"
                >
                  Garixo pricing — from $79/mo
                </Link>
                <Link
                  href="/tools/auto-repair-shop-profit-calculator"
                  className="rounded-lg border border-border bg-background-primary px-s4 py-s3 text-left text-small font-medium text-text-primary shadow-xs transition hover:border-primary-200 hover:bg-primary-50/60"
                >
                  Auto repair shop profit calculator
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </>
  );
}
