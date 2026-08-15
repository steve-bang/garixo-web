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
    question: 'What is mobile mechanic software?',
    answer:
      'Mobile mechanic software is a mobile-first system that keeps work orders, parts, customer history, and invoices in one place while you work on site — without paper tickets or office tools.'
  },
  {
    question: 'Does Garixo work on phones and tablets?',
    answer:
      'Yes. Garixo is fully web-based and optimized for phones and tablets so you can run every job from your device.'
  },
  {
    question: 'Can I create invoices on-site and get paid faster?',
    answer:
      'Yes. You can close the work order on-site and send a clean invoice immediately so customers can pay before you drive away.'
  },
  {
    question: 'Can I track past service history for repeat customers?',
    answer:
      'Yes. Every vehicle keeps a complete job history so you can answer questions in seconds and recommend the next service with confidence.'
  },
  {
    question: 'Is Garixo good for solo mechanics?',
    answer:
      'Yes. The Starter plan is built for solo operators who want fast work orders, parts tracking, and invoices — without extra admin work.'
  },
  {
    question: 'Can a small team use Garixo on the same account?',
    answer:
      'Yes. The Growth plan supports up to 12 users so each mechanic can manage their own jobs while the owner sees the full day.'
  },
  {
    question: 'Does Garixo help capture parts and approvals in writing?',
    answer:
      'Yes. You can add parts and scope changes directly to the work order, capture approval notes, and keep everything documented.'
  },
  {
    question: 'How fast can I get started?',
    answer:
      'Most independent mechanics create their first work order within 30 minutes. No setup call or training required.'
  }
] as const;

const featureHighlights = [
  {
    title: 'Mobile Jobs That Stay Clean',
    description:
      'Create a job in seconds from any driveway. Add services, notes, and parts in one screen.',
    benefit: 'No paperwork and no retyping at the end of the day.'
  },
  {
    title: 'On-Site Approvals',
    description:
      'Add scope changes on the spot and capture customer approval in writing.',
    benefit: 'Fewer disputes and faster closeouts.'
  },
  {
    title: 'Parts and Labor Tracking',
    description:
      'Log every part and labor line as you work so nothing falls off the invoice.',
    benefit: 'Protect margin on every job.'
  },
  {
    title: 'Customer & Vehicle History',
    description:
      'Search by plate or customer name to pull up past jobs instantly.',
    benefit: 'Repeat customers feel remembered and stay loyal.'
  },
  {
    title: 'Invoice on the Spot',
    description:
      'Finish the job, generate the invoice, and send it before you leave.',
    benefit: 'Get paid faster without late-night admin.'
  },
  {
    title: 'Daily Job Overview',
    description: 'See every job in one daily view so you can stay on schedule.',
    benefit: 'Less scrambling between locations.'
  }
] as const;

export const metadata: Metadata = {
  title: 'Mobile Mechanic Software — Work Orders & Invoices On The Go | Garixo',
  description:
    'Mobile mechanic software to manage work orders, parts, and invoices from your phone. Create jobs on-site and get paid before leaving. Free trial.',
  keywords: [
    'mobile mechanic software',
    'mobile mechanic work order system',
    'mobile auto repair management software',
    'mobile mechanic invoicing software',
    'mobile repair workflow software'
  ],
  alternates: {
    canonical: '/solutions/garage-management-software-for-mobile-mechanics'
  },
  robots: {
    index: true,
    follow: true
  },
  openGraph: {
    title:
      'Mobile Mechanic Software — Work Orders & Invoices On The Go | Garixo',
    description:
      'Mobile mechanic software to manage work orders, parts, and invoices from your phone. Create jobs on-site and get paid before leaving. Free trial.',
    type: 'website',
    url: 'https://www.garixo.com/solutions/garage-management-software-for-mobile-mechanics'
  },
  twitter: {
    card: 'summary_large_image',
    title:
      'Mobile Mechanic Software — Work Orders & Invoices On The Go | Garixo',
    description:
      'Mobile mechanic software to manage work orders, parts, and invoices from your phone. Create jobs on-site and get paid before leaving. Free trial.'
  }
};

