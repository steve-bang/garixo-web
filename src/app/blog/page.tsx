import type { Metadata } from 'next';
import Link from 'next/link';

import {
  listBlogCategories,
  listPublishedBlogs
} from '@/app/api/blogs/blogs-db';
import { LandingFooter } from '@/components/sections/LandingFooter';
import { LandingHeader } from '@/components/sections/LandingHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BlogIndex } from '@/features/blogs/components/blog-index';

export const revalidate = 300;

export const metadata: Metadata = {
  metadataBase: new URL('https://www.garixo.com'),
  title: 'Garage Management Blog for Auto Repair Shops | Garixo',
  description:
    'Practical guides for independent auto repair shop owners. Learn to cut profit leaks, improve daily workflow, and grow revenue. Free articles weekly.',
  alternates: {
    canonical: '/blog'
  },
  keywords: [
    'auto repair shop management blog',
    'auto repair shop blog',
    'garage owner resources',
    'auto shop business tips',
    'automotive repair guides',
    'car repair shop articles'
  ],
  robots: {
    index: true,
    follow: true
  },
  openGraph: {
    title: 'Garage Management Blog for Auto Repair Shops | Garixo',
    description:
      'Practical guides for independent auto repair shop owners. Learn to cut profit leaks, improve daily workflow, and grow revenue. Free articles weekly.',
    type: 'website',
    url: 'https://www.garixo.com/blog'
  }
};

export default async function BlogIndexPage(): Promise<JSX.Element> {
  const [posts, categories] = await Promise.all([
    listPublishedBlogs(),
    listBlogCategories()
  ]);

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Garixo Blog',
    url: 'https://www.garixo.com/blog',
    description:
      'Educational content for independent auto repair shop owners in the USA.'
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
        name: 'Blog',
        item: 'https://www.garixo.com/blog'
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <LandingHeader />
      <main>
        <section className="border-b border-border bg-background-primary py-s12">
          <div className="mx-auto w-full max-w-[980px] space-y-s4 px-s4 text-center">
            <p className="inline-flex items-center rounded-full border border-primary-100 bg-primary-50 px-s3 py-s1 text-caption font-semibold text-primary-700">
              Garixo Blog
            </p>
            <h1 className="text-[34px] font-bold leading-tight text-text-primary md:text-[52px]">
              Garixo Blog
            </h1>
            <p className="mx-auto mt-s3 max-w-[760px] text-body text-text-secondary">
              Practical guides for independent garage owners. Learn simple ways
              to run your shop smoother, save time, and grow daily revenue.
            </p>
            <div className="flex flex-col justify-center gap-s2 pt-s1 sm:flex-row">
              <Button asChild className="h-11">
                <Link href="/auth/sign-up">Start Free Trial</Link>
              </Button>
              <Button asChild variant="secondary" className="h-11">
                <Link href="/pricing">View Pricing</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="bg-background-primary py-s10">
          {posts.length === 0 ? (
            <div className="mx-auto w-full max-w-[760px] px-s4">
              <Card className="space-y-s3 p-s6 text-center">
                <h2 className="text-h2 text-text-primary">
                  No articles published yet
                </h2>
                <p className="text-small text-text-secondary">
                  We are preparing practical guides for independent garage
                  owners. Please check back soon.
                </p>
                <div className="flex flex-col justify-center gap-s2 pt-s1 sm:flex-row">
                  <Button asChild variant="secondary">
                    <Link href="/">Go to homepage</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/pricing">View Pricing</Link>
                  </Button>
                </div>
              </Card>
            </div>
          ) : null}

          {posts.length > 0 ? (
            <BlogIndex posts={posts} categories={categories} />
          ) : null}
        </section>
      </main>
      <LandingFooter />
    </>
  );
}
