import { NextResponse } from 'next/server';

import { listPublishedBlogs } from '@/app/api/blogs/blogs-db';
import type { BlogListItem } from '@/features/blogs/types';
import { toBlogListItem } from '@/features/blogs/utils';
import type { ApiResponse } from '@/types/api';

type PublicBlogsResponse = {
  items: BlogListItem[];
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
  const items = await listPublishedBlogs();

  return response({
    success: true,
    data: {
      items: items.map(toBlogListItem)
    }
  });
}
