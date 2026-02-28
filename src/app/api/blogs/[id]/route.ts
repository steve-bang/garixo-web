import { NextResponse } from 'next/server';

import {
  deleteBlog,
  findBlogById,
  hasDuplicateBlogSlug,
  updateBlog
} from '@/app/api/blogs/blogs-db';
import { updateBlogSchema } from '@/features/blogs/schema';
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

export async function GET(
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
  const blog = await findBlogById(id);

  if (!blog) {
    return response({ success: false, error: 'Blog not found.' }, 404);
  }

  return response({ success: true, data: blog });
}

export async function PUT(
  request: Request,
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
  const body = await request.json().catch(() => null);
  const parsed = updateBlogSchema.safeParse(body);

  if (!parsed.success) {
    return response(
      {
        success: false,
        error: parsed.error.issues[0]?.message ?? 'Invalid payload.'
      },
      400
    );
  }

  if (parsed.data.slug) {
    const duplicateSlug = await hasDuplicateBlogSlug(parsed.data.slug, id);
    if (duplicateSlug) {
      return response(
        {
          success: false,
          error: 'Slug already exists. Please choose another slug.'
        },
        409
      );
    }
  }

  const updated = await updateBlog(id, parsed.data, {
    id: session.user.id,
    name: session.user.name ?? 'Administrator'
  });

  if (!updated) {
    return response({ success: false, error: 'Blog not found.' }, 404);
  }

  return response({ success: true, data: updated });
}

export async function DELETE(
  _request: Request,
  { params }: Params
): Promise<NextResponse<ApiResponse<{ id: string }>>> {
  const session = await auth();
  if (!session?.user?.id) {
    return response({ success: false, error: 'Unauthorized' }, 401);
  }

  if (session.user.role !== 'admin') {
    return response({ success: false, error: 'Forbidden' }, 403);
  }

  const { id } = await params;
  const deleted = await deleteBlog(id);

  if (!deleted) {
    return response({ success: false, error: 'Blog not found.' }, 404);
  }

  return response({ success: true, data: { id } });
}
