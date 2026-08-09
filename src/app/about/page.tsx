import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { LandingFooter } from '@/components/sections/LandingFooter';
import { LandingHeader } from '@/components/sections/LandingHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export const revalidate = false;

export const metadata: Metadata = {
  metadataBase: new URL('https://www.garixo.com'),
  title: 'About Garixo | Our Story',
  description:
    'Meet Steve, the founder of Garixo, and discover why he built a simple shop management platform to help independent auto repair shops spend less time managing their business and more time doing what they do best.',
  alternates: {
    canonical: '/about'
  },
  robots: {
    index: true,
    follow: true
  },
  openGraph: {
    title: 'About Garixo | Our Story',
    description:
      'Why I built Garixo to help independent auto repair shops run their business with less complexity.',
    type: 'website',
    url: 'https://www.garixo.com/about',
    siteName: 'Garixo',
    locale: 'en_US',
    images: [
      {
        url: 'https://www.garixo.com/images/steve-bang.jpg',
        alt: 'Steve, founder of Garixo, working in an auto repair shop',
        width: 1254,
        height: 1254
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Garixo | Our Story',
    description:
      'Why I built Garixo to help independent auto repair shops run their business with less complexity.',
    images: ['https://www.garixo.com/images/steve-bang.jpg']
  }
};

const storyParagraphs = [
  'I know what a busy day in a garage feels like. Cars coming in and out. Customers waiting for updates. Repair orders, parts, invoices, phone calls — and a hundred small things that need to be remembered.',
  'I saw hardworking people who were incredibly good at fixing cars, but often had to spend too much time managing everything around the repair. And that stayed with me.',
  'I started thinking: what if technology could take some of that weight off their shoulders?',
  'So I started building Garixo. Not because I wanted to build another piece of software, but because I wanted to build something I wished those shops had — something simple, practical, and designed around the people who actually work in a garage.'
];

export default function AboutPage(): JSX.Element {
  const aboutPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About Garixo | Our Story',
    url: 'https://www.garixo.com/about',
    description:
      'The story behind Garixo, garage management software built from experience in auto repair shops.',
    mainEntity: {
      '@type': 'Person',
      name: 'Steve Bang',
      jobTitle: 'Founder of Garixo',
      image: 'https://www.garixo.com/images/steve-bang.jpg',
      worksFor: {
        '@type': 'Organization',
        name: 'Garixo',
        url: 'https://www.garixo.com'
      }
    }
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
        name: 'Case Studies',
        item: 'https://www.garixo.com/about'
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutPageSchema) }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <LandingHeader />

      <main>
        <section
          className="border-b border-border bg-background-primary"
          aria-labelledby="about-title"
        >
          <div className="mx-auto grid w-full max-w-[1200px] gap-s8 px-s4 py-s12 lg:grid-cols-2 lg:items-center lg:py-s16">
            <div className="order-2 space-y-s4 lg:order-1">
              <p className="text-caption font-semibold uppercase tracking-[0.16em] text-primary-700">
                My story
              </p>
              <h1
                id="about-title"
                className="max-w-[660px] text-[38px] font-bold leading-[1.05] text-text-primary md:text-[56px]"
              >
                I didn&apos;t build Garixo from a distance. I built it from
                experience.
              </h1>
              <p className="max-w-[590px] text-body text-text-secondary">
                I&apos;m Steve — a software engineer who has also spent time
                working inside auto repair shops. Garixo was built for the real
                work behind every repair, not just the work on the car.
              </p>
            </div>

            <Card className="order-1 overflow-hidden rounded-xl p-s2 shadow-md lg:order-2">
              <Image
                src="/images/steve-bang.jpg"
                alt="Steve, founder of Garixo, working in an auto repair shop"
                width={1254}
                height={1254}
                className="aspect-square w-full rounded-lg object-cover"
                sizes="(max-width: 1024px) calc(100vw - 2rem), 50vw"
                priority
              />
            </Card>
          </div>
        </section>

        <section
          className="bg-background-primary py-s16"
          aria-labelledby="story-title"
        >
          <div className="mx-auto grid w-full max-w-[1000px] gap-s8 px-s4 lg:grid-cols-[180px_minmax(0,1fr)]">
            <div>
              <h2 id="story-title" className="text-h2">
                Why I started
              </h2>
            </div>
            <div className="max-w-[700px] space-y-s4 text-body leading-7 text-text-secondary">
              {storyParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </section>

        <section
          className="bg-background-secondary py-s12"
          aria-labelledby="mission-title"
        >
          <div className="mx-auto w-full max-w-[1000px] px-s4">
            <Card className="border-primary-200 bg-primary-50 p-s6 md:p-s8">
              <p className="text-caption font-semibold uppercase tracking-[0.16em] text-primary-700">
                The mission
              </p>
              <h2
                id="mission-title"
                className="mt-s3 max-w-[780px] text-[30px] font-semibold leading-tight text-text-primary md:text-[42px]"
              >
                Give shop owners less to manage, so they have more time to do
                what they do best — take care of cars and take care of people.
              </h2>
              <p className="mt-s4 max-w-[700px] text-body text-text-secondary">
                Garixo brings together the hands-on reality of the garage and
                the power of technology, so independent shops can spend less
                time on operational burden and more time serving their customers
                and building their business.
              </p>
            </Card>
          </div>
        </section>

        <section
          className="bg-background-primary py-s16"
          aria-labelledby="closing-title"
        >
          <div className="mx-auto w-full max-w-[760px] px-s4 text-center">
            <h2
              id="closing-title"
              className="text-[30px] font-semibold md:text-[40px]"
            >
              This is just the beginning.
            </h2>
            <p className="mt-s3 text-body text-text-secondary">
              I&apos;m building Garixo to make the daily work of running an auto
              repair shop simpler, clearer, and easier to manage.
            </p>
            <div className="mt-s6">
              <p className="font-semibold text-text-primary">Steve</p>
              <p className="text-small text-text-muted">Founder of Garixo</p>
            </div>
            <Button asChild className="mt-s6 h-12 min-h-12">
              <Link href="/features">Explore Garixo</Link>
            </Button>
          </div>
        </section>
      </main>

      <LandingFooter />
    </>
  );
}
