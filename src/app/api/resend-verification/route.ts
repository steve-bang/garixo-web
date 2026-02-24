import { NextResponse } from 'next/server';
import { z } from 'zod';

import { auth } from '@/lib/auth';
import {
  sendVerificationByEmail,
  sendVerificationForUser
} from '@/services/verification.service';
import type { ApiResponse } from '@/types/api';

const resendSchema = z.object({
  email: z.string().email().optional()
});

function response<T>(
  payload: ApiResponse<T>,
  status = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(payload, { status });
}

export async function POST(
  request: Request
): Promise<NextResponse<ApiResponse<{ success: true }>>> {
  const session = await auth();
  const body = await request.json().catch(() => null);
  const parsed = resendSchema.safeParse(body ?? {});

  if (session?.user?.id && session.user.email) {
    await sendVerificationForUser({
      userId: session.user.id,
      email: session.user.email,
      ownerName: session.user.name ?? undefined
    }).catch(() => null);

    return response({ success: true, data: { success: true } });
  }

  if (parsed.success && parsed.data.email) {
    await sendVerificationByEmail(parsed.data.email).catch(() => null);
    return response({ success: true, data: { success: true } });
  }

  return response({ success: true, data: { success: true } });
}
