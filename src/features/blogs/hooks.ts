'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  blogTaxonomyQueryKey,
  blogsQueryKey,
  createBlogRequest,
  deleteBlogRequest,
  duplicateBlogRequest,
  fetchBlog,
  fetchBlogs,
  fetchBlogTaxonomy,
  updateBlogRequest
} from '@/features/blogs/api';
import type { CreateBlogInput, UpdateBlogInput } from '@/features/blogs/schema';
import type { BlogListQuery } from '@/features/blogs/types';

export function useBlogs(params: BlogListQuery) {
  return useQuery({
    queryKey: [...blogsQueryKey, params],
    queryFn: () => fetchBlogs(params)
  });
}

export function useBlog(blogId?: string | null) {
  return useQuery({
    queryKey: [...blogsQueryKey, 'detail', blogId],
    queryFn: () => fetchBlog(blogId ?? ''),
    enabled: Boolean(blogId)
  });
}

export function useBlogTaxonomy() {
  return useQuery({
    queryKey: blogTaxonomyQueryKey,
    queryFn: fetchBlogTaxonomy
  });
}

export function useCreateBlog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateBlogInput) => createBlogRequest(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogsQueryKey });
      queryClient.invalidateQueries({ queryKey: blogTaxonomyQueryKey });
    }
  });
}

export function useUpdateBlog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateBlogInput }) =>
      updateBlogRequest(id, input),
    onSuccess: (blog) => {
      queryClient.invalidateQueries({ queryKey: blogsQueryKey });
      queryClient.setQueryData([...blogsQueryKey, 'detail', blog.id], blog);
      queryClient.invalidateQueries({ queryKey: blogTaxonomyQueryKey });
    }
  });
}

export function useDeleteBlog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteBlogRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogsQueryKey });
      queryClient.invalidateQueries({ queryKey: blogTaxonomyQueryKey });
    }
  });
}

export function useDuplicateBlog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => duplicateBlogRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogsQueryKey });
      queryClient.invalidateQueries({ queryKey: blogTaxonomyQueryKey });
    }
  });
}
