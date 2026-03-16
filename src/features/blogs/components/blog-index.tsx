'use client';

import { useMemo, useState } from 'react';
import type { Blog, BlogCategory } from '@/features/blogs/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils/cn';
import { BlogCard } from '@/features/blogs/components/blog-card';
import Link from 'next/link';

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
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-caption',
                    isActive
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-surface-hover text-text-muted'
                  )}
                >
                  {category.postCount}
                </span>
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
            <BlogCard key={post.id} post={post} className="group" />
          ))}
        </div>
      )}
    </div>
  );
}
