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
      'It is a simple system that helps body shops manage repair orders, vehicles, photos, parts, and invoices in one place instead of paper and spreadsheets.'
  },
  {
    question: 'Can Garixo track multi-stage collision repairs?',
    answer:
      'Yes. You can track each stage—teardown, body work, paint, and reassembly—inside a single work order.'
  },
  {
    question: 'Can I keep photo documentation and notes per repair?',
    answer:
      'Yes. Capture notes and attach documentation to the repair so every tech sees the same context.'
  },
  {
    question: 'Can I add detailed notes and context to each repair?',
    answer:
      'Yes. You can add notes, service details, and part references to every work order so the full repair context stays in one place for your team.'
  },
  {
    question: 'Does Garixo help with supplements and mid-repair changes?',
    answer:
      'Yes. You can add parts and labor updates as repairs evolve so the estimate stays accurate.'
  },
  {
    question: 'Will this help reduce cycle time per vehicle?',
    answer:
      'Yes. Clear stage tracking and faster approvals reduce delays and keep repairs moving.'
  },
  {
    question: 'How is Garixo different from enterprise shop software?',
    answer:
      'Garixo focuses on speed and clarity without heavy setup, long training, or complex menus.'
  }
] as const;

const featureHighlights = [
  {
    title: 'Repair Stage Tracking',
    description:
      'Track teardown, body work, paint, and reassembly in one workflow.',
    benefit: 'Reduce bottlenecks and missed handoffs.'
  },
  {
    title: 'Photo Documentation',
    description: 'Track each job stage so your team always knows what is next.',
    benefit: 'Keep documentation organized for every repair.'
  },
  {
    title: 'OEM vs. Aftermarket Parts',
    description: 'Log parts choice per repair with clear cost visibility.',
    benefit: 'Avoid confusion during supplements and approvals.'
  },
  {
    title: 'Supplements & Change Orders',
    description: 'Add parts and labor updates as the repair evolves.',
    benefit: 'Keep estimates accurate without rework.'
  },
  {
    title: 'Paint & Materials Tracking',
    description: 'Capture paint and materials cost per job.',
    benefit: 'Protect margin on every repair.'
  },
  {
    title: 'Faster Billing',
    description: 'Turn completed repairs into clean invoices quickly.',
    benefit: 'Reduce delays at delivery.'
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

        <section className="bg-surface-default py-s12">
          <div className="mx-auto w-full max-w-[1100px] px-s4">
            <div className="text-center">
              <h2 className="text-h2 text-text-primary">
                Insurance-ready documentation without the chaos
              </h2>
              <p className="mx-auto mt-s2 max-w-[760px] text-body text-text-secondary">
                Keep claim-related details together so approvals and supplements
                do not slow down delivery.
              </p>
            </div>
            <div className="mt-s6 grid gap-s4 md:grid-cols-3">
              <Card className="space-y-s2 p-s4">
                <h3 className="text-h3 text-text-primary">
                  Photo & Note Timeline
                </h3>
                <p className="text-small text-text-secondary">
                  Store documentation by repair stage so everyone sees the same
                  evidence.
                </p>
              </Card>
              <Card className="space-y-s2 p-s4">
                <h3 className="text-h3 text-text-primary">
                  Supplement Tracking
                </h3>
                <p className="text-small text-text-secondary">
                  Add parts and labor updates mid-repair without losing the
                  original estimate.
                </p>
              </Card>
              <Card className="space-y-s2 p-s4">
                <h3 className="text-h3 text-text-primary">
                  OEM vs. Aftermarket
                </h3>
                <p className="text-small text-text-secondary">
                  Track part decisions clearly for insurers and customers.
                </p>
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

        <section className="bg-surface-default py-s12">
          <div className="mx-auto w-full max-w-[1000px] px-s4">
            <div className="grid gap-s4 md:grid-cols-2">
              <Card className="space-y-s2 border border-border bg-surface-default p-s4">
                <h3 className="text-h3 text-text-primary">Before Garixo</h3>
                <ul className="space-y-s2 text-small text-text-secondary">
                  <li>Repair stages tracked on paper or whiteboards.</li>
                  <li>Photo documentation scattered across devices.</li>
                  <li>Supplements handled outside the job record.</li>
                </ul>
              </Card>
              <Card className="space-y-s2 border border-border bg-surface-default p-s4">
                <h3 className="text-h3 text-text-primary">After Garixo</h3>
                <ul className="space-y-s2 text-small text-text-secondary">
                  <li>Stage-by-stage visibility from intake to delivery.</li>
                  <li>Parts, materials, and supplements in one record.</li>
                  <li>Faster approvals and cleaner invoicing.</li>
                </ul>
              </Card>
            </div>
          </div>
        </section>

        <section className="bg-background-primary py-s12">
          <div className="mx-auto w-full max-w-[980px] px-s4 text-center">
            <h2 className="text-h2 text-text-primary">
              Improve cycle time per vehicle
            </h2>
            <p className="mx-auto mt-s3 max-w-[720px] text-body text-text-secondary">
              Clear stage tracking, fast supplements, and organized
              documentation reduce days per repair and keep bays flowing.
            </p>
            <div className="mt-s6 flex flex-col justify-center gap-s2 sm:flex-row">
              <Button asChild className="h-12">
                <Link href="/auth/sign-up">Start Free Trial</Link>
              </Button>
              <Button asChild variant="secondary" className="h-12">
                <Link href="/features/customer-management">
                  Customer Management System
                </Link>
              </Button>
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
