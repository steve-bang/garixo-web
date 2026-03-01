import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { firebaseAdmin } from '@/lib/firebase-admin';
import type { ApiResponse } from '@/types/api';

function response<T>(
  payload: ApiResponse<T>,
  status = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(payload, { status });
}

function validImageType(type: string): boolean {
  return ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(type);
}

function extensionFromMime(type: string): string {
  if (type === 'image/png') return 'png';
  if (type === 'image/webp') return 'webp';
  if (type === 'image/gif') return 'gif';
  return 'jpg';
}

function sanitizeFileName(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
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

  if (!validImageType(imageFile.type)) {
    return response(
      {
        success: false,
        error: 'Only JPG, PNG, WEBP, or GIF files are allowed.'
      },
      400
    );
  }

  if (imageFile.size > 5 * 1024 * 1024) {
    return response(
      {
        success: false,
        error: 'Image must be 5MB or smaller.'
      },
      400
    );
  }

  const ext = extensionFromMime(imageFile.type);
  const baseName = sanitizeFileName(imageFile.name.replace(/\.[^.]+$/, ''));
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const filePath = `blogs/images/${session.user.id}/${baseName || 'image'}-${unique}.${ext}`;

  const buffer = Buffer.from(await imageFile.arrayBuffer());
  const file = firebaseAdmin.storage.bucket().file(filePath);

  await file.save(buffer, {
    contentType: imageFile.type,
    resumable: false,
    metadata: {
      cacheControl: 'public,max-age=31536000,immutable'
    }
  });

  const [signedUrl] = await file.getSignedUrl({
    action: 'read',
    expires: '03-01-2035'
  });

  return response({
    success: true,
    data: {
      url: signedUrl
    }
  });
}