export default function MobileMechanicsSolutionsPage(): JSX.Element {
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
        name: 'Garage Management Software for Mobile Mechanics',
        item: 'https://www.garixo.com/solutions/garage-management-software-for-mobile-mechanics'
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
              Built for Mobile Mechanics
            </p>
            <h1 className="mt-s4 text-[34px] font-bold leading-tight text-text-primary md:text-[52px]">
              Create work orders, log parts, and send invoices from your phone —
              before you leave the driveway. No front desk needed.
            </h1>
            <p className="mx-auto mt-s3 max-w-[820px] text-body text-text-secondary">
              Garixo is mobile mechanic software built for independent mechanics
              who work on-site, on the road, and between multiple customer
              locations every day. Market trends show{' '}
              <a
                href="https://ibisworld.com"
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="font-medium text-primary-700 underline-offset-2 hover:underline"
              >
                mobile auto repair services growing as consumers seek
                convenience
              </a>
              , which makes fast, on-site workflows a competitive advantage.
              Create a work order from your driveway. Log parts as you work.
              Send a professional invoice before you drive to the next job.
              Works on any phone or tablet — no laptop, no office, no front desk
              required. Starts at $79/mo. Free 14-day trial.
            </p>
            <div className="mt-s6 flex flex-col justify-center gap-s2 sm:flex-row">
              <Button asChild className="h-12">
                <Link href="https://app.garixo.com/register">
                  Start Free Trial
                </Link>
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
                  Still tracking jobs on your phone notes?
                </h2>
                <p className="text-body text-text-secondary">
                  Mobile mechanics juggle locations, parts, and customers all
                  day. Without a clean system, details get lost.
                </p>
                <ul className="space-y-s2 text-small text-text-secondary">
                  <li>Estimates and approvals handled over texts and calls.</li>
                  <li>Job details scattered across notes and messages.</li>
                  <li>Parts usage tracked after the fact.</li>
                  <li>Invoices delayed once you leave the site.</li>
                </ul>
              </div>
              <Card className="space-y-s3 border border-border bg-surface-default p-s4">
                <h3 className="text-h3 text-text-primary">
                  A mobile-friendly workflow that just works
                </h3>
                <p className="text-small text-text-secondary">
                  Garixo keeps work orders, parts, and invoices in one place so
                  you can finish jobs faster and get paid sooner.
                </p>
                <Button asChild className="h-11">
                  <Link href="https://app.garixo.com/register">
                    Start in minutes
                  </Link>
                </Button>
              </Card>
            </div>
          </div>
        </section>

        <section className="bg-background-secondary py-s12">
          <div className="mx-auto w-full max-w-[1100px] px-s4">
            <div className="space-y-s3 text-center">
              <h2 className="text-h2 text-text-primary">
                Built for Mechanics Running 4–8 Jobs Across Multiple Locations
                Every Day
              </h2>
              <p className="mx-auto max-w-[880px] text-body text-text-secondary">
                Most mobile mechanic apps are built for shops with a fixed
                address. Garixo is built for the mechanic who is at a different
                driveway every 90 minutes.
              </p>
            </div>
            <div className="mt-s6 space-y-s4">
              <Card className="space-y-s2 border border-border bg-surface-default p-s4">
                <p className="text-small font-semibold text-text-primary">
                  7:45am
                </p>
                <p className="text-small text-text-secondary">
                  You are still at home. You open Garixo and check today&apos;s
                  job list. Six jobs. First one starts in 15 minutes, 3 miles
                  away. Work order is already created from when the customer
                  booked yesterday.
                </p>
              </Card>
              <Card className="space-y-s2 border border-border bg-surface-default p-s4">
                <p className="text-small font-semibold text-text-primary">
                  8:00am
                </p>
                <p className="text-small text-text-secondary">
                  Job 1: oil change and air filter. You confirm the vehicle, add
                  the parts used, mark it complete, and send the invoice before
                  you leave.
                </p>
              </Card>
              <Card className="space-y-s2 border border-border bg-surface-default p-s4">
                <p className="text-small font-semibold text-text-primary">
                  9:45am
                </p>
                <p className="text-small text-text-secondary">
                  Job 2: brake pads. Customer asks to check the rotors too. You
                  add the inspection line item and capture approval in the
                  notes.
                </p>
              </Card>
              <Card className="space-y-s2 border border-border bg-surface-default p-s4">
                <p className="text-small font-semibold text-text-primary">
                  12:30pm
                </p>
                <p className="text-small text-text-secondary">
                  Job 4: a customer asks about the same brake job six months
                  ago. You search by plate and pull the full history in 10
                  seconds.
                </p>
              </Card>
              <Card className="space-y-s2 border border-border bg-surface-default p-s4">
                <p className="text-small font-semibold text-text-primary">
                  5:30pm
                </p>
                <p className="text-small text-text-secondary">
                  Job 6 is done. You close the work order, send the invoice, and
                  open the day summary: 6 jobs, revenue visible, all parts
                  accounted for.
                </p>
              </Card>
              <p className="text-small text-text-secondary">
                Every job tracked. Every part captured. Every invoice sent
                on-site. That is what mobile mechanic software should do.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-surface-default py-s12">
          <div className="mx-auto w-full max-w-[1100px] px-s4">
            <div className="text-center">
              <h2 className="text-h2 text-text-primary">
                Features Built for the Mechanic Who Works on the Road
              </h2>
              <p className="mx-auto mt-s2 max-w-[760px] text-body text-text-secondary">
                Every feature answers one question — &apos;Does this work on my
                phone, at a customer&apos;s house, without a front desk?&apos;
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
          <div className="mx-auto w-full max-w-[1000px] px-s4">
            <div className="grid gap-s6 md:grid-cols-2">
              <Card className="space-y-s3 border border-border bg-surface-default p-s4">
                <h3 className="text-h3 text-text-primary">
                  Works for Solo Mechanics
                </h3>
                <p className="text-small text-text-secondary">
                  Starter plan ($79/mo) — built for independent operators.
                </p>
                <ul className="space-y-s2 text-small text-text-secondary">
                  <li>1 account, 1 phone, full workflow.</li>
                  <li>Create jobs, track parts, invoice — solo.</li>
                  <li>Full customer and vehicle history.</li>
                  <li>All jobs in one daily view.</li>
                  <li>Perfect for independent operators.</li>
                </ul>
              </Card>
              <Card className="space-y-s3 border border-border bg-surface-default p-s4">
                <h3 className="text-h3 text-text-primary">
                  Works for Small Mobile Teams
                </h3>
                <p className="text-small text-text-secondary">
                  Starter to Growth ($79–$129/mo) — scale up fast.
                </p>
                <ul className="space-y-s2 text-small text-text-secondary">
                  <li>Up to 5–12 users on one account.</li>
                  <li>Each mechanic manages their own jobs.</li>
                  <li>Owner sees all jobs across the team.</li>
                  <li>Revenue visible per mechanic per day.</li>
                  <li>No extra setup — add users in minutes.</li>
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
                  <li>1. Capture the job and estimate on site.</li>
                  <li>2. Add parts and labor as you work.</li>
                  <li>3. Send the invoice before you leave.</li>
                </ol>
              </Card>
              <div className="space-y-s3">
                <h2 className="text-h2 text-text-primary">
                  Turn mobile jobs into clear revenue
                </h2>
                <p className="text-body text-text-secondary">
                  Track parts cost and labor quickly. Know what each job is
                  worth and reduce admin time between calls.
                </p>
                <div className="flex flex-col gap-s2 sm:flex-row">
                  <Button asChild className="h-11">
                    <Link href="https://app.garixo.com/register">
                      Start Free Trial
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
                What a Full Day at a Busy Mobile Operation Looks Like With
                Garixo
              </h2>
            </div>
            <div className="mt-s6 space-y-s4">
              <Card className="space-y-s2 border border-border bg-surface-default p-s4">
                <p className="text-small font-semibold text-text-primary">
                  7:15am
                </p>
                <p className="text-small text-text-secondary">
                  First customer calls. You check Garixo on your phone, confirm
                  inventory for the job, and book the appointment before he
                  hangs up.
                </p>
              </Card>
              <Card className="space-y-s2 border border-border bg-surface-default p-s4">
                <p className="text-small font-semibold text-text-primary">
                  8:30am
                </p>
                <p className="text-small text-text-secondary">
                  Job 1 finishes. You mark it complete, the invoice is ready,
                  the customer pays in minutes, and you head to the next stop.
                </p>
              </Card>
              <Card className="space-y-s2 border border-border bg-surface-default p-s4">
                <p className="text-small font-semibold text-text-primary">
                  11:00am
                </p>
                <p className="text-small text-text-secondary">
                  A customer asks about past work. You search by plate, pull up
                  full history, and recommend the next service on the spot.
                </p>
              </Card>
              <Card className="space-y-s2 border border-border bg-surface-default p-s4">
                <p className="text-small font-semibold text-text-primary">
                  4:00pm
                </p>
                <p className="text-small text-text-secondary">
                  You check today’s remaining jobs, confirm parts, and adjust
                  the route without calling the office.
                </p>
              </Card>
              <Card className="space-y-s2 border border-border bg-surface-default p-s4">
                <p className="text-small font-semibold text-text-primary">
                  6:00pm
                </p>
                <p className="text-small text-text-secondary">
                  You close out. Every job captured, revenue visible, no missing
                  charges. Tomorrow’s first jobs are already in the queue.
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
                      Forget to invoice after a long day — payment delayed 24–48
                      hours.
                    </td>
                    <td className="border-b border-border px-s4 py-s3">
                      Invoice sent on-site the moment job closes — most
                      customers pay within hours.
                    </td>
                  </tr>
                  <tr>
                    <td className="border-b border-border px-s4 py-s3">
                      Customer disputes the total — no written record of what
                      was agreed.
                    </td>
                    <td className="border-b border-border px-s4 py-s3">
                      Scope and pricing captured in writing before work starts —
                      disputes are resolved fast.
                    </td>
                  </tr>
                  <tr>
                    <td className="border-b border-border px-s4 py-s3">
                      Forget to charge for a part — lose $15–30 per job,
                      $300+/month total.
                    </td>
                    <td className="border-b border-border px-s4 py-s3">
                      Parts auto-captured on every work order — nothing falls
                      off the invoice.
                    </td>
                  </tr>
                  <tr>
                    <td className="border-b border-border px-s4 py-s3">
                      Rebuild every invoice from memory at end of day.
                    </td>
                    <td className="border-b border-border px-s4 py-s3">
                      Invoice auto-builds from work order entries — ready in one
                      tap.
                    </td>
                  </tr>
                  <tr>
                    <td className="border-b border-border px-s4 py-s3">
                      No record of past jobs — start every repeat visit from
                      scratch.
                    </td>
                    <td className="border-b border-border px-s4 py-s3">
                      Full vehicle and job history searchable by plate or
                      customer name.
                    </td>
                  </tr>
                  <tr>
                    <td className="px-s4 py-s3">
                      Switch between texts, notes app, and calculator to manage
                      one job.
                    </td>
                    <td className="px-s4 py-s3">
                      One app handles the whole job from approval to paid
                      invoice.
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
                Simple pricing for independent mobile mechanics
              </h2>
              <div className="grid gap-s4 md:grid-cols-2">
                <div className="rounded-lg border border-border bg-background-primary p-s4 text-left">
                  <p className="text-caption font-semibold uppercase text-primary-700">
                    Starter
                  </p>
                  <p className="mt-s2 text-h3 text-text-primary">$79/month</p>
                  <p className="text-small text-text-secondary">
                    Up to 5 users — perfect for solo or small team
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-background-primary p-s4 text-left">
                  <p className="text-caption font-semibold uppercase text-primary-700">
                    Growth
                  </p>
                  <p className="mt-s2 text-h3 text-text-primary">$129/month</p>
                  <p className="text-small text-text-secondary">
                    Up to 12 users + advanced reporting
                  </p>
                </div>
              </div>
              <p className="text-small text-text-secondary">
                14-day free trial included — no credit card required. No
                contract, no setup fee — cancel anytime. Web-based and works on
                any phone, tablet, or browser.
              </p>
              <div className="flex flex-col justify-center gap-s2 sm:flex-row">
                <Button asChild className="h-12">
                  <Link href="https://app.garixo.com/register">
                    Start Free Trial — No Card Required
                  </Link>
                </Button>
                <Button asChild variant="secondary" className="h-12">
                  <Link href="/pricing">View Full Pricing</Link>
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
                Common questions from mobile mechanics.
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
              Ready to run a smoother mobile workflow?
            </h2>
            <p className="mx-auto mt-s3 max-w-[720px] text-body text-text-secondary">
              Start your free trial and keep every mobile job organized.
            </p>
            <div className="mt-s6 flex flex-col justify-center gap-s2 sm:flex-row">
              <Button asChild className="h-12">
                <Link href="https://app.garixo.com/register">
                  Start Free Trial
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
                href="/features/work-orders-management"
                className="font-medium text-primary-700 underline-offset-2 hover:underline"
              >
                work order management system
              </Link>
              <span className="hidden text-text-muted sm:inline">•</span>
              <Link
                href="/features/inventory-management"
                className="font-medium text-primary-700 underline-offset-2 hover:underline"
              >
                auto parts inventory tracking
              </Link>
              <span className="hidden text-text-muted sm:inline">•</span>
              <Link
                href="/features/customers-management"
                className="font-medium text-primary-700 underline-offset-2 hover:underline"
              >
                customer and vehicle history software
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
                how to run a mobile mechanic business
              </Link>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </>
  );
}
