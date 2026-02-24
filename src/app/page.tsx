import type { Metadata } from 'next';

import { StructuredData } from '@/components/SEO/StructuredData';
import { CTA } from '@/components/sections/CTA';
import { Hero } from '@/components/sections/Hero';
import { LandingFooter } from '@/components/sections/LandingFooter';
import { LandingHeader } from '@/components/sections/LandingHeader';
import { Problem } from '@/components/sections/Problem';
import { Solution } from '@/components/sections/Solution';
import { Trust } from '@/components/sections/Trust';

export const revalidate = false;

export const metadata: Metadata = {
  metadataBase: new URL('https://garixo.com'),
  title: 'Garage Management Software for Auto Repair Shops | Garixo',
  description:
    'Garixo is a powerful garage management software helping auto repair shop owners manage vehicles, technicians, inventory and profit in one simple system.',
  keywords: [
    'garage management software',
    'auto repair shop management software',
    'auto shop management system',
    'workshop management software',
    'automotive repair management software'
  ],
  alternates: {
    canonical: '/'
  },
  robots: {
    index: true,
    follow: true
  },
  openGraph: {
    title: 'Garage Management Software for Auto Repair Shops | Garixo',
    description:
      'Garixo is a powerful garage management software helping auto repair shop owners manage vehicles, technicians, inventory and profit in one simple system.',
    type: 'website',
    url: 'https://garixo.com/'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Garage Management Software for Auto Repair Shops | Garixo',
    description:
      'Garixo is a powerful garage management software helping auto repair shop owners manage vehicles, technicians, inventory and profit in one simple system.'
  }
};

export default function HomePage(): JSX.Element {
  return (
    <>
      <StructuredData />
      <LandingHeader />
      <main>
        <Hero />
        <Problem />
        <Solution />
        <Trust />
        <CTA />
      </main>
      <LandingFooter />
    </>
  );
}
