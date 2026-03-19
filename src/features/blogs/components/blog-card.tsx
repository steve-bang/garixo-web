import Link from 'next/link';

import type { Blog } from '@/features/blogs/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatDate } from '@/lib/utils/format';

type BlogCardProps = {
  post: Blog;
  className?: string;
};

export function BlogCard({ post, className }: BlogCardProps): JSX.Element {
  return (
    <article className={className}>
      <Card className="overflow-hidden rounded-xl border border-border p-s4 shadow-sm transition-all duration-200 hover:border-primary-200 hover:shadow-md">
        <div className="grid gap-s4 md:grid-cols-[280px_1fr]">
          {/* IMAGE */}
          <div className="aspect-[16/9] w-full overflow-hidden rounded-lg border border-border bg-surface-hover">
            {post.ogImage ? (
              <img
                src={post.ogImage}
                alt={`${post.title} cover image`}
                className="h-full w-full object-cover object-top"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div className="grid h-full place-items-center bg-gradient-to-br from-primary-100 via-primary-200 to-primary-300 p-s4 text-center">
                <p className="line-clamp-4 text-small font-semibold leading-6 text-primary-900">
                  {post.title}
                </p>
              </div>
            )}
          </div>

          {/* CONTENT */}
          <div className="flex flex-col space-y-s3">
            {/* META */}
            <div className="flex flex-wrap items-center gap-s2">
              <span className="rounded-full bg-primary-50 px-s2 py-1 text-caption font-medium text-primary-700">
                {post.category}
              </span>

              <span className="text-caption text-text-muted">•</span>

              <span className="text-caption text-text-muted">
                {post.readingTime} min read
              </span>
            </div>

            {/* TITLE */}
            <h2 className="line-clamp-2 text-h2 leading-tight text-text-primary">
              <Link
                href={`/blog/${post.slug}`}
                className="rounded-sm transition-colors hover:text-primary-700 focus-visible:ring-2 focus-visible:ring-primary-300"
              >
                {post.title}
              </Link>
            </h2>

            {/* EXCERPT */}
            <p className="line-clamp-3 text-small leading-6 text-text-secondary">
              {post.excerpt}
            </p>

            {/* FOOTER */}
            <div className="mt-auto flex items-center justify-between border-t border-border pt-s3">
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
          </div>
        </div>
      </Card>
    </article>
  );
}

type BlogCardCompactProps = {
  post: Blog;
  className?: string;
};

export function BlogCardCompact({
  post,
  className
}: BlogCardCompactProps): JSX.Element {
  return (
    <article className={className}>
      <Card className="h-full overflow-hidden rounded-xl border border-border p-s3 shadow-sm transition-all duration-200 hover:border-primary-200 hover:shadow-md">
        <div className="space-y-s3">
          <div className="h-[140px] overflow-hidden rounded-lg border border-border bg-surface-hover">
            {post.ogImage ? (
              <img
                src={post.ogImage}
                alt={`${post.title} cover image`}
                className="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div className="grid h-full place-items-center bg-gradient-to-br from-primary-100 via-primary-200 to-primary-300 p-s3 text-center">
                <p className="line-clamp-3 text-caption font-semibold leading-5 text-primary-900">
                  {post.title}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-s2">
            <span className="inline-flex rounded-full bg-primary-50 px-s2 py-1 text-caption font-medium text-primary-700">
              {post.category}
            </span>

            <h3 className="line-clamp-2 text-base font-semibold text-text-primary">
              <Link
                href={`/blog/${post.slug}`}
                className="rounded-sm outline-none transition-colors hover:text-primary-700 focus-visible:ring-2 focus-visible:ring-primary-300"
              >
                {post.title}
              </Link>
            </h3>

            <p className="line-clamp-2 text-small text-text-secondary">
              {post.excerpt}
            </p>
          </div>

          <div className="flex items-center justify-between border-t border-border pt-s2 text-caption text-text-muted">
            <span>
              {formatDate(post.publishedAt ?? post.updatedAt, {
                locale: 'en-US',
                options: {
                  month: 'short',
                  day: '2-digit',
                  year: 'numeric'
                }
              })}
            </span>
            <span>{post.readingTime} min read</span>
          </div>
        </div>
      </Card>
    </article>
  );
}
