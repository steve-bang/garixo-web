import { NextResponse } from 'next/server';

import { listBlogCategories, listBlogTags } from '@/app/api/blogs/blogs-db';
import type { BlogCategory, BlogTag } from '@/features/blogs/types';
import { auth } from '@/lib/auth';
import type { ApiResponse } from '@/types/api';

type BlogTaxonomyResponse = {
  categories: BlogCategory[];
  tags: BlogTag[];
};

function response<T>(
  payload: ApiResponse<T>,
  status = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(payload, { status });
}

export async function GET(): Promise<
  NextResponse<ApiResponse<BlogTaxonomyResponse>>
> {
  const session = await auth();

  if (!session?.user?.id) {
    return response({ success: false, error: 'Unauthorized' }, 401);
  }

  if (session.user.role !== 'admin') {
    return response({ success: false, error: 'Forbidden' }, 403);
  }

  const [categories, tags] = await Promise.all([
    listBlogCategories(),
    listBlogTags()
  ]);

  return response({
    success: true,
    data: {
      categories,
      tags
    }
  });
}
