import { NextResponse } from 'next/server';

import { findBlogBySlug, incrementBlogViews } from '@/app/api/blogs/blogs-db';
import type { Blog } from '@/features/blogs/types';
import { resolveEffectiveStatus } from '@/features/blogs/utils';
import type { ApiResponse } from '@/types/api';

type Params = {
  params: Promise<{ slug: string }>;
};

function response<T>(
  payload: ApiResponse<T>,
  status = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(payload, { status });
}

export async function GET(
  request: Request,
  { params }: Params
): Promise<NextResponse<ApiResponse<Blog>>> {
  const { slug } = await params;
  const blog = await findBlogBySlug(slug);

  if (!blog) {
    return response({ success: false, error: 'Post not found.' }, 404);
  }

  const url = new URL(request.url);
  const isPreview = url.searchParams.get('preview') === '1';

  const effectiveStatus = resolveEffectiveStatus(blog.status, blog.scheduledAt);
  if (!isPreview && effectiveStatus !== 'published') {
    return response({ success: false, error: 'Post not found.' }, 404);
  }

  if (!isPreview) {
    await incrementBlogViews(blog.id);
  }

  return response({
    success: true,
    data: {
      ...blog,
      status: effectiveStatus
    }
  });
}
