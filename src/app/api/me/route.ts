import { NextResponse } from 'next/server';

import { getMockCurrentUser, updateMockCurrentUser } from '@/mocks/user.mock';
import { auth } from '@/lib/auth';
import type { User } from '@/features/profile/types';
import type { ApiResponse } from '@/types/api';

function response<T>(payload: ApiResponse<T>, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json(payload, { status });
}

function validImageType(type: string): boolean {
  return ['image/jpeg', 'image/png', 'image/webp'].includes(type);
}

export async function GET(): Promise<NextResponse<ApiResponse<User>>> {
  const session = await auth();

  if (!session?.user) {
    return response({ success: false, error: 'Unauthorized' }, 401);
  }

  const profile = await getMockCurrentUser(session.user.id);

  return response({ success: true, data: profile });
}

export async function PUT(request: Request): Promise<NextResponse<ApiResponse<User>>> {
  const session = await auth();

  if (!session?.user) {
    return response({ success: false, error: 'Unauthorized' }, 401);
  }

  const contentType = request.headers.get('content-type') ?? '';

  if (!contentType.includes('multipart/form-data')) {
    return response({ success: false, error: 'Invalid payload format.' }, 400);
  }

  const formData = await request.formData();
  const fullName = String(formData.get('fullName') ?? '').trim();
  const avatarFile = formData.get('avatarFile');

  let avatarUrl: string | undefined;

  if (avatarFile instanceof File && avatarFile.size > 0) {
    if (!validImageType(avatarFile.type)) {
      return response({ success: false, error: 'Only jpg, png, webp files are allowed.' }, 400);
    }

    if (avatarFile.size > 2 * 1024 * 1024) {
      return response({ success: false, error: 'Image must be 2MB or smaller.' }, 400);
    }

    const buffer = Buffer.from(await avatarFile.arrayBuffer());
    avatarUrl = `data:${avatarFile.type};base64,${buffer.toString('base64')}`;
  }

  const updated = await updateMockCurrentUser(session.user.id, {
    fullName: fullName || undefined,
    avatarUrl
  });

  return response({ success: true, data: updated });
}
