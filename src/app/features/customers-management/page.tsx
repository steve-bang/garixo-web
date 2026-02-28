import type { Metadata } from 'next';
import Link from 'next/link';

import { LandingFooter } from '@/components/sections/LandingFooter';
import { LandingHeader } from '@/components/sections/LandingHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export const revalidate = false;

const faqItems = [
  {
    question: 'What is auto repair customer management software?',
    answer:
      'Auto repair customer management software helps garages store customer profiles, linked vehicles, and service history in one searchable system.'
  },
  {
    question: 'Why does a small garage need a customer tracking system?',
    answer:
      'It helps owners remember past repairs, reduce missed follow-up, and increase repeat customer visits without relying on paper notes.'
  },
  {
    question: 'Can I see full service history per customer?',
    answer:
      'Yes. Garixo shows customer history with related work orders, visits, and spending context in one place.'
  },
  {
    question: 'Does Garixo connect customers to work orders?',
    answer:
      'Yes. Customer records connect directly to work orders so your team can review context before creating new jobs.'
  },
  {
    question: 'Can I link customers and vehicles together?',
    answer:
      'Yes. Garixo uses a scalable customer-to-vehicle relationship so you can view customer vehicles and related service history clearly.'
  },
  {
    question: 'Is this a full enterprise CRM system?',
    answer:
      'No. Garixo is a simple, practical customer management system built for independent auto shops, not enterprise CRM complexity.'
  },
  {
    question: 'How is Garixo different from enterprise CRM tools?',
    answer:
      'Garixo focuses on shop workflow speed, service history, and repeat revenue for small garages instead of broad corporate CRM features.'
  },
  {
    question: 'Can I access this on mobile?',
    answer:
      'Yes. Garixo is mobile-friendly so owners and staff can search customer records quickly from phone or tablet.'
  }
] as const;

const coreFeatures = [
  {
    title: 'Customer Profile Management',
    description:
      'Store customer details in one clear profile for daily operations.',
    benefit: 'Build trust with faster and more personal service.'
  },
  {
    title: 'Vehicle Linking System',
    description:
      'Link customer records to related vehicles with a scalable model.',
    benefit: 'Avoid confusion and reduce service mistakes.'
  },
  {
    title: 'Full Service History Timeline',
    description:
      'Review recent jobs and service patterns before new work starts.',
    benefit: 'Recommend better maintenance and increase repeat visits.'
  },
  {
    title: 'Work Order History Integration',
    description: 'Customer records connect directly with repair job history.',
    benefit: 'No time wasted searching across disconnected records.'
  },
  {
    title: 'Internal Notes and Comments',
    description: 'Capture important context, preferences, and service notes.',
    benefit: 'Deliver consistent service across your team.'
  },
  {
    title: 'Smart Search and Filters',
    description: 'Find customers by name, phone, and linked vehicle plate.',
    benefit: 'Serve faster during busy shop hours.'
  },
  {
    title: 'Repeat Visit Tracking',
    description:
      'Track customer activity, returning rate, and spending behavior.',
    benefit: 'Focus attention on high-value relationships.'
  },
  {
    title: 'Communication Record Context',
    description:
      'Use profile notes to keep follow-up and service context clear.',
    benefit: 'Improve retention with more reliable customer experience.'
  }
] as const;

export const metadata: Metadata = {
  metadataBase: new URL('https://www.garixo.com'),
  title: 'Auto Repair Customer Management Software | Garixo',
  description:
    'Track customer profiles, vehicles, and service history in one simple garage customer management system built for independent auto shops.',
  keywords: [
    'auto repair customer management software',
    'garage customer management system',
    'auto shop CRM software',
    'mechanic customer tracking software',
    'customer history tracking auto repair',
    'small auto shop CRM',
    'repair shop customer database',
    'track repeat customers',
    'auto shop customer records',
    'garage service history software'
  ],
  alternates: {
    canonical: '/features/customers-management'
  },
  robots: {
    index: true,
    follow: true
  },
  openGraph: {
    title: 'Auto Repair Customer Management Software | Garixo',
    description:
      'A simple customer management system for independent garages to track history, improve retention, and increase repeat revenue.',
    type: 'website',
    url: 'https://www.garixo.com/features/customers-management'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Garage Customer Management System | Garixo',
    description:
      'Track customer history, linked vehicles, and repeat visits with simple auto shop CRM software.'
  }
};

