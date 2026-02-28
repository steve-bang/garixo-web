import { NextResponse } from 'next/server';

import { duplicateBlog } from '@/app/api/blogs/blogs-db';
import type { Blog } from '@/features/blogs/types';
import { auth } from '@/lib/auth';
import type { ApiResponse } from '@/types/api';

type Params = {
  params: Promise<{ id: string }>;
};

function response<T>(
  payload: ApiResponse<T>,
  status = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(payload, { status });
}

export async function POST(
  _request: Request,
  { params }: Params
): Promise<NextResponse<ApiResponse<Blog>>> {
  const session = await auth();

  if (!session?.user?.id) {
    return response({ success: false, error: 'Unauthorized' }, 401);
  }

  if (session.user.role !== 'admin') {
    return response({ success: false, error: 'Forbidden' }, 403);
  }

  const { id } = await params;

  const duplicated = await duplicateBlog(id, {
    id: session.user.id,
    name: session.user.name ?? 'Administrator'
  });

  if (!duplicated) {
    return response({ success: false, error: 'Blog not found.' }, 404);
  }

  return response({ success: true, data: duplicated }, 201);
}
