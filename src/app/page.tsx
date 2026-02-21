import type { Metadata } from 'next';

import { StructuredData } from '@/components/SEO/StructuredData';
import { CTA } from '@/components/sections/CTA';
import { Hero } from '@/components/sections/Hero';
import { Problem } from '@/components/sections/Problem';
import { Solution } from '@/components/sections/Solution';
import { Trust } from '@/components/sections/Trust';

export const revalidate = false;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Garage Management Software for Auto Repair Shops | Garixo',
    description:
      'Garixo is a powerful garage management software helping auto repair shop owners manage vehicles, technicians, inventory and profit in one simple system.',
    alternates: {
      canonical: '/'
    },
    openGraph: {
      title: 'Garage Management Software for Auto Repair Shops | Garixo',
      description:
        'Garixo is a powerful garage management software helping auto repair shop owners manage vehicles, technicians, inventory and profit in one simple system.',
      type: 'website',
      url: '/'
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Garage Management Software for Auto Repair Shops | Garixo',
      description:
        'Garixo is a powerful garage management software helping auto repair shop owners manage vehicles, technicians, inventory and profit in one simple system.'
    }
  };
}

export default function HomePage(): JSX.Element {
  return (
    <>
      <StructuredData />
      <Hero />
      <Problem />
      <Solution />
      <Trust />
      <CTA />
    </>
  );
}
