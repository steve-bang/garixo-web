'use client';

import { Copy, Edit, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import {
  useDeleteBlog,
  useDuplicateBlog,
  useBlogs
} from '@/features/blogs/hooks';
import type { BlogStatus } from '@/features/blogs/types';
import { BLOG_STATUS_VALUES } from '@/features/blogs/types';
import { formatBlogStatusLabel } from '@/features/blogs/utils';
import { useToast } from '@/hooks/use-toast';
import { formatDate } from '@/lib/utils/format';

type QueryValue = string | null | undefined;

function parsePositiveInt(value: string | null, fallback = 1): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
}

function toQueryStringValue(value: QueryValue): string | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }

  const normalized = value.trim();
  return normalized ? normalized : undefined;
}

function parseBlogStatus(value: string | null): BlogStatus | undefined {
  if (!value) {
    return undefined;
  }

  return BLOG_STATUS_VALUES.includes(value as BlogStatus)
    ? (value as BlogStatus)
    : undefined;
}

function statusBadgeVariant(
  status: BlogStatus
): 'default' | 'success' | 'warning' {
  if (status === 'published') {
    return 'success';
  }

  if (status === 'scheduled') {
    return 'warning';
  }

  return 'default';
}

export function BlogsManagementPage(): JSX.Element {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();

  const [searchInput, setSearchInput] = useState('');

  const search = toQueryStringValue(searchParams.get('search')) ?? '';
  const status = parseBlogStatus(searchParams.get('status'));
  const category = toQueryStringValue(searchParams.get('category')) ?? '';
  const page = parsePositiveInt(searchParams.get('page'), 1);
  const pageSize = 20;

  const setQueryParams = useCallback(
    (updates: Record<string, QueryValue>) => {
      const nextParams = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        const normalized = toQueryStringValue(value);
        if (!normalized) {
          nextParams.delete(key);
          return;
        }

        nextParams.set(key, normalized);
      });

      const nextQuery = nextParams.toString();
      const currentQuery = searchParams.toString();
      if (nextQuery === currentQuery) {
        return;
      }

      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
        scroll: false
      });
    },
    [pathname, router, searchParams]
  );

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (searchInput.trim() === search) {
        return;
      }

      setQueryParams({
        search: searchInput,
        page: '1'
      });
    }, 300);

    return () => window.clearTimeout(timer);
  }, [search, searchInput, setQueryParams]);

  const params = useMemo(
    () => ({
      search: search || undefined,
      status,
      category: category || undefined,
      page,
      pageSize
    }),
    [search, status, category, page]
  );

  const blogsQuery = useBlogs(params);
  const deleteMutation = useDeleteBlog();
  const duplicateMutation = useDuplicateBlog();

  const items = blogsQuery.data?.items ?? [];
  const meta = blogsQuery.data?.meta;

  const handleDelete = async (blogId: string) => {
    const confirmed = window.confirm(
      'Delete this blog post? This action cannot be undone.'
    );
    if (!confirmed) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(blogId);
      toast.success('Blog deleted.');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Could not delete blog.';
      toast.error(message);
    }
  };

  const handleDuplicate = async (blogId: string) => {
    try {
      const duplicated = await duplicateMutation.mutateAsync(blogId);
      toast.success('Blog duplicated.');
      router.push(`/dashboard/administrator/blogs/${duplicated.id}/edit`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Could not duplicate blog.';
      toast.error(message);
    }
  };

  return (
    <div className="space-y-s4 p-s6 xl:p-s8">
      <header className="flex flex-col gap-s3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-h1">Blog Management</h1>
          <p className="text-small text-text-muted">
            Create, optimize, and publish SEO content for Google and AI search
            channels.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/administrator/blogs/new">
            <Plus className="size-4" />
            New Blog Post
          </Link>
        </Button>
      </header>

      <Card className="grid gap-s3 p-s4 md:grid-cols-4">
        <div className="space-y-s1 md:col-span-2">
          <label className="text-small font-medium text-text-secondary">
            Search
          </label>
          <Input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search title, slug, or keyword"
          />
        </div>

        <div className="space-y-s1">
          <label className="text-small font-medium text-text-secondary">
            Status
          </label>
          <Select
            value={status ?? ''}
            onChange={(event) =>
              setQueryParams({
                status: event.target.value || undefined,
                page: '1'
              })
            }
          >
            <option value="">All</option>
            {BLOG_STATUS_VALUES.map((statusValue) => (
              <option key={statusValue} value={statusValue}>
                {formatBlogStatusLabel(statusValue)}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-s1">
          <label className="text-small font-medium text-text-secondary">
            Category
          </label>
          <Input
            value={category}
            onChange={(event) =>
              setQueryParams({
                category: event.target.value,
                page: '1'
              })
            }
            placeholder="Category"
          />
        </div>
      </Card>

      {blogsQuery.isLoading ? (
        <Card className="p-s6 text-small text-text-muted">
          Loading blog posts...
        </Card>
      ) : blogsQuery.isError ? (
        <Card className="p-s6 text-small text-state-error">
          We could not load blog posts right now.
        </Card>
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1080px] text-left text-small">
              <thead className="bg-table-header text-table-header-text">
                <tr>
                  <th className="px-s4 py-s3 font-semibold">Title</th>
                  <th className="px-s4 py-s3 font-semibold">Status</th>
                  <th className="px-s4 py-s3 font-semibold">SEO Score</th>
                  <th className="px-s4 py-s3 font-semibold">Views</th>
                  <th className="px-s4 py-s3 font-semibold">Slug</th>
                  <th className="px-s4 py-s3 font-semibold">Category</th>
                  <th className="px-s4 py-s3 font-semibold">Updated</th>
                  <th className="px-s4 py-s3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.length > 0 ? (
                  items.map((item) => (
                    <tr
                      key={item.id}
                      className="border-t border-border bg-surface-default"
                    >
                      <td className="px-s4 py-s3">
                        <div>
                          <p className="font-medium text-text-primary">
                            {item.title}
                          </p>
                          <p className="text-caption text-text-muted">
                            {item.readingTime} min read
                          </p>
                        </div>
                      </td>
                      <td className="px-s4 py-s3">
                        <Badge variant={statusBadgeVariant(item.status)}>
                          {formatBlogStatusLabel(item.status)}
                        </Badge>
                      </td>
                      <td className="px-s4 py-s3">
                        <span className="font-medium text-text-primary">
                          {item.seoScore}/100
                        </span>
                      </td>
                      <td className="px-s4 py-s3">{item.views}</td>
                      <td className="px-s4 py-s3 text-text-secondary">
                        /{item.slug}
                      </td>
                      <td className="px-s4 py-s3">{item.category}</td>
                      <td className="px-s4 py-s3 text-text-secondary">
                        {formatDate(item.updatedAt, {
                          locale: 'en-US',
                          options: {
                            month: 'short',
                            day: '2-digit',
                            year: 'numeric'
                          }
                        })}
                      </td>
                      <td className="px-s4 py-s3">
                        <div className="flex items-center gap-s1">
                          <Button
                            asChild
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2"
                          >
                            <Link
                              href={`/dashboard/administrator/blogs/${item.id}/edit`}
                            >
                              <Edit className="size-4" />
                            </Link>
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2"
                            onClick={() => handleDuplicate(item.id)}
                            disabled={duplicateMutation.isPending}
                          >
                            <Copy className="size-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-state-error"
                            onClick={() => handleDelete(item.id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      className="px-s4 py-s6 text-center text-small text-text-muted"
                      colSpan={8}
                    >
                      No blog posts found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {meta ? (
            <div className="flex items-center justify-between border-t border-border px-s4 py-s3 text-small text-text-secondary">
              <p>
                Page {meta.page} of {meta.totalPages} ({meta.total} posts)
              </p>
              <div className="flex items-center gap-s2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={meta.page <= 1}
                  onClick={() =>
                    setQueryParams({
                      page: String(Math.max(1, meta.page - 1))
                    })
                  }
                >
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={meta.page >= meta.totalPages}
                  onClick={() =>
                    setQueryParams({
                      page: String(Math.min(meta.totalPages, meta.page + 1))
                    })
                  }
                >
                  Next
                </Button>
              </div>
            </div>
          ) : null}
        </Card>
      )}
    </div>
  );
}
