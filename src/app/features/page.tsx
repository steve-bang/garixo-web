import type { Metadata } from 'next';
import Link from 'next/link';

import { FeaturesStructuredData } from '@/components/SEO/FeaturesStructuredData';
import { FeatureSection } from '@/components/features/FeatureSection';
import { FeaturesFaq } from '@/components/features/FeaturesFaq';
import { FeaturesSubnav } from '@/components/features/FeaturesSubnav';
import { coreFeatures } from '@/components/features/features-data';
import { LandingFooter } from '@/components/sections/LandingFooter';
import { LandingHeader } from '@/components/sections/LandingHeader';
import { Button } from '@/components/ui/button';

export const revalidate = false;

export const metadata: Metadata = {
  metadataBase: new URL('https://www.garixo.com'),
  title:
    'Garage Management System Features — Work Orders, Inventory & Staff | Garixo',
  description:
    'Explore Garixo’s garage management software features for auto repair shops — work orders, customers, inventory, staff, and invoices in one simple dashboard built for small shops.',
  keywords: [
    'garage management system',
    'auto repair shop management system',
    'workshop management software features',
    'automotive repair management tools',
    'garage inventory management software',
    'technician management software for auto shops'
  ],
  alternates: {
    canonical: '/features'
  },
  robots: {
    index: true,
    follow: true
  },
  openGraph: {
    title:
      'Garage Management System Features — Work Orders, Inventory & Staff | Garixo',
    description:
      'Explore Garixo’s garage management software features for auto repair shops — work orders, customers, inventory, staff, and invoices in one simple dashboard built for small shops.',
    type: 'website',
    url: 'https://www.garixo.com/features'
  }
};

export default function FeaturesPage(): JSX.Element {
  return (
    <>
      <FeaturesStructuredData />
      <LandingHeader />
      <FeaturesSubnav />

      <main>
        <section
          className="border-b border-border bg-background-primary py-s16"
          aria-labelledby="features-page-title"
        >
          <div className="mx-auto w-full max-w-[1000px] px-s4 text-center">
            <h1
              id="features-page-title"
              className="text-[36px] font-bold leading-tight md:text-[52px]"
            >
              Garage Management System Features: Work Orders, Inventory, Staff &
              Customers
            </h1>

            <p className="mx-auto mt-s3 max-w-[820px] text-body text-text-secondary">
              Garixo combines vehicle workflow, technician management, inventory
              control, and financial reporting in one clear auto repair shop
              management system built for non-technical garage owners.
            </p>

            <div className="mt-s6 flex flex-col justify-center gap-s2 sm:flex-row">
              <Button asChild className="h-12">
                <Link href="/auth/sign-up">Book Free Demo</Link>
              </Button>
              <Button asChild variant="secondary" className="h-12">
                <Link href="/pricing">View Pricing</Link>
              </Button>
            </div>
          </div>
        </section>

        {coreFeatures.map((feature, index) => (
          <FeatureSection
            key={feature.id}
            feature={feature}
            reverse={index % 2 === 1}
            imagePriority={index === 0}
          />
        ))}

        <section className="bg-slate-900 py-s12">
          <div className="mx-auto w-full max-w-[900px] px-s4 text-center">
            <h2 className="text-[30px] font-semibold text-white md:text-[40px]">
              Ready to Upgrade Your Workshop Operations?
            </h2>
            <p className="mt-s2 text-body text-slate-300">
              Replace spreadsheets. Gain control. Increase daily profit.
            </p>
            <div className="mt-s4 flex flex-col justify-center gap-s2 sm:flex-row">
              <Button
                asChild
                className="h-12 bg-surface-default text-primary-800 hover:bg-primary-50"
              >
                <Link href="/auth/sign-up">Schedule Your Free Demo</Link>
              </Button>
              <Button
                asChild
                variant="secondary"
                className="h-12 bg-slate-800 text-white hover:bg-slate-700"
              >
                <Link href="/pricing">Compare Plans</Link>
              </Button>
            </div>
          </div>
        </section>

        <FeaturesFaq />
      </main>

      <LandingFooter />
    </>
  );
}
