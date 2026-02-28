import type { Metadata } from 'next';
import Link from 'next/link';

import { CaseStudyCard } from '@/components/case-studies/CaseStudyCard';
import { CaseStudyHero } from '@/components/case-studies/CaseStudyHero';
import { LandingFooter } from '@/components/sections/LandingFooter';
import { LandingHeader } from '@/components/sections/LandingHeader';
import { Button } from '@/components/ui/button';
import { caseStudies } from '@/lib/caseStudies';

export const revalidate = false;

export async function generateMetadata(): Promise<Metadata> {
  return {
    metadataBase: new URL('https://www.garixo.com'),
    title: 'Garage Management Software Case Studies | GARIXO',
    description:
      'Real success stories from independent auto repair shops using GARIXO to increase revenue and simplify daily operations.',
    keywords: [
      'garage management software case studies',
      'auto repair shop management software',
      'independent auto shop success stories',
      'garage operations software'
    ],
    alternates: {
      canonical: '/case-studies'
    },
    robots: {
      index: true,
      follow: true
    },
    openGraph: {
      title: 'Garage Management Software Case Studies | GARIXO',
      description:
        'Real success stories from independent auto repair shops using GARIXO to increase revenue and simplify daily operations.',
      type: 'website',
      url: 'https://www.garixo.com/case-studies'
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Garage Management Software Case Studies | GARIXO',
      description:
        'Real success stories from independent auto repair shops using GARIXO to increase revenue and simplify daily operations.'
    }
  };
}

export default function CaseStudiesPage(): JSX.Element {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'GARIXO',
    url: 'https://www.garixo.com',
    description:
      'Garage management software for independent auto repair shop owners in the United States.'
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />

      <LandingHeader />
      <section>
        <CaseStudyHero />

        <section
          className="bg-surface-default py-s16"
          aria-label="Case studies list"
        >
          <div className="mx-auto w-full max-w-[1200px] px-s4">
            <div className="grid gap-s4 md:grid-cols-2 xl:grid-cols-3">
              {caseStudies.map((study) => (
                <CaseStudyCard key={study.slug} study={study} />
              ))}
            </div>
          </div>
        </section>
      </section>
      <LandingFooter />
    </>
  );
}
