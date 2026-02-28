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
          <div className="mx-auto w-full max-w-[980px] px-s4 text-center">
            <h1 className="text-[34px] font-bold leading-tight text-text-primary md:text-[52px]">
              Garixo Blog
            </h1>
            <p className="mx-auto mt-s3 max-w-[760px] text-body text-text-secondary">
              Practical playbooks to help independent garages run faster, serve
              better, and grow daily revenue.
            </p>
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
                <div className="pt-s1">
                  <Button asChild variant="secondary">
                    <Link href="/">Go to homepage</Link>
                  </Button>
                </div>
              </Card>
            </div>
          ) : (
            <div className="mx-auto grid w-full max-w-[980px] gap-s4 px-s4 md:grid-cols-2">
              {posts.map((post) => (
                <Card key={post.id} className="space-y-s3 p-s4">
                  <div className="space-y-s1">
                    <p className="text-caption text-text-muted">
                      {post.category} · {post.readingTime} min read
                    </p>
                    <h2 className="text-h2 text-text-primary">{post.title}</h2>
                  </div>
                  <p className="text-small text-text-secondary">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
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
              ))}
            </div>
          )}
        </section>
      </main>
      <LandingFooter />
    </>
  );
}
