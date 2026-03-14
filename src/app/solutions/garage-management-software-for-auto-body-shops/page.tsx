import type { Metadata } from 'next';
import Link from 'next/link';

import { LandingFooter } from '@/components/sections/LandingFooter';
import { LandingHeader } from '@/components/sections/LandingHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export const revalidate = false;

const faqItems = [
  {
    question: 'What is garage management software for auto body shops?',
    answer:
      'It is a simple system that helps auto body shops manage repair orders, customers, vehicles, parts, and invoices in one place without paper tracking.'
  },
  {
    question: 'Does Garixo support collision-style repair workflows?',
    answer:
      'Yes. You can track job status, parts used, and technician assignments for each repair from intake to delivery.'
  },
  {
    question: 'Can I keep photo or notes per repair?',
    answer:
      'You can add clear notes and service details to every work order to keep repair context organized.'
  },
  {
    question: 'Is Garixo built for small body shops?',
    answer:
      'Yes. It is designed for independent shops with lean teams and fast daily workflows.'
  },
  {
    question: 'Will this help shorten repair turnaround?',
    answer:
      'Yes. Clear job tracking and faster invoicing reduce delays and keep work flowing.'
  },
  {
    question: 'How is Garixo different from enterprise shop software?',
    answer:
      'Garixo focuses on speed and clarity without heavy setup, long training, or complex menus.'
  }
] as const;

const featureHighlights = [
  {
    title: 'Clear Repair Work Orders',
    description:
      'Create body repair work orders with parts, labor, and notes attached.',
    benefit: 'Keep repairs organized from intake to delivery.'
  },
  {
    title: 'Job Status Visibility',
    description: 'Track each job stage so your team always knows what is next.',
    benefit: 'Reduce delays and avoid missed handoffs.'
  },
  {
    title: 'Parts and Materials Tracking',
    description: 'Log parts and materials used for each repair job.',
    benefit: 'Know true job cost and avoid reorders.'
  },
  {
    title: 'Customer and Vehicle History',
    description: 'See past repairs and customer history in seconds.',
    benefit: 'Provide better follow-up and repeat service.'
  },
  {
    title: 'Professional Invoices',
    description:
      'Convert completed repairs into clean, accurate invoices quickly.',
    benefit: 'Faster checkout and fewer billing mistakes.'
  },
  {
    title: 'Team Assignment',
    description: 'Assign work to technicians and balance workload.',
    benefit: 'Keep bays productive during busy weeks.'
  }
] as const;

export const metadata: Metadata = {
  metadataBase: new URL('https://www.garixo.com'),
  title: 'Garage Management Software for Auto Body Shops | Garixo',
  description:
    'Garixo is a simple garage management software for auto body shops. Track repair work orders, parts, and invoices in one clean workflow.',
  keywords: [
    'garage management software for auto body shops',
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
    title: 'Garage Management Software for Auto Body Shops | Garixo',
    description:
      'Track repair jobs, parts, and invoices with a simple workflow made for auto body shops.',
    type: 'website',
    url: 'https://www.garixo.com/solutions/garage-management-software-for-auto-body-shops'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Garage Management Software for Auto Body Shops | Garixo',
    description:
      'Simple auto body shop workflow software for work orders and invoices.'
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
              Garage Management Software for Auto Body Shops
            </h1>
            <p className="mx-auto mt-s3 max-w-[820px] text-body text-text-secondary">
              Keep collision repairs organized with simple work orders, parts
              tracking, and clean invoices. Garixo helps body shops stay on
              schedule and deliver repairs faster.
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
                  <li>Repair steps get lost between technicians.</li>
                  <li>Parts usage is hard to track accurately.</li>
                  <li>Invoices take too long after the job is done.</li>
                  <li>Customer history is scattered or missing.</li>
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

        <section className="bg-surface-default py-s12">
          <div className="mx-auto w-full max-w-[1100px] px-s4">
            <div className="text-center">
              <h2 className="text-h2 text-text-primary">
                Features built for auto body repair shops
              </h2>
              <p className="mx-auto mt-s2 max-w-[760px] text-body text-text-secondary">
                Everything you need to manage collision repairs without complex
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
                  <li>1. Create a repair work order.</li>
                  <li>2. Add parts and labor as work progresses.</li>
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
          <div className="mx-auto w-full max-w-[1000px] px-s4">
            <div className="grid gap-s4 md:grid-cols-2">
              <Card className="space-y-s2 border border-border bg-surface-default p-s4">
                <h3 className="text-h3 text-text-primary">Before Garixo</h3>
                <ul className="space-y-s2 text-small text-text-secondary">
                  <li>Paper repair tickets and missing updates.</li>
                  <li>Parts usage tracked in multiple places.</li>
                  <li>Slow invoicing after repairs are complete.</li>
                </ul>
              </Card>
              <Card className="space-y-s2 border border-border bg-surface-default p-s4">
                <h3 className="text-h3 text-text-primary">After Garixo</h3>
                <ul className="space-y-s2 text-small text-text-secondary">
                  <li>Clear repair workflow from intake to delivery.</li>
                  <li>Parts and labor tracked in every work order.</li>
                  <li>Clean invoices sent in minutes.</li>
                </ul>
              </Card>
            </div>
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
      </main>

      <LandingFooter />
    </>
  );
}
