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
    question: 'What is tire shop management software?',
    answer:
      'Tire shop management software is a digital system that helps tire shops create work orders, track tire inventory by size and SKU, manage customer service history, and invoice faster — all without paper tickets or spreadsheets.'
  },
  {
    question:
      'Can I track tire inventory by size, such as 205/55R16 or 235/65R17?',
    answer:
      'Yes. Garixo lets you track each tire size and brand as a separate inventory item, set minimum stock levels per size, and receive low-stock alerts before you run out during peak season.'
  },
  {
    question:
      'Does it track rotation intervals and service history per vehicle?',
    answer:
      'Yes. Every vehicle keeps a complete service timeline — rotation dates, balance history, TPMS service records, and tire size per axle. You can pull this up before any job to recommend the next service with accurate context.'
  },
  {
    question:
      'Can I see which bays are free and which jobs are waiting right now?',
    answer:
      'Yes. The work order board shows every open job, every bay status, and every tech assignment in a single live view. You can spot idle bays and reassign work before delays happen.'
  },
  {
    question:
      'How does Garixo compare to TireMaster for small independent tire shops?',
    answer:
      'TireMaster is designed for larger multi-location operations and costs significantly more. Garixo is built for independent shops with 1–5 technicians that need speed and simplicity without enterprise complexity. At $79/month, it pays for itself if it helps you capture one extra add-on service per day.'
  },
  {
    question:
      'Does Garixo work for a shop that does both tires and general repairs?',
    answer:
      'Yes. Garixo handles work orders for all service types. You can track tire inventory separately from general parts inventory and manage all job types through the same workflow.'
  },
  {
    question: 'Is it mobile-friendly for front desk and bay use?',
    answer:
      'Yes. Garixo is fully web-based and works on phones and tablets. Techs can update job status from the bay without walking to a desktop computer.'
  },
  {
    question: 'How long does setup take for a small tire shop?',
    answer:
      'Most independent shops are running their first work orders within 30 minutes. There is no complex migration, no installation, and no training sessions required. The 14-day free trial is the fastest way to see if it fits your workflow.'
  }
] as const;

const featureHighlights = [
  {
    title: 'High-Volume Job Flow',
    description:
      'Create a tire job in under 20 seconds — service type, vehicle, notes, and parts attached in one step.',
    benefit:
      'Handle 10–15 jobs daily without the counter creating a bottleneck. Board view shows every bay status in real time.'
  },
  {
    title: 'Tire Inventory by Size and SKU',
    description:
      'Track each tire size (e.g. 205/55R16, 235/65R17), brand, and stock level separately.',
    benefit:
      'Know exactly what is on hand before a customer asks. Set minimum stock levels per size so you never run short mid-season.'
  },
  {
    title: 'Rotation & Service History Per Vehicle',
    description:
      'See the last rotation date, last balance, last TPMS reset, and tire size per axle — for every vehicle.',
    benefit:
      'Recommend the next service with confidence. Customers who feel remembered come back.'
  },
  {
    title: 'Seasonal Reorder Alerts',
    description:
      'Set low-stock alerts 6–8 weeks before your peak season so reorders land on time.',
    benefit:
      'Stop over-buying slow sizes and stop losing sales on popular sizes during the rush.'
  },
  {
    title: 'Bay Status Board',
    description:
      'See every open job, every bay, and every tech assignment in one live view.',
    benefit:
      'Spot idle bays in seconds. Reassign work before the slowdown costs you a job slot.'
  },
  {
    title: 'Fast Counter Invoicing',
    description:
      'Turn a completed work order into a clean invoice in one click.',
    benefit:
      'Get paid at the counter while the next car pulls in. Less waiting, fewer follow-up calls, better cash flow at end of day.'
  }
] as const;

