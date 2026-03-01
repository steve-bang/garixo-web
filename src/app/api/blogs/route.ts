import { NextResponse } from 'next/server';

import {
  createBlog,
  hasDuplicateBlogSlug,
  listBlogsWithQuery
} from '@/app/api/blogs/blogs-db';
import { blogListQuerySchema, createBlogSchema } from '@/features/blogs/schema';
import type { Blog, BlogListResponse } from '@/features/blogs/types';
import { auth } from '@/lib/auth';
import type { ApiResponse } from '@/types/api';

function response<T>(
  payload: ApiResponse<T>,
  status = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(payload, { status });
}

export async function GET(
  request: Request
): Promise<NextResponse<ApiResponse<BlogListResponse>>> {
  const session = await auth();
  if (!session?.user?.id) {
    return response({ success: false, error: 'Unauthorized' }, 401);
  }

  if (session.user.role !== 'admin') {
    return response({ success: false, error: 'Forbidden' }, 403);
  }

  const url = new URL(request.url);
  const parsed = blogListQuerySchema.safeParse({
    search: url.searchParams.get('search') ?? undefined,
    status: url.searchParams.get('status') ?? undefined,
    category: url.searchParams.get('category') ?? undefined,
    page: url.searchParams.get('page') ?? undefined,
    pageSize: url.searchParams.get('pageSize') ?? undefined
  });

  if (!parsed.success) {
    return response(
      {
        success: false,
        error: parsed.error.issues[0]?.message ?? 'Invalid query.'
      },
      400
    );
  }

  const result = await listBlogsWithQuery({
    search: parsed.data.search,
    status: parsed.data.status,
    category: parsed.data.category,
    page: parsed.data.page,
    pageSize: parsed.data.pageSize
  });

  return response({ success: true, data: result });
}

export async function POST(
  request: Request
): Promise<NextResponse<ApiResponse<Blog>>> {
  const session = await auth();
  if (!session?.user?.id) {
    return response({ success: false, error: 'Unauthorized' }, 401);
  }

  if (session.user.role !== 'admin') {
    return response({ success: false, error: 'Forbidden' }, 403);
  }

  const body = await request.json().catch(() => null);
  const parsed = createBlogSchema.safeParse(body);

  if (!parsed.success) {
    return response(
      {
        success: false,
        error: parsed.error.issues[0]?.message ?? 'Invalid payload.'
      },
      400
    );
  }

  const duplicateSlug = await hasDuplicateBlogSlug(parsed.data.slug);
  if (duplicateSlug) {
    return response(
      {
        success: false,
        error: 'Slug already exists. Please choose another slug.'
      },
      409
    );
  }

  const blog = await createBlog(parsed.data, {
    id: session.user.id,
    name: session.user.name ?? 'Administrator'
  });

  return response({ success: true, data: blog }, 201);
}
