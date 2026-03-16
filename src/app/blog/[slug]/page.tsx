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
  schemaTypeToSchemaOrgType,
  slugify
} from '@/features/blogs/utils';
import { formatDate } from '@/lib/utils/format';

type Props = {
  params: Promise<{ slug: string }>;
};

type TocItem = {
  id: string;
  text: string;
  level: 2 | 3;
};

export const revalidate = 3600;

const stripMarkdown = (value: string): string =>
  value
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/[`*_~#]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

function buildTocFromMarkdown(source: string): TocItem[] {
  const items: TocItem[] = [];
  const counts = new Map<string, number>();
  const headingPattern = /^(#{2,3})\s+(.+)$/gm;
  let match: RegExpExecArray | null = headingPattern.exec(source);

  while (match) {
    const level = match[1].length as 2 | 3;
    const text = stripMarkdown(match[2]);
    const base = slugify(text);
    const nextCount = (counts.get(base) ?? 0) + 1;
    counts.set(base, nextCount);
    const id = nextCount > 1 ? `${base}-${nextCount}` : base;

    if (id && text) {
      items.push({ id, text, level });
    }

    match = headingPattern.exec(source);
  }

  return items;
}

function buildTocFromHtml(source: string): TocItem[] {
  const items: TocItem[] = [];
  const counts = new Map<string, number>();
  const headingPattern = /<(h2|h3)([^>]*)>([\s\S]*?)<\/\1>/gi;
  let match: RegExpExecArray | null = headingPattern.exec(source);

  while (match) {
    const level = match[1].toLowerCase() === 'h2' ? 2 : 3;
    const text = stripMarkdown(match[3].replace(/<[^>]+>/g, ''));
    const base = slugify(text);
    const nextCount = (counts.get(base) ?? 0) + 1;
    counts.set(base, nextCount);
    const id = nextCount > 1 ? `${base}-${nextCount}` : base;

    if (id && text) {
      items.push({ id, text, level });
    }

    match = headingPattern.exec(source);
  }

  return items;
}

function injectHeadingIds(html: string, toc: TocItem[]): string {
  if (!toc.length) {
    return html;
  }

  let index = 0;
  return html.replace(/<(h2|h3)([^>]*)>/gi, (match, tag, attrs) => {
    const item = toc[index];
    if (!item) {
      return match;
    }
    index += 1;
    if (attrs && /id=/.test(attrs)) {
      return `<${tag}${attrs}>`;
    }
    return `<${tag}${attrs} id="${item.id}">`;
  });
}

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

  const tocItems = post.content.markdown?.trim()
    ? buildTocFromMarkdown(post.content.markdown)
    : buildTocFromHtml(post.content.html);

  const htmlWithAnchors = !post.content.markdown?.trim()
    ? injectHeadingIds(post.content.html, tocItems)
    : post.content.html;

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
        <article className="mx-auto w-full space-y-s4 px-s6 py-s10 md:px-s16">
          <header className="space-y-s6">
            <nav
              aria-label="Breadcrumb"
              className="text-caption text-text-muted"
            >
              <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <li>
                  <Link
                    href="/"
                    className="rounded-sm outline-none transition-colors hover:text-text-primary focus-visible:ring-2 focus-visible:ring-primary-300"
                  >
                    Home
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li>
                  <Link
                    href="/blog"
                    className="rounded-sm outline-none transition-colors hover:text-text-primary focus-visible:ring-2 focus-visible:ring-primary-300"
                  >
                    Blog
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li className="text-text-secondary">
                  <span className="line-clamp-1">{post.title}</span>
                </li>
              </ol>
            </nav>
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

          <div className="grid gap-s8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
            <div className="order-2 lg:order-1">
              {post.content.markdown?.trim() ? (
                <Markdown source={post.content.markdown} withAnchors />
              ) : (
                <article
                  className="prose-ui"
                  dangerouslySetInnerHTML={{ __html: htmlWithAnchors }}
                />
              )}
            </div>
            {tocItems.length > 1 ? (
              <aside className="order-1 space-y-s3 lg:order-2">
                <div className="rounded-xl border border-border bg-surface-default p-s4 shadow-sm lg:sticky lg:top-24">
                  <p className="text-base font-semibold text-text-primary">
                    Table of Contents
                  </p>
                  <ul className="mt-s4 space-y-s3 text-base text-text-secondary">
                    {tocItems.map((item) => (
                      <li
                        key={`${item.id}-${item.level}`}
                        className={
                          item.level === 3 ? 'pl-s4 text-small' : undefined
                        }
                      >
                        <a
                          href={`#${item.id}`}
                          className="block rounded-sm transition-colors hover:text-primary-700"
                        >
                          {item.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </aside>
            ) : null}
          </div>

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
