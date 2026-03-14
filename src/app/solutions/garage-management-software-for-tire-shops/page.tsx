import type { Metadata } from 'next';
import Link from 'next/link';

import { LandingFooter } from '@/components/sections/LandingFooter';
import { LandingHeader } from '@/components/sections/LandingHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export const revalidate = false;

const faqItems = [
  {
    question: 'What is garage management software for tire shops?',
    answer:
      'It is a simple system that helps tire shops manage work orders, customers, vehicles, parts, and invoices in one place without spreadsheets or paper.'
  },
  {
    question: 'Does Garixo work for small tire shops with 1–5 mechanics?',
    answer:
      'Yes. Garixo is built for small independent shops with lean teams and fast daily workflows.'
  },
  {
    question: 'Can I track tire inventory and parts usage?',
    answer:
      'Yes. Garixo connects parts and services to work orders so you can see usage and keep stock under control.'
  },
  {
    question: 'Will this help me turn cars faster?',
    answer:
      'Yes. Clear job status, quick work orders, and faster invoices help reduce delays and improve daily throughput.'
  },
  {
    question: 'Is Garixo mobile-friendly for front desk and bay use?',
    answer:
      'Yes. Garixo is web-based and works on tablets and phones, which is ideal for tire bays and quick check-ins.'
  },
  {
    question: 'How is Garixo different from enterprise shop software?',
    answer:
      'Garixo focuses on simplicity and speed for small shops. It avoids heavy setup, complex menus, and long training.'
  }
] as const;

const featureHighlights = [
  {
    title: 'Fast Work Orders',
    description:
      'Create a tire job in seconds with service, parts, and notes attached.',
    benefit: 'Keep the bay moving without admin slowdown.'
  },
  {
    title: 'Tire Inventory Clarity',
    description: 'Track tire stock and parts usage with every work order.',
    benefit: 'Avoid missing sizes and emergency reorders.'
  },
  {
    title: 'Customer & Vehicle History',
    description: 'See past rotations, balances, and replacements at a glance.',
    benefit: 'Recommend follow-ups with confidence.'
  },
  {
    title: 'Simple Job Status',
    description:
      'Track jobs from check-in to completion with clear status labels.',
    benefit: 'Reduce confusion across the front desk and bays.'
  },
  {
    title: 'Clean Invoices',
    description: 'Turn completed jobs into professional invoices instantly.',
    benefit: 'Get paid faster and look more professional.'
  },
  {
    title: 'Team Visibility',
    description: 'Assign work to technicians and see workload distribution.',
    benefit: 'Keep labor balanced during peak hours.'
  }
] as const;

export const metadata: Metadata = {
  metadataBase: new URL('https://www.garixo.com'),
  title: 'Garage Management Software for Tire Shops | Garixo',
  description:
    'Garixo helps tire shops manage work orders, tire inventory, and invoicing in one simple system. Built for small shops. Free 14-day trial, no credit card required.',
  keywords: [
    'garage management software for tire shops',
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
    title: 'Garage Management Software for Tire Shops | Garixo',
    description:
      'Create fast tire work orders, track inventory, and invoice quickly with Garixo.',
    type: 'website',
    url: 'https://www.garixo.com/solutions/garage-management-software-for-tire-shops'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Garage Management Software for Tire Shops | Garixo',
    description:
      'Simple tire shop workflow software for work orders, inventory, and invoices.'
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
              Garage Management Software for Tire Shops
            </h1>
            <p className="mx-auto mt-s3 max-w-[820px] text-body text-text-secondary">
              Run fast, organized tire operations with simple work orders,
              inventory tracking, and clean invoices. Garixo keeps your bays
              moving and your customers coming back.
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

        <section className="bg-surface-default py-s12">
          <div className="mx-auto w-full max-w-[1100px] px-s4">
            <div className="text-center">
              <h2 className="text-h2 text-text-primary">
                Features built for tire shop workflow
              </h2>
              <p className="mx-auto mt-s2 max-w-[760px] text-body text-text-secondary">
                Everything you need to manage tire jobs, parts, and team
                workload without the complexity of enterprise software.
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
                  <li>Paper tickets and missing tire sizes.</li>
                  <li>Slow checkouts and delayed invoices.</li>
                  <li>Customers asking about past work with no record.</li>
                </ul>
              </Card>
              <Card className="space-y-s2 border border-border bg-surface-default p-s4">
                <h3 className="text-h3 text-text-primary">After Garixo</h3>
                <ul className="space-y-s2 text-small text-text-secondary">
                  <li>Fast work orders with parts and services attached.</li>
                  <li>Clear inventory visibility for each tire size.</li>
                  <li>Repeat customers with full service history.</li>
                </ul>
              </Card>
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
