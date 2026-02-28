import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { CaseStudyStats } from '@/components/case-studies/CaseStudyStats';
import { LandingFooter } from '@/components/sections/LandingFooter';
import { LandingHeader } from '@/components/sections/LandingHeader';
import { Button } from '@/components/ui/button';
import { caseStudies, getCaseStudyBySlug } from '@/lib/caseStudies';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams(): Array<{ slug: string }> {
  return caseStudies.map((study) => ({ slug: study.slug }));
}

export async function generateMetadata({
  params
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const study = getCaseStudyBySlug(slug);

  if (!study) {
    return {
      title: 'Case Study Not Found | GARIXO'
    };
  }

  return {
    metadataBase: new URL('https://www.garixo.com'),
    title: `${study.garageName} Case Study | GARIXO`,
    description: `See how ${study.garageName} in ${study.city}, ${study.state} improved revenue and shop efficiency using GARIXO garage management software.`,
    alternates: {
      canonical: `/case-studies/${study.slug}`
    },
    openGraph: {
      title: `${study.garageName} Case Study | GARIXO`,
      description: `See how ${study.garageName} in ${study.city}, ${study.state} improved revenue and shop efficiency using GARIXO garage management software.`,
      type: 'article',
      url: `https://www.garixo.com/case-studies/${study.slug}`
    }
  };
}

export default async function CaseStudyDetailPage({
  params
}: PageProps): Promise<JSX.Element> {
  const { slug } = await params;
  const study = getCaseStudyBySlug(slug);

  if (!study) {
    notFound();
  }

  const reviewSchema = {
    '@context': 'https://schema.org',
    '@type': 'Review',
    itemReviewed: {
      '@type': 'SoftwareApplication',
      name: 'GARIXO'
    },
    reviewBody: study.quote,
    author: {
      '@type': 'Person',
      name: study.ownerName
    },
    publisher: {
      '@type': 'Organization',
      name: study.garageName
    }
  };

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'GARIXO',
    url: 'https://www.garixo.com'
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />

      <LandingHeader />
      <main className="bg-surface-default">
        <section className="border-b border-border bg-background-primary py-s16">
          <div className="mx-auto w-full max-w-[1000px] px-s4">
            <p className="text-caption text-text-muted">
              {study.city}, {study.state}
            </p>
            <h1 className="mt-s2 text-[34px] font-bold leading-tight text-text-primary md:text-[48px]">
              {study.garageName} Case Study
            </h1>
            <p className="mt-s3 max-w-[760px] text-body text-text-secondary">
              See how this independent auto repair shop simplified daily
              operations and improved performance with GARIXO.
            </p>
          </div>
        </section>

        <section className="mx-auto w-full max-w-[1000px] space-y-s10 px-s4 py-s16">
          <CaseStudyStats
            yearsInBusiness={study.yearsInBusiness}
            technicians={study.technicians}
            monthlyCars={study.monthlyCars}
          />

          <section aria-labelledby="problem-title">
            <h2 id="problem-title" className="text-h2">
              The Problem
            </h2>
            <ul className="mt-s4 space-y-s2 text-small text-text-secondary">
              {study.before.map((item) => (
                <li
                  key={item}
                  className="rounded-md border border-border bg-background-primary px-s3 py-s2"
                >
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="solution-title">
            <h2 id="solution-title" className="text-h2">
              The Solution
            </h2>
            <ul className="mt-s4 space-y-s2 text-small text-text-secondary">
              {study.after.map((item) => (
                <li
                  key={item}
                  className="rounded-md border border-border bg-background-primary px-s3 py-s2"
                >
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-s4 text-small text-text-secondary">
              Learn more about GARIXO core workflows on our{' '}
              <Link
                href="/features"
                className="font-semibold text-primary-700 hover:text-primary-800"
              >
                features page
              </Link>
              .
            </p>
          </section>

          <section aria-labelledby="results-title">
            <h2 id="results-title" className="text-h2">
              The Results
            </h2>
            <div className="mt-s4 grid gap-s3 sm:grid-cols-3">
              {study.results.map((result) => (
                <div
                  key={result}
                  className="rounded-lg border border-border bg-surface-default p-s4 text-center shadow-xs"
                >
                  <p className="text-small font-semibold text-primary-800">
                    {result}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section aria-labelledby="quote-title">
            <h2 id="quote-title" className="text-h2">
              Owner Quote
            </h2>
            <blockquote className="mt-s4 rounded-lg border border-border bg-background-primary p-s4 text-body text-text-secondary shadow-xs">
              “{study.quote}”
              <footer className="mt-s3 text-small font-semibold text-text-primary">
                {study.ownerName}
              </footer>
            </blockquote>
          </section>
        </section>

        <section className="bg-slate-900 py-s16">
          <div className="mx-auto w-full max-w-[900px] px-s4 text-center">
            <h2 className="text-[30px] font-semibold text-white md:text-[40px]">
              Start Improving Your Shop Today
            </h2>
            <p className="mt-s2 text-body text-slate-300">
              Simple setup. Clear workflow. Better daily operations.
            </p>
            <div className="mt-s5 flex flex-col justify-center gap-s2 sm:flex-row">
              <Button
                asChild
                className="h-12 bg-surface-default text-primary-800 hover:bg-primary-50"
              >
                <Link href="/pricing">Start Your Free Trial</Link>
              </Button>
              <Button
                asChild
                variant="secondary"
                className="h-12 bg-slate-800 text-white hover:bg-slate-700"
              >
                <Link href="/book-demo">Book a Demo</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <LandingFooter />
    </>
  );
}
