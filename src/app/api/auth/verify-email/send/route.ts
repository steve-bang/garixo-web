import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { sendVerificationForUser } from '@/services/verification.service';
import type { ApiResponse } from '@/types/api';

type VerifyEmailSendResponse = {
  accepted: true;
  alreadyVerified: boolean;
};

function response<T>(
  payload: ApiResponse<T>,
  status = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(payload, { status });
}

export async function POST(): Promise<
  NextResponse<ApiResponse<VerifyEmailSendResponse>>
> {
  const session = await auth();

  if (!session?.user?.id || !session.user.email) {
    return response({ success: false, error: 'Please sign in first.' }, 401);
  }

  if (session.user.role !== 'owner') {
    return response(
      { success: false, error: 'Only garage owners can request this action.' },
      403
    );
  }

  const result = await sendVerificationForUser({
    userId: session.user.id,
    email: session.user.email,
    ownerName: session.user.name ?? undefined
  });

  if (!result.success) {
    return response(
      { success: false, error: 'Could not send verification email now.' },
      503
    );
  }

  return response({
    success: true,
    data: {
      accepted: true,
      alreadyVerified: result.alreadyVerified
    }
  });
}
