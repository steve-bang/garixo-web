import type { Metadata } from 'next';
import Link from 'next/link';

import { listPublishedBlogs } from '@/app/api/blogs/blogs-db';
import { LandingFooter } from '@/components/sections/LandingFooter';
import { LandingHeader } from '@/components/sections/LandingHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatDate } from '@/lib/utils/format';

export const revalidate = 300;

export const metadata: Metadata = {
  metadataBase: new URL('https://www.garixo.com'),
  title: 'Garage Management Blog for Auto Repair Shops | Garixo',
  description:
    'SEO guides and practical tips for independent auto repair shop owners to improve operations, team productivity, and daily revenue.',
  alternates: {
    canonical: '/blog'
  },
  robots: {
    index: true,
    follow: true
  },
  openGraph: {
    title: 'Garage Management Blog | Garixo',
    description:
      'Actionable guides for independent garage owners on work orders, customers, inventory, and staff operations.',
    type: 'website',
    url: 'https://www.garixo.com/blog'
  }
};

export default async function BlogIndexPage(): Promise<JSX.Element> {
  const posts = await listPublishedBlogs();

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Garixo Blog',
    url: 'https://www.garixo.com/blog',
    description:
      'Educational content for independent auto repair shop owners in the USA.'
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
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
          ) : (
            <div className="mx-auto mb-s4 w-full max-w-[980px] px-s4">
              <p className="text-small text-text-muted">
                Showing {posts.length} practical article
                {posts.length > 1 ? 's' : ''} for garage owners.
              </p>
            </div>
          )}

          {posts.length > 0 ? (
            <div className="mx-auto grid w-full max-w-[980px] gap-s4 px-s4 md:grid-cols-2">
              {posts.map((post) => (
                <article key={post.id} className="group">
                  <Card className="flex h-full flex-col rounded-xl border border-border p-s4 shadow-sm transition-all duration-200 group-hover:border-primary-200 group-hover:shadow-md">
                    <div className="space-y-s3">
                      <div className="flex flex-wrap items-center gap-s2">
                        <span className="rounded-full bg-primary-50 px-s2 py-1 text-caption font-medium text-primary-700">
                          {post.category}
                        </span>
                        <span
                          className="text-caption text-text-muted"
                          aria-hidden="true"
                        >
                          •
                        </span>
                        <span className="text-caption text-text-muted">
                          {post.readingTime} min read
                        </span>
                      </div>

                      <h2 className="line-clamp-2 text-h2 leading-tight text-text-primary">
                        <Link
                          href={`/blog/${post.slug}`}
                          className="rounded-sm outline-none transition-colors hover:text-primary-700 focus-visible:ring-2 focus-visible:ring-primary-300"
                        >
                          {post.title}
                        </Link>
                      </h2>

                      <p className="line-clamp-3 text-small leading-6 text-text-secondary">
                        {post.excerpt}
                      </p>
                    </div>

                    <div className="mt-auto flex items-center justify-between border-t border-border pt-s4">
                      <p className="text-caption text-text-muted">
                        {formatDate(post.publishedAt ?? post.updatedAt, {
                          locale: 'en-US',
                          options: {
                            month: 'short',
                            day: '2-digit',
                            year: 'numeric'
                          }
                        })}
                      </p>
                      <Button asChild variant="secondary" size="sm">
                        <Link href={`/blog/${post.slug}`}>Read article</Link>
                      </Button>
                    </div>
                  </Card>
                </article>
              ))}
            </div>
          ) : null}
        </section>
      </main>
      <LandingFooter />
    </>
  );
}
