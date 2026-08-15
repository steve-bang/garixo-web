import { NextResponse } from 'next/server';

import { listPublishedBlogs } from '@/services/blog-content/blog-fs';
import type { ApiResponse } from '@/types/api';

type PublicBlogListItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  updatedAt: string;
  publishedAt: string | null;
  readingTime: number;
};

type PublicBlogsResponse = {
  items: PublicBlogListItem[];
};

function response<T>(
  payload: ApiResponse<T>,
  status = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(payload, { status });
}

export async function GET(): Promise<
  NextResponse<ApiResponse<PublicBlogsResponse>>
> {
  const items = listPublishedBlogs().map((post) => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    category: post.category,
    updatedAt: post.updatedAt,
    publishedAt: post.publishedAt,
    readingTime: post.readingTime
  }));

  return response({
    success: true,
    data: { items }
  });
}
