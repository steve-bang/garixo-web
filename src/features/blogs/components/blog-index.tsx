import Link from 'next/link';

import type { BlogCategory, BlogPost } from '@/features/blogs/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils/cn';
import { BlogCard } from '@/features/blogs/components/blog-card';

type BlogIndexProps = {
  posts: BlogPost[];
  categories: BlogCategory[];
  activeCategorySlug?: string;
};

export function BlogIndex({
  posts,
  categories,
  activeCategorySlug
}: BlogIndexProps): JSX.Element {
  const isAllActive = !activeCategorySlug;

  return (
    <div className="space-y-s6">
      <div className="mx-auto w-full max-w-[980px] space-y-s3 px-s4">
        <div className="flex flex-wrap items-center gap-s2">
          <Link
            href="/blog"
            className={cn(
              'inline-flex items-center gap-2 rounded-full border px-s3 py-1.5 text-small font-medium transition',
              isAllActive
                ? 'border-primary-200 bg-primary-50 text-primary-700'
                : 'border-border bg-surface-default text-text-secondary hover:border-primary-200 hover:text-text-primary'
            )}
          >
            All
          </Link>
          {categories.map((category) => {
            const isActive = category.slug === activeCategorySlug;
            return (
              <Link
                key={category.id}
                href={`/blog/category/${category.slug}`}
                className={cn(
                  'inline-flex items-center gap-2 rounded-full border px-s3 py-1.5 text-small font-medium transition',
                  isActive
                    ? 'border-primary-200 bg-primary-50 text-primary-700'
                    : 'border-border bg-surface-default text-text-secondary hover:border-primary-200 hover:text-text-primary'
                )}
              >
                {category.name}
              </Link>
            );
          })}
        </div>
      </div>

      {posts.length === 0 ? (
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
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} className="group" />
          ))}
        </div>
      )}
    </div>
  );
}