export const metadata: Metadata = {
  metadataBase: new URL('https://www.garixo.com'),
  title:
    'Tire Shop Management Software — Fast Work Orders & Inventory | Garixo',
  description:
    'Tire shop management software that keeps bays moving. Fast work orders, tire inventory tracking, and clean invoices for small tire shops. Free trial.',
  keywords: [
    'tire shop management software',
    'tire shop work order system',
    'auto shop management software',
    'tire inventory tracking software',
    'small tire shop software',
    'tire service workflow software'
  ],
  alternates: {
    canonical: '/solutions/garage-management-software-for-tire-shops'
  },
  robots: {
    index: true,
    follow: true
  },
  openGraph: {
    title:
      'Tire Shop Management Software — Fast Work Orders & Inventory | Garixo',
    description:
      'Tire shop management software that keeps bays moving. Fast work orders, tire inventory tracking, and clean invoices for small tire shops. Free trial.',
    type: 'website',
    url: 'https://www.garixo.com/solutions/garage-management-software-for-tire-shops'
  },
  twitter: {
    card: 'summary_large_image',
    title:
      'Tire Shop Management Software — Fast Work Orders & Inventory | Garixo',
    description:
      'Tire shop management software that keeps bays moving. Fast work orders, tire inventory tracking, and clean invoices for small tire shops. Free trial.'
  }
};

