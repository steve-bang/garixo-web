import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { listBlogTags, listPublishedBlogs } from '@/app/api/blogs/blogs-db';
import { LandingFooter } from '@/components/sections/LandingFooter';
import { LandingHeader } from '@/components/sections/LandingHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BlogCard } from '@/features/blogs/components/blog-card';
import { slugMatches } from '@/features/blogs/utils';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tags = await listBlogTags();
  const tag = tags.find((item) => item.slug === slug);

  if (!tag) {
    return {
      title: 'Tag Not Found | Garixo'
    };
  }

  const title = `${tag.name} Articles | Garixo Blog`;
  const description = `Articles tagged "${tag.name}" for independent auto repair shop owners, from the Garixo blog.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/blog/tag/${tag.slug}`
    },
    robots: {
      index: true,
      follow: true
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://www.garixo.com/blog/tag/${tag.slug}`
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description
    }
  };
}

export default async function BlogTagPage({
  params
}: Props): Promise<JSX.Element> {
  const { slug } = await params;
  const [tags, allPosts] = await Promise.all([
    listBlogTags(),
    listPublishedBlogs()
  ]);

  const tag = tags.find((item) => item.slug === slug);

  if (!tag) {
    notFound();
  }

  const posts = allPosts.filter((post) =>
    post.tags.some((postTag) => slugMatches(postTag, slug))
  );

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${tag.name} Articles | Garixo Blog`,
    url: `https://www.garixo.com/blog/tag/${tag.slug}`,
    description: `Articles tagged "${tag.name}" for independent auto repair shop owners.`
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
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: tag.name,
        item: `https://www.garixo.com/blog/tag/${tag.slug}`
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
            <h1 className="text-[34px] font-bold leading-tight text-text-primary md:text-[48px]">
              {tag.name} Articles
            </h1>
            <p className="mx-auto mt-s3 max-w-[700px] text-body text-text-secondary">
              Articles tagged &quot;{tag.name}&quot; for independent garage
              owners.
            </p>
          </div>
        </section>

        <section className="bg-background-primary py-s10">
          {posts.length === 0 ? (
            <div className="mx-auto w-full max-w-[760px] px-s4">
              <Card className="space-y-s3 p-s6 text-center">
                <h2 className="text-h2 text-text-primary">
                  No articles with this tag yet
                </h2>
                <p className="text-small text-text-secondary">
                  We are working on new guides for this topic. Check back soon.
                </p>
                <div className="flex flex-col justify-center gap-s2 pt-s1 sm:flex-row">
                  <Button asChild variant="secondary">
                    <Link href="/blog">View all articles</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/pricing">View Pricing</Link>
                  </Button>
                </div>
              </Card>
            </div>
          ) : (
            <div className="mx-auto grid w-full max-w-[980px] gap-s4 px-s4">
              {posts.map((post) => (
                <BlogCard key={post.id} post={post} className="group" />
              ))}
            </div>
          )}
        </section>
      </main>
      <LandingFooter />
    </>
  );
}
