import type { CreateBlogInput, UpdateBlogInput } from '@/features/blogs/schema';
import type {
  Blog,
  BlogListQuery,
  BlogListResponse
} from '@/features/blogs/types';
import {
  createBlogRequest,
  deleteBlogRequest,
  duplicateBlogRequest,
  fetchBlog,
  fetchBlogs,
  fetchBlogTaxonomy,
  fetchPublicBlogBySlug,
  fetchPublicBlogs,
  updateBlogRequest
} from '@/features/blogs/api';

export async function getBlogs(
  params: BlogListQuery
): Promise<BlogListResponse> {
  return fetchBlogs(params);
}

export async function getBlogById(id: string): Promise<Blog> {
  return fetchBlog(id);
}

export async function createBlog(input: CreateBlogInput): Promise<Blog> {
  return createBlogRequest(input);
}

export async function updateBlog(
  id: string,
  input: UpdateBlogInput
): Promise<Blog> {
  return updateBlogRequest(id, input);
}

export async function deleteBlog(id: string): Promise<{ id: string }> {
  return deleteBlogRequest(id);
}

export async function duplicateBlog(id: string): Promise<Blog> {
  return duplicateBlogRequest(id);
}

export async function getBlogTaxonomy(): Promise<
  Awaited<ReturnType<typeof fetchBlogTaxonomy>>
> {
  return fetchBlogTaxonomy();
}

export async function getPublicBlogs(): Promise<BlogListResponse['items']> {
  return fetchPublicBlogs();
}

export async function getPublicBlogBySlug(
  slug: string,
  options?: { preview?: boolean }
): Promise<Blog> {
  return fetchPublicBlogBySlug(slug, options);
}
