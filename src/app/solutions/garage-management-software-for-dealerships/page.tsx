import type { Metadata } from 'next';
import Link from 'next/link';

import { LandingFooter } from '@/components/sections/LandingFooter';
import { LandingHeader } from '@/components/sections/LandingHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export const revalidate = false;

const faqItems = [
  {
    question: 'What is garage management software for dealerships?',
    answer:
      'It is a system for dealership service departments to manage repair orders, advisor workflows, and service history in one place.'
  },
  {
    question: 'Is Garixo suitable for smaller dealerships?',
    answer:
      'Yes. Garixo is built for lean teams that want clean workflows without enterprise complexity.'
  },
  {
    question: 'Can Garixo track service history per vehicle?',
    answer:
      'Yes. Each vehicle keeps a full service timeline so advisors can see past work instantly.'
  },
  {
    question: 'Does Garixo support advisor handoffs and technician assignment?',
    answer:
      'Yes. Work orders stay visible across advisors and techs so each handoff is clear.'
  },
  {
    question: 'Does Garixo support parts usage and inventory tracking?',
    answer:
      'Yes. Parts and materials are linked to work orders for clear cost visibility.'
  },
  {
    question: 'Will this help service advisors move faster?',
    answer:
      'Yes. Fast work order creation and clear job status reduce time at the counter.'
  },
  {
    question: 'How is Garixo different from enterprise DMS systems?',
    answer:
      'Garixo focuses on speed, clarity, and simple setup instead of heavy enterprise modules.'
  },
  {
    question: 'Is Garixo a replacement for a full DMS?',
    answer:
      'Garixo is not a full Dealer Management System. It is a focused service workflow tool for independent dealers who need clean work orders, vehicle history, and invoicing — without the cost and complexity of enterprise DMS platforms.'
  },
  {
    question:
      'How does Garixo compare to Reynolds & Reynolds or CDK for small dealers?',
    answer:
      'Enterprise DMS platforms are built for large franchise dealers with complex finance and inventory modules. Garixo focuses on service workflow for independent and growing operations at a significantly lower cost.'
  }
] as const;

const featureHighlights = [
  {
    title: 'Service Work Orders',
    description:
      'Create dealership service work orders quickly with parts, labor, and notes.',
    benefit: 'Keep advisors and techs aligned all day.'
  },
  {
    title: 'Advisor Handoff Clarity',
    description: 'Keep service notes and job status visible across the desk.',
    benefit: 'Reduce dropped details between advisors.'
  },
  {
    title: 'Service Lane Throughput',
    description: 'Track status from intake to completion in one view.',
    benefit: 'Move more cars through each day.'
  },
  {
    title: 'Vehicle Service History',
    description:
      'Track every visit and repair for each vehicle in one timeline.',
    benefit: 'Improve customer trust and follow-up.'
  },
  {
    title: 'Warranty & RO Notes',
    description: 'Keep warranty-related notes attached to each repair order.',
    benefit: 'Avoid rework and missed details.'
  },
  {
    title: 'Parts and Materials Tracking',
    description: 'Log parts usage per job to understand true service cost.',
    benefit: 'Better margin visibility per repair.'
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
              Garage Management Software for Dealerships and Multi-Bay Service
              Shops
            </h1>
            <p className="mx-auto mt-s3 max-w-[820px] text-body text-text-secondary">
              Run your service department without a $500/month DMS. Garixo gives
              independent dealers and growing service shops clean work orders,
              advisor notes, and vehicle history — at a fraction of the cost.
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

        <section className="bg-surface-default py-s12">
          <div className="mx-auto w-full max-w-[1100px] px-s4">
            <div className="text-center">
              <h2 className="text-h2 text-text-primary">
                Built for busy service lanes
              </h2>
              <p className="mx-auto mt-s2 max-w-[760px] text-body text-text-secondary">
                Keep advisor notes, warranty context, and job status in one
                place so your service lane stays moving.
              </p>
            </div>
            <div className="mt-s6 grid gap-s4 md:grid-cols-3">
              <Card className="space-y-s2 p-s4">
                <h3 className="text-h3 text-text-primary">Advisor Workflow</h3>
                <p className="text-small text-text-secondary">
                  Capture intake notes and approvals in the same record.
                </p>
              </Card>
              <Card className="space-y-s2 p-s4">
                <h3 className="text-h3 text-text-primary">Service Lane View</h3>
                <p className="text-small text-text-secondary">
                  See status across open tickets without hunting.
                </p>
              </Card>
              <Card className="space-y-s2 p-s4">
                <h3 className="text-h3 text-text-primary">Warranty Notes</h3>
                <p className="text-small text-text-secondary">
                  Keep warranty context and parts in one place.
                </p>
              </Card>
            </div>
          </div>
        </section>

        <section className="bg-surface-default py-s12">
          <div className="mx-auto w-full max-w-[1100px] px-s4">
            <div className="text-center">
              <h2 className="text-h2 text-text-primary">
                Features built for dealership service teams
              </h2>
              <p className="mx-auto mt-s2 max-w-[760px] text-body text-text-secondary">
                Everything you need to manage service workflow without heavy
                enterprise software.
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
                      Work Order Management Software
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-surface-default py-s12">
          <div className="mx-auto w-full max-w-[1000px] px-s4">
            <div className="grid gap-s4 md:grid-cols-2">
              <Card className="space-y-s2 border border-border bg-surface-default p-s4">
                <h3 className="text-h3 text-text-primary">Before Garixo</h3>
                <ul className="space-y-s2 text-small text-text-secondary">
                  <li>Advisor notes lost during handoffs.</li>
                  <li>Service lane status tracked manually.</li>
                  <li>Warranty context buried in emails.</li>
                </ul>
              </Card>
              <Card className="space-y-s2 border border-border bg-surface-default p-s4">
                <h3 className="text-h3 text-text-primary">After Garixo</h3>
                <ul className="space-y-s2 text-small text-text-secondary">
                  <li>Advisor notes and approvals in one place.</li>
                  <li>Service lane status visible at a glance.</li>
                  <li>Faster billing with clean records.</li>
                </ul>
              </Card>
            </div>
          </div>
        </section>

        <section className="bg-background-primary py-s12">
          <div className="mx-auto w-full max-w-[980px] px-s4 text-center">
            <h2 className="text-h2 text-text-primary">
              Built for dealership service teams
            </h2>
            <p className="mx-auto mt-s3 max-w-[720px] text-body text-text-secondary">
              Garixo keeps advisors, techs, and parts aligned with a simple
              workflow that scales with your service volume.
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
      </main>

      <LandingFooter />
    </>
  );
}