export default function TireShopSolutionsPage(): JSX.Element {
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
        name: 'Garage Management Software for Tire Shops',
        item: 'https://www.garixo.com/solutions/garage-management-software-for-tire-shops'
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
              Built for Tire Shops
            </p>
            <h1 className="mt-s4 text-[34px] font-bold leading-tight text-text-primary md:text-[52px]">
              Tire Shop Management Software — Track Every Bay, Every Size, Every
              Invoice
            </h1>
            <p className="mx-auto mt-s3 max-w-[820px] text-body text-text-secondary">
              Track every tire job, rotation, and alignment from check-in to
              invoice — without paper tickets or missed stock. Built for shops
              doing 10 to 100+ cars a week.
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
                  Still managing tire jobs on paper?
                </h2>
                <p className="text-body text-text-secondary">
                  Tire shops move fast. When jobs, parts, and invoices are
                  disconnected, mistakes happen and bays slow down.
                </p>
                <ul className="space-y-s2 text-small text-text-secondary">
                  <li>Missing tire sizes cause last-minute delays.</li>
                  <li>Work orders are hard to find during rush hours.</li>
                  <li>Invoicing takes too long at the counter.</li>
                  <li>Customer history is lost after each visit.</li>
                </ul>
              </div>
              <Card className="space-y-s3 border border-border bg-surface-default p-s4">
                <h3 className="text-h3 text-text-primary">
                  A simple tire shop system that just works
                </h3>
                <p className="text-small text-text-secondary">
                  Garixo gives you a clean workflow: create the job, use parts,
                  finish the work, and invoice fast. Everything stays in one
                  place.
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
                The Problems Every Tire Shop Owner Knows Too Well
              </h2>
              <p className="mx-auto max-w-[860px] text-body text-text-secondary">
                Tire shops move fast — but when inventory, jobs, and invoices
                run on paper, the pace works against you. Here is what happens
                every week without a proper system.
              </p>
              <p className="mx-auto max-w-[860px] text-small text-text-muted">
                The{' '}
                <a
                  href="https://ibisworld.com"
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="font-medium text-primary-700 underline-offset-2 hover:underline"
                >
                  US tire industry generates over $40 billion annually
                </a>
                , which makes lost jobs and slow bays especially expensive for
                independent shops.
              </p>
            </div>
            <div className="mt-s6 grid gap-s4 md:grid-cols-2">
              <Card className="space-y-s2 border border-border bg-surface-default p-s4">
                <p className="text-small font-semibold text-text-primary">
                  A customer calls asking for size 225/65R17.
                </p>
                <p className="text-small text-text-secondary">
                  You walk to the back to check. By the time you confirm, they
                  have called your competitor.
                </p>
              </Card>
              <Card className="space-y-s2 border border-border bg-surface-default p-s4">
                <p className="text-small font-semibold text-text-primary">
                  Your busiest bay is idle at 10am.
                </p>
                <p className="text-small text-text-secondary">
                  The next job is waiting but no one updated the work order
                  status after the last rotation finished.
                </p>
              </Card>
              <Card className="space-y-s2 border border-border bg-surface-default p-s4">
                <p className="text-small font-semibold text-text-primary">
                  End of day — you short-charged a customer.
                </p>
                <p className="text-small text-text-secondary">
                  The tech added a valve stem but it was never captured on the
                  ticket. Small leaks add up to $300–$800 per month in unbilled
                  work.
                </p>
              </Card>
              <Card className="space-y-s2 border border-border bg-surface-default p-s4">
                <p className="text-small font-semibold text-text-primary">
                  A customer returns after 6 months.
                </p>
                <p className="text-small text-text-secondary">
                  They ask when they last had a rotation and what size was on
                  the rear. You have no record, and they leave feeling like a
                  stranger.
                </p>
              </Card>
              <Card className="space-y-s2 border border-border bg-surface-default p-s4 md:col-span-2">
                <p className="text-small font-semibold text-text-primary">
                  Winter season arrives.
                </p>
                <p className="text-small text-text-secondary">
                  You over-ordered summer tires last year and under-ordered
                  215/55R17 winter stock. $2,000 locked in slow inventory,
                  $4,000 in lost winter sales.
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
                  A Tire Shop System Built Around Speed — Not Admin
                </h2>
                <p className="text-body text-text-secondary">
                  Garixo gives your team one simple workflow from check-in to
                  invoice. Create the job in 20 seconds, use parts straight from
                  inventory, track the bay, finish the job, and invoice — all
                  from a phone or tablet. Everything stays in one place. No
                  paper. No guessing.
                </p>
              </div>
              <Card className="space-y-s3 border border-border bg-surface-default p-s4">
                <h3 className="text-h3 text-text-primary">
                  What your team sees at a glance
                </h3>
                <ul className="space-y-s2 text-small text-text-secondary">
                  <li>Live bay status with every job stage.</li>
                  <li>Inventory by tire size and SKU.</li>
                  <li>Service history tied to every vehicle.</li>
                  <li>One-click invoicing at checkout.</li>
                </ul>
              </Card>
            </div>
          </div>
        </section>

        <section className="bg-surface-default py-s12">
          <div className="mx-auto w-full max-w-[1100px] px-s4">
            <div className="text-center">
              <h2 className="text-h2 text-text-primary">
                Features Built for High-Volume Tire Shop Workflow
              </h2>
              <p className="mx-auto mt-s2 max-w-[760px] text-body text-text-secondary">
                Everything you need to run 10–15 jobs a day without the counter
                slowing your bays down.
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
                Trusted by independent tire shops
              </p>
              <p className="text-h3 text-text-primary">
                “We cut our checkout time in half. Work orders and tire sizes
                are all in one place, so the front desk isn’t scrambling
                anymore.”
              </p>
              <div className="text-small text-text-secondary">
                <p className="font-medium text-text-primary">
                  Miguel R., Owner
                </p>
                <p>Three-bay tire shop in Austin, TX</p>
              </div>
            </Card>
          </div>
        </section>

        <section className="bg-background-primary py-s12">
          <div className="mx-auto w-full max-w-[1000px] px-s4">
            <div className="grid gap-s6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <Card className="space-y-s3 p-s4">
                <h3 className="text-h3 text-text-primary">How it works</h3>
                <ol className="space-y-s3 text-small text-text-secondary">
                  <li>1. Create a tire work order in seconds.</li>
                  <li>2. Add services and parts used.</li>
                  <li>3. Complete the job and send a clean invoice.</li>
                </ol>
              </Card>
              <div className="space-y-s3">
                <h2 className="text-h2 text-text-primary">
                  Turn every tire job into clear revenue
                </h2>
                <p className="text-body text-text-secondary">
                  Track parts cost, labor time, and job totals in one workflow.
                  Know what each job is worth and reduce admin time at the
                  counter.
                </p>
                <div className="flex flex-col gap-s2 sm:flex-row">
                  <Button asChild className="h-11">
                    <Link href="/auth/sign-up">
                      See how it works — free demo
                    </Link>
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
                What a Full Day at a Busy Tire Shop Looks Like With Garixo
              </h2>
            </div>
            <div className="mt-s6 space-y-s4">
              <Card className="space-y-s2 border border-border bg-surface-default p-s4">
                <p className="text-small font-semibold text-text-primary">
                  7:15am
                </p>
                <p className="text-small text-text-secondary">
                  A customer calls needing two 235/55R17s. You check Garixo on
                  your phone, confirm four in stock, and book the job before he
                  hangs up.
                </p>
              </Card>
              <Card className="space-y-s2 border border-border bg-surface-default p-s4">
                <p className="text-small font-semibold text-text-primary">
                  8:30am
                </p>
                <p className="text-small text-text-secondary">
                  Bay 2 finishes a rotation. The tech marks the job complete.
                  The invoice is ready, and the customer pays in 90 seconds. Bay
                  2 is already taking the next vehicle.
                </p>
              </Card>
              <Card className="space-y-s2 border border-border bg-surface-default p-s4">
                <p className="text-small font-semibold text-text-primary">
                  11:00am
                </p>
                <p className="text-small text-text-secondary">
                  A customer asks about her last TPMS service. You search her
                  plate number, see the service date, sensor IDs replaced, and a
                  note about a weak rear sensor. She books a follow-up on the
                  spot.
                </p>
              </Card>
              <Card className="space-y-s2 border border-border bg-surface-default p-s4">
                <p className="text-small font-semibold text-text-primary">
                  4:00pm
                </p>
                <p className="text-small text-text-secondary">
                  You check inventory before closing. Size 215/55R17 is down to
                  3 units. Garixo flagged it as low-stock two days ago, so you
                  place a reorder in time for the weekend rush.
                </p>
              </Card>
              <Card className="space-y-s2 border border-border bg-surface-default p-s4">
                <p className="text-small font-semibold text-text-primary">
                  6:00pm
                </p>
                <p className="text-small text-text-secondary">
                  You close out. 13 jobs completed. Every ticket captured.
                  Revenue visible. No missing charges. Tomorrow’s first four
                  jobs are already in the queue.
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
                      Walk to the back to check tire sizes for every phone
                      inquiry.
                    </td>
                    <td className="border-b border-border px-s4 py-s3">
                      Check any tire size on your phone in 10 seconds,
                      mid-conversation.
                    </td>
                  </tr>
                  <tr>
                    <td className="border-b border-border px-s4 py-s3">
                      Miss unbilled valve stems, disposal fees, and small
                      add-ons daily.
                    </td>
                    <td className="border-b border-border px-s4 py-s3">
                      Parts and services auto-captured on every work order —
                      nothing slips through.
                    </td>
                  </tr>
                  <tr>
                    <td className="border-b border-border px-s4 py-s3">
                      No record of past rotation, balance, or TPMS reset per
                      vehicle.
                    </td>
                    <td className="border-b border-border px-s4 py-s3">
                      Full service timeline per vehicle — recommend next service
                      with confidence.
                    </td>
                  </tr>
                  <tr>
                    <td className="border-b border-border px-s4 py-s3">
                      Over-order slow sizes, under-order popular sizes every
                      season.
                    </td>
                    <td className="border-b border-border px-s4 py-s3">
                      Low-stock alerts 6–8 weeks before peak season — right
                      stock, right time.
                    </td>
                  </tr>
                  <tr>
                    <td className="px-s4 py-s3">
                      End of day — no clear revenue figure without tallying
                      paper tickets.
                    </td>
                    <td className="px-s4 py-s3">
                      Real-time revenue visible all day — close with confidence,
                      not guesswork.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="bg-background-primary py-s12">
          <div className="mx-auto w-full max-w-[980px] px-s4 text-center">
            <h2 className="text-h2 text-text-primary">
              Built for busy tire shops
            </h2>
            <p className="mx-auto mt-s3 max-w-[720px] text-body text-text-secondary">
              Garixo keeps your team organized, your inventory accurate, and
              your daily revenue clear. Simple tools that help you run faster.
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
                Common questions from tire shop owners.
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
              Ready to simplify tire shop operations?
            </h2>
            <p className="mx-auto mt-s3 max-w-[720px] text-body text-text-secondary">
              Start your free trial and see how much faster your tire workflow
              can run.
            </p>
            <div className="mt-s6 flex flex-col justify-center gap-s2 sm:flex-row">
              <Button asChild className="h-12">
                <Link href="/auth/sign-up">
                  Start free — no credit card needed
                </Link>
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
                href="/features/inventory-management"
                className="font-medium text-primary-700 underline-offset-2 hover:underline"
              >
                inventory management for auto parts
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
                Garixo pricing plans
              </Link>
              <span className="hidden text-text-muted sm:inline">•</span>
              <Link
                href="/tools/auto-repair-labor-rate-calculator"
                className="font-medium text-primary-700 underline-offset-2 hover:underline"
              >
                auto repair labor rate calculator
              </Link>
              <span className="hidden text-text-muted sm:inline">•</span>
              <Link
                href="/blog/"
                className="font-medium text-primary-700 underline-offset-2 hover:underline"
              >
                how to manage tire shop inventory
              </Link>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </>
  );
}
