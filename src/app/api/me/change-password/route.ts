import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import type { ApiResponse } from '@/types/api';

function response<T>(payload: ApiResponse<T>, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json(payload, { status });
}

export async function PUT(request: Request): Promise<NextResponse<ApiResponse<{ success: boolean }>>> {
  const session = await auth();

  if (!session?.user) {
    return response({ success: false, error: 'Unauthorized' }, 401);
  }

  const body = (await request.json().catch(() => null)) as { currentPassword?: string; newPassword?: string } | null;

  if (!body?.currentPassword || !body.newPassword) {
    return response({ success: false, error: 'All fields are required.' }, 400);
  }

  if (body.newPassword.trim().length < 8) {
    return response({ success: false, error: 'New password must be at least 8 characters.' }, 400);
  }

  if (body.currentPassword !== '12345678') {
    return response({ success: false, error: 'Current password is incorrect.' }, 400);
  }

  return response({ success: true, data: { success: true } });
}
