import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import {
  CdnValidationError,
  uploadBlogImageToCdn
} from '@/services/cdn/firebase-cdn-service';
import type { ApiResponse } from '@/types/api';

function response<T>(
  payload: ApiResponse<T>,
  status = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(payload, { status });
}

export async function POST(
  request: Request
): Promise<NextResponse<ApiResponse<{ url: string }>>> {
  const session = await auth();

  if (!session?.user?.id) {
    return response({ success: false, error: 'Unauthorized' }, 401);
  }

  if (session.user.role !== 'admin') {
    return response({ success: false, error: 'Forbidden' }, 403);
  }

  const contentType = request.headers.get('content-type') ?? '';
  if (!contentType.includes('multipart/form-data')) {
    return response({ success: false, error: 'Invalid upload payload.' }, 400);
  }

  const formData = await request.formData();
  const imageFile = formData.get('file');

  if (!(imageFile instanceof File) || imageFile.size <= 0) {
    return response(
      { success: false, error: 'Please choose an image file.' },
      400
    );
  }

  try {
    const uploaded = await uploadBlogImageToCdn({
      userId: session.user.id,
      file: imageFile
    });

    return response({
      success: true,
      data: {
        url: uploaded.url
      }
    });
  } catch (error) {
    if (error instanceof CdnValidationError) {
      return response({ success: false, error: error.message }, 400);
    }

    return response(
      { success: false, error: 'Could not upload image right now.' },
      500
    );
  }
}
