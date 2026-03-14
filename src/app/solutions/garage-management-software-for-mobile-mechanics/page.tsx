import type { Metadata } from 'next';
import Link from 'next/link';

import { LandingFooter } from '@/components/sections/LandingFooter';
import { LandingHeader } from '@/components/sections/LandingHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export const revalidate = false;

const faqItems = [
  {
    question: 'What is garage management software for mobile mechanics?',
    answer:
      'It is a simple system to manage work orders, customers, vehicles, parts, and invoices while you work on the go.'
  },
  {
    question: 'Does Garixo work on phones and tablets?',
    answer:
      'Yes. Garixo is web-based and works smoothly on phones and tablets for mobile jobs.'
  },
  {
    question: 'Can I create invoices on-site?',
    answer:
      'Yes. You can turn a completed job into a clean invoice in minutes and send it right away.'
  },
  {
    question: 'Will this help track customer history?',
    answer:
      'Yes. Every vehicle keeps a service history so you can reference past work on the next visit.'
  },
  {
    question: 'Can I track parts used for each job?',
    answer:
      'Yes. Parts and services are linked to each work order for clear cost tracking.'
  },
  {
    question: 'Is Garixo simple enough for solo mechanics?',
    answer:
      'Yes. It is built for independent operators who want speed and clarity without complex setup.'
  }
] as const;

const featureHighlights = [
  {
    title: 'Fast Mobile Work Orders',
    description:
      'Create work orders in seconds right from your phone or tablet.',
    benefit: 'Stay focused on the job, not paperwork.'
  },
  {
    title: 'Customer & Vehicle History',
    description: 'Keep service history organized for repeat visits.',
    benefit: 'Offer better follow-ups and build trust.'
  },
  {
    title: 'Parts and Service Tracking',
    description: 'Log parts and labor used on each job.',
    benefit: 'Know true job cost and margin.'
  },
  {
    title: 'Simple Job Status',
    description: 'Track what is pending, in progress, and completed.',
    benefit: 'Stay organized across multiple calls.'
  },
  {
    title: 'Professional Invoices',
    description: 'Send clean invoices from the field when the job is done.',
    benefit: 'Get paid faster with less admin work.'
  },
  {
    title: 'Cloud Access',
    description: 'Everything stays in one system, accessible anywhere.',
    benefit: 'No lost notes or paper tickets.'
  }
] as const;

export const metadata: Metadata = {
  metadataBase: new URL('https://www.garixo.com'),
  title: 'Garage Management Software for Mobile Mechanics | Garixo',
  description:
    'Garixo is a simple garage management software for mobile mechanics. Create work orders, track parts, and send invoices on the go.',
  keywords: [
    'garage management software for mobile mechanics',
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
    title: 'Garage Management Software for Mobile Mechanics | Garixo',
    description:
      'Run mobile repair jobs with fast work orders, parts tracking, and clean invoices.',
    type: 'website',
    url: 'https://www.garixo.com/solutions/garage-management-software-for-mobile-mechanics'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Garage Management Software for Mobile Mechanics | Garixo',
    description:
      'Simple mobile mechanic workflow software for work orders and invoices.'
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
              Garage Management Software for Mobile Mechanics
            </h1>
            <p className="mx-auto mt-s3 max-w-[820px] text-body text-text-secondary">
              Run mobile repair jobs with fast work orders, parts tracking, and
              clean invoices. Garixo keeps your workflow organized while you
              stay on the move.
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
                  Still tracking jobs on your phone notes?
                </h2>
                <p className="text-body text-text-secondary">
                  Mobile mechanics juggle locations, parts, and customers all
                  day. Without a clean system, details get lost.
                </p>
                <ul className="space-y-s2 text-small text-text-secondary">
                  <li>Work order details scattered across messages.</li>
                  <li>Parts usage is hard to track per job.</li>
                  <li>Invoices get delayed after the repair.</li>
                  <li>No clear history for repeat customers.</li>
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
                Features built for mobile repair work
              </h2>
              <p className="mx-auto mt-s2 max-w-[760px] text-body text-text-secondary">
                Everything you need to manage jobs on the go without complex
                enterprise systems.
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
                  <li>1. Create a mobile work order.</li>
                  <li>2. Add parts and labor used on site.</li>
                  <li>3. Complete the job and send the invoice.</li>
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
                  <li>Notes and job details spread across apps.</li>
                  <li>Parts usage tracked manually or after the job.</li>
                  <li>Invoices sent late or forgotten.</li>
                </ul>
              </Card>
              <Card className="space-y-s2 border border-border bg-surface-default p-s4">
                <h3 className="text-h3 text-text-primary">After Garixo</h3>
                <ul className="space-y-s2 text-small text-text-secondary">
                  <li>All job details in one mobile-friendly system.</li>
                  <li>Parts and labor captured in the work order.</li>
                  <li>Invoices sent quickly after completion.</li>
                </ul>
              </Card>
            </div>
          </div>
        </section>

        <section className="bg-background-primary py-s12">
          <div className="mx-auto w-full max-w-[980px] px-s4 text-center">
            <h2 className="text-h2 text-text-primary">
              Built for mobile mechanics on the move
            </h2>
            <p className="mx-auto mt-s3 max-w-[720px] text-body text-text-secondary">
              Garixo keeps your jobs organized, your invoices fast, and your
              customer history clear — all from your phone or tablet.
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