export default function CustomersManagementFeaturePage(): JSX.Element {
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
        name: 'Customers Management',
        item: 'https://www.garixo.com/features/customers-management'
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
              Auto Repair Customer Management Software Built for Independent
              Garages
            </h1>
            <p className="mx-auto mt-s3 max-w-[820px] text-body text-text-secondary">
              Remember every customer, every vehicle, and every visit in one
              clean garage customer management system that helps increase repeat
              business.
            </p>
            <p className="mx-auto mt-s3 max-w-[820px] rounded-md border border-primary-200 bg-primary-50 px-s4 py-s3 text-small text-primary-900">
              John owns a 3-bay garage. A customer asks about a repair from 8
              months ago. Instead of searching old papers, John opens Garixo and
              sees the customer profile, vehicle, and work history in seconds.
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
              Your Customers Should Feel Remembered - Not Forgotten
            </h2>
            <p className="mt-s3 max-w-[860px] text-body text-text-secondary">
              When customer information is scattered, service quality drops and
              repeat revenue gets harder to grow.
            </p>
            <div className="mt-s6 grid gap-s3 md:grid-cols-2">
              <Card className="p-s4">
                <h3 className="text-h3">What goes wrong</h3>
                <ul className="mt-s2 list-disc space-y-s1 pl-s6 text-small text-text-secondary">
                  <li>No clear service history when customer returns</li>
                  <li>No direct link between customer and vehicles</li>
                  <li>Missed upsell opportunities and follow-up context</li>
                  <li>No visibility into repeat visits and spend trends</li>
                </ul>
              </Card>
              <Card className="p-s4">
                <h3 className="text-h3">Business impact</h3>
                <ul className="mt-s2 list-disc space-y-s1 pl-s6 text-small text-text-secondary">
                  <li>Customers feel unknown and less likely to come back</li>
                  <li>More time wasted searching old records</li>
                  <li>Inconsistent service quality across team members</li>
                  <li>Lower retention and lower lifetime value</li>
                </ul>
              </Card>
            </div>

            <div className="mt-s4 grid gap-s3 sm:grid-cols-3">
              <Card className="border-primary-200 bg-primary-50 p-s4">
                <h3 className="text-h3 text-primary-900">Faster service</h3>
                <p className="mt-s1 text-small text-primary-900">
                  Pull customer and vehicle context in seconds.
                </p>
              </Card>
              <Card className="border-success-200 bg-success-50 p-s4">
                <h3 className="text-h3 text-success-900">Higher retention</h3>
                <p className="mt-s1 text-small text-success-900">
                  Keep returning customers with better follow-up quality.
                </p>
              </Card>
              <Card className="border-warning-200 bg-warning-50 p-s4">
                <h3 className="text-h3 text-warning-900">More revenue</h3>
                <p className="mt-s1 text-small text-warning-900">
                  Use customer history to recommend the right next service.
                </p>
              </Card>
            </div>
          </div>
        </section>

        <section className="border-b border-border bg-background-primary py-s12">
          <div className="mx-auto w-full max-w-[980px] px-s4">
            <h2 className="text-[30px] font-semibold leading-tight text-text-primary md:text-[38px]">
              Before Garixo vs After Garixo
            </h2>
            <div className="mt-s4 grid gap-s3 md:grid-cols-2">
              <Card className="p-s4">
                <h3 className="text-h3 text-error-800">Before Garixo</h3>
                <ul className="mt-s2 list-disc space-y-s1 pl-s6 text-small text-text-secondary">
                  <li>Searching papers and old notes</li>
                  <li>No clear customer service history</li>
                  <li>Guessing what was done last time</li>
                  <li>Losing repeat revenue opportunities</li>
                </ul>
              </Card>
              <Card className="p-s4">
                <h3 className="text-h3 text-success-800">After Garixo</h3>
                <ul className="mt-s2 list-disc space-y-s1 pl-s6 text-small text-text-secondary">
                  <li>One-click customer profile</li>
                  <li>Full timeline of service and visits</li>
                  <li>Clear vehicle linkage for every customer</li>
                  <li>Higher retention and better repeat business</li>
                </ul>
              </Card>
            </div>
          </div>
        </section>

        <section className="border-b border-border bg-background-primary py-s12">
          <div className="mx-auto w-full max-w-[980px] px-s4">
            <h2 className="text-[30px] font-semibold leading-tight text-text-primary md:text-[38px]">
              A Simple Garage Customer Management System That Just Works
            </h2>
            <p className="mt-s3 max-w-[860px] text-body text-text-secondary">
              Garixo gives your shop one place to manage customer profiles,
              linked vehicles, service history, notes, and search filters with a
              clean dashboard designed for non-technical teams.
            </p>
            <div className="mt-s4 grid gap-s3 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="p-s4">
                <h3 className="text-h3">Centralized profiles</h3>
                <p className="mt-s2 text-small text-text-secondary">
                  Keep customer records complete and easy to update.
                </p>
              </Card>
              <Card className="p-s4">
                <h3 className="text-h3">Vehicle and work order linkage</h3>
                <p className="mt-s2 text-small text-text-secondary">
                  See related vehicles and job history without switching tools.
                </p>
              </Card>
              <Card className="p-s4">
                <h3 className="text-h3">Fast search and filters</h3>
                <p className="mt-s2 text-small text-text-secondary">
                  Find customers by name, phone, and vehicle plate quickly.
                </p>
              </Card>
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
                <h3 className="mt-s1 text-h3">Create customer profile</h3>
                <p className="mt-s2 text-small text-text-secondary">
                  Add contact details and basic notes once.
                </p>
              </Card>
              <Card className="p-s4">
                <p className="text-primary text-caption font-semibold">
                  Step 2
                </p>
                <h3 className="mt-s1 text-h3">Link vehicles and jobs</h3>
                <p className="mt-s2 text-small text-text-secondary">
                  Connect customer to vehicle and work-order history.
                </p>
              </Card>
              <Card className="p-s4">
                <p className="text-primary text-caption font-semibold">
                  Step 3
                </p>
                <h3 className="mt-s1 text-h3">Search and serve faster</h3>
                <p className="mt-s2 text-small text-text-secondary">
                  Use history context to deliver better repeat service.
                </p>
              </Card>
            </div>
          </div>
        </section>

        <section className="border-b border-border bg-background-primary py-s12">
          <div className="mx-auto w-full max-w-[980px] px-s4">
            <h2 className="text-[30px] font-semibold leading-tight text-text-primary md:text-[38px]">
              Turn First-Time Customers Into Long-Term Revenue
            </h2>
            <p className="mt-s3 max-w-[860px] text-body text-text-secondary">
              Customer history is your garage memory. Use it to improve
              recommendations, increase repeat visits, and build long-term trust
              that grows monthly revenue.
            </p>
            <ul className="mt-s4 list-disc space-y-s1 pl-s6 text-small text-text-secondary">
              <li>Identify loyal customers and protect retention</li>
              <li>Recommend maintenance based on visit history</li>
              <li>Increase customer lifetime value with better context</li>
              <li>Build consistent, trust-based service quality</li>
            </ul>
          </div>
        </section>

        <section className="border-b border-border bg-background-primary py-s12">
          <div className="mx-auto w-full max-w-[980px] px-s4">
            <h2 className="text-[30px] font-semibold leading-tight text-text-primary md:text-[38px]">
              Who It&apos;s For
            </h2>
            <ul className="mt-s4 grid gap-s2 text-small text-text-secondary sm:grid-cols-2 lg:grid-cols-3">
              <li>General repair shops</li>
              <li>Tire shops</li>
              <li>Quick lube shops</li>
              <li>Mobile mechanics</li>
              <li>Growing garages</li>
            </ul>

            <h3 className="mt-s8 text-h2">Related Tools to Run Your Shop</h3>
            <p className="mt-s2 text-small text-text-secondary">
              Connect customer data with your full repair workflow:
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
                href="/features/vehicle-management"
                className="group flex items-center justify-between rounded-md border border-border bg-surface-default px-s3 py-s3 text-small text-text-primary transition-colors hover:border-primary-300 hover:bg-primary-50"
              >
                <span className="font-medium">Vehicle History Tracking</span>
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
              Build Stronger Customer Relationships Starting Today
            </h2>
            <p className="mx-auto mt-s2 max-w-[720px] text-body text-slate-300">
              Keep service history clear, improve retention, and grow repeat
              revenue with a simple customer system your team can use daily.
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
