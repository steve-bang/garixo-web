import type { ApiResponse } from '@/types/api';
import type {
  Blog,
  BlogCategory,
  BlogListQuery,
  BlogListResponse,
  BlogTag
} from '@/features/blogs/types';
import type { CreateBlogInput, UpdateBlogInput } from '@/features/blogs/schema';

export const blogsQueryKey = ['blogs'] as const;

export const blogTaxonomyQueryKey = ['blogs', 'taxonomy'] as const;

function toQuery(params: BlogListQuery): string {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      search.set(key, String(value));
    }
  });

  return search.toString();
}

async function readJson<T>(response: Response): Promise<ApiResponse<T>> {
  return (await response.json()) as ApiResponse<T>;
}

function ensureSuccess<T>(payload: ApiResponse<T>): T {
  if (!payload.success || payload.data === undefined) {
    throw new Error(payload.error ?? 'Request failed');
  }

  return payload.data;
}

export async function fetchBlogs(
  params: BlogListQuery
): Promise<BlogListResponse> {
  const query = toQuery(params);
  const response = await fetch(`/api/blogs${query ? `?${query}` : ''}`);
  const payload = await readJson<BlogListResponse>(response);
  return ensureSuccess(payload);
}

export async function fetchBlog(id: string): Promise<Blog> {
  const response = await fetch(`/api/blogs/${id}`);
  const payload = await readJson<Blog>(response);
  return ensureSuccess(payload);
}

export async function createBlogRequest(input: CreateBlogInput): Promise<Blog> {
  const response = await fetch('/api/blogs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(input)
  });
  const payload = await readJson<Blog>(response);
  return ensureSuccess(payload);
}

export async function updateBlogRequest(
  id: string,
  input: UpdateBlogInput
): Promise<Blog> {
  const response = await fetch(`/api/blogs/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(input)
  });

  const payload = await readJson<Blog>(response);
  return ensureSuccess(payload);
}

export async function deleteBlogRequest(id: string): Promise<{ id: string }> {
  const response = await fetch(`/api/blogs/${id}`, {
    method: 'DELETE'
  });
  const payload = await readJson<{ id: string }>(response);
  return ensureSuccess(payload);
}

export async function duplicateBlogRequest(id: string): Promise<Blog> {
  const response = await fetch(`/api/blogs/${id}/duplicate`, {
    method: 'POST'
  });
  const payload = await readJson<Blog>(response);
  return ensureSuccess(payload);
}

export async function fetchBlogTaxonomy(): Promise<{
  categories: BlogCategory[];
  tags: BlogTag[];
}> {
  const response = await fetch('/api/blogs/taxonomy');
  const payload = await readJson<{
    categories: BlogCategory[];
    tags: BlogTag[];
  }>(response);
  return ensureSuccess(payload);
}

export async function fetchPublicBlogs(): Promise<BlogListResponse['items']> {
  const response = await fetch('/api/public/blogs');
  const payload = await readJson<{ items: BlogListResponse['items'] }>(
    response
  );
  return ensureSuccess(payload).items;
}

export async function fetchPublicBlogBySlug(
  slug: string,
  options?: { preview?: boolean }
): Promise<Blog> {
  const query = options?.preview ? '?preview=1' : '';
  const response = await fetch(`/api/public/blogs/${slug}${query}`);
  const payload = await readJson<Blog>(response);
  return ensureSuccess(payload);
}
