import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { findBlogBySlug, incrementBlogViews } from '@/app/api/blogs/blogs-db';
import { Markdown } from '@/components/markdown/Markdown';
import { LandingFooter } from '@/components/sections/LandingFooter';
import { LandingHeader } from '@/components/sections/LandingHeader';
import { Button } from '@/components/ui/button';
import {
  resolveEffectiveStatus,
  schemaTypeToSchemaOrgType
} from '@/features/blogs/utils';
import { formatDate } from '@/lib/utils/format';

type Props = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 3600;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await findBlogBySlug(slug);

  if (!post) {
    return {
      title: 'Post Not Found | Garixo'
    };
  }

  const effectiveStatus = resolveEffectiveStatus(post.status, post.scheduledAt);
  if (effectiveStatus !== 'published') {
    return {
      title: 'Post Not Found | Garixo'
    };
  }

  const title = post.metaTitle || post.title;
  const description = post.metaDescription || post.excerpt;
  const canonical = post.canonical || `/blog/${post.slug}`;

  return {
    metadataBase: new URL('https://www.garixo.com'),
    title,
    description,
    alternates: {
      canonical
    },
    robots: {
      index: post.isIndexed,
      follow: post.isIndexed
    },
    openGraph: {
      title: post.ogTitle || title,
      description: post.ogDescription || description,
      type: 'article',
      url: `https://www.garixo.com/blog/${post.slug}`,
      images: post.ogImage
        ? [
            {
              url: post.ogImage
            }
          ]
        : undefined
    }
  };
}

export default async function BlogDetailPage({
  params
}: Props): Promise<JSX.Element> {
  const { slug } = await params;
  const post = await findBlogBySlug(slug);

  if (!post) {
    notFound();
  }

  const effectiveStatus = resolveEffectiveStatus(post.status, post.scheduledAt);
  if (effectiveStatus !== 'published') {
    notFound();
  }

  await incrementBlogViews(post.id);

  const schemaType = schemaTypeToSchemaOrgType(post.schemaType);

  const blogSchema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': schemaType,
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt ?? post.updatedAt,
    dateModified: post.updatedAt,
    author: {
      '@type': 'Person',
      name: post.authorName || 'Garixo Team'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Garixo',
      url: 'https://www.garixo.com'
    },
    mainEntityOfPage: `https://www.garixo.com/blog/${post.slug}`
  };

  if (post.ogImage) {
    blogSchema.image = [post.ogImage];
  }

  const faqSchema = post.faqItems.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: post.faqItems.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer
          }
        }))
      }
    : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
      />
      {faqSchema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      ) : null}

      <LandingHeader />
      <main className="bg-background-primary">
        <article className="mx-auto w-full max-w-[1000px] space-y-s4 px-s4 py-s10">
          <header className="space-y-s2">
            <p className="text-caption text-text-muted">
              {post.category} · {post.readingTime} min read ·{' '}
              {formatDate(post.publishedAt ?? post.updatedAt, {
                locale: 'en-US',
                options: {
                  month: 'short',
                  day: '2-digit',
                  year: 'numeric'
                }
              })}
            </p>
            <h1 className="text-[34px] font-bold leading-tight text-text-primary md:text-[46px]">
              {post.title}
            </h1>
            <p className="text-body text-text-secondary">{post.excerpt}</p>
          </header>

          {post.content.markdown?.trim() ? (
            <Markdown source={post.content.markdown} />
          ) : (
            <article
              className="prose-ui"
              dangerouslySetInnerHTML={{ __html: post.content.html }}
            />
          )}

          {post.ctaBlock ? (
            <section className="rounded-md border border-primary-200 bg-primary-50 p-s4">
              <h2 className="text-h3 text-primary-900">
                {post.ctaBlock.title}
              </h2>
              <p className="mt-s1 text-small text-primary-900">
                {post.ctaBlock.description}
              </p>
              <div className="mt-s3">
                <Button asChild>
                  <Link href={post.ctaBlock.ctaHref}>
                    {post.ctaBlock.ctaLabel}
                  </Link>
                </Button>
              </div>
            </section>
          ) : null}
        </article>
      </main>
      <LandingFooter />
    </>
  );
}
