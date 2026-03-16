'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

import type { Blog, BlogCategory } from '@/features/blogs/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils/cn';
import { formatDate } from '@/lib/utils/format';

type BlogIndexProps = {
  posts: Blog[];
  categories: BlogCategory[];
};

type CategoryOption = {
  id: string;
  name: string;
  slug: string;
  postCount: number;
};

const normalizeCategory = (value: string): string =>
  value.trim().toLowerCase().replace(/\s+/g, '-');

export function BlogIndex({ posts, categories }: BlogIndexProps): JSX.Element {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categoryOptions = useMemo<CategoryOption[]>(
    () => [
      {
        id: 'all',
        name: 'All',
        slug: 'all',
        postCount: posts.length
      },
      ...categories.map((category) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        postCount: category.postCount ?? 0
      }))
    ],
    [categories, posts.length]
  );

  const filteredPosts = useMemo(() => {
    if (activeCategory === 'all') {
      return posts;
    }

    const active = categoryOptions.find(
      (category) => category.slug === activeCategory
    );

    if (!active) {
      return posts;
    }

    return posts.filter((post) => {
      const normalizedPost = normalizeCategory(post.category);
      return (
        normalizedPost === normalizeCategory(active.slug) ||
        normalizedPost === normalizeCategory(active.name)
      );
    });
  }, [activeCategory, categoryOptions, posts]);

  const activeLabel =
    categoryOptions.find((category) => category.slug === activeCategory)
      ?.name ?? 'All';

  return (
    <div className="space-y-s6">
      <div className="mx-auto w-full max-w-[980px] space-y-s3 px-s4">
        <div className="flex flex-wrap items-center gap-s2">
          {categoryOptions.map((category) => {
            const isActive = category.slug === activeCategory;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => setActiveCategory(category.slug)}
                className={cn(
                  'inline-flex items-center gap-2 rounded-full border px-s3 py-1.5 text-small font-medium transition',
                  isActive
                    ? 'border-primary-200 bg-primary-50 text-primary-700'
                    : 'border-border bg-surface-default text-text-secondary hover:border-primary-200 hover:text-text-primary'
                )}
              >
                {category.name}
              </button>
            );
          })}
        </div>
      </div>

      {filteredPosts.length === 0 ? (
        <div className="mx-auto w-full max-w-[760px] px-s4">
          <Card className="space-y-s3 p-s6 text-center">
            <h2 className="text-h2 text-text-primary">
              No articles in this category yet
            </h2>
            <p className="text-small text-text-secondary">
              We are working on new guides for this topic. Try another category
              or check back soon.
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
          {filteredPosts.map((post) => (
            <article key={post.id} className="group">
              <Card className="overflow-hidden rounded-xl border border-border p-s4 shadow-sm transition-all duration-200 group-hover:border-primary-200 group-hover:shadow-md lg:max-h-[320px]">
                <div className="grid gap-s4 md:grid-cols-[260px_1fr] md:items-stretch">
                  <div className="h-[180px] overflow-hidden rounded-lg border border-border bg-surface-hover sm:h-[200px] md:h-[220px] lg:h-[250px]">
                    {post.ogImage ? (
                      <img
                        src={post.ogImage}
                        alt={`${post.title} cover image`}
                        className="h-full w-full object-cover"
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

                  <div className="flex min-h-[170px] flex-col space-y-s3 md:h-[220px] md:overflow-hidden lg:h-[250px]">
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

                    <p className="line-clamp-3 text-small leading-6 text-text-secondary md:line-clamp-2">
                      {post.excerpt}
                    </p>

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
          ))}
        </div>
      )}
    </div>
  );
}
