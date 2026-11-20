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
  title: 'Garage Management Software for Independent Shops | Garixo',
  description:
    'Garixo is all-in-one garage management software for auto repair shops. Track vehicles, technicians & inventory. See daily profit clearly. Setup in minutes.',
  keywords: [
    'garage management software',
    'auto repair shop management software',
    'auto shop management system',
    'workshop management software',
    'garage management system for small shops',
    'auto repair shop management system',
    'vehicle repair tracking software',
    'car workshop software',
    'best garage management software',
    'auto repair shop profit tracking',
    'garage software with inventory management',
    'workshop management system',
    'auto repair business software',
    'garage job management software'
  ],
  alternates: {
    canonical: '/'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1
    }
  },
  openGraph: {
    title: 'Garixo: Garage Management Software for Auto Shops',
    description:
      'Garixo is all-in-one garage management software for auto repair shops. Track vehicles, technicians & inventory. See daily profit clearly. Setup in minutes.',
    type: 'website',
    url: 'https://www.garixo.com/',
    siteName: 'Garixo',
    locale: 'en_US',
    images: [
      {
        url: 'https://www.garixo.com/images/og-image.png',
        alt: 'Global auto repair shop management software overview by Garixo',
        width: 1200,
        height: 630
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Garixo: Garage Management Software for Auto Shops',
    description:
      'Garixo is all-in-one garage management software for auto repair shops. Track vehicles, technicians & inventory. See daily profit clearly. Setup in minutes.',
    site: '@garixo',
    images: ['https://www.garixo.com/images/og-image.png']
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
