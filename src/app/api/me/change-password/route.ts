import { NextResponse } from 'next/server';

import { env } from '@/config/env';
import { auth } from '@/lib/auth';
import { firebaseAdmin } from '@/lib/firebase-admin';
import type { ApiResponse } from '@/types/api';

function response<T>(
  payload: ApiResponse<T>,
  status = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(payload, { status });
}

export async function PUT(
  request: Request
): Promise<NextResponse<ApiResponse<{ success: boolean }>>> {
  const session = await auth();

  if (!session?.user?.id || !session.user.email) {
    return response({ success: false, error: 'Unauthorized' }, 401);
  }

  const body = (await request.json().catch(() => null)) as {
    currentPassword?: string;
    newPassword?: string;
  } | null;

  if (!body?.currentPassword || !body.newPassword) {
    return response({ success: false, error: 'All fields are required.' }, 400);
  }

  if (body.newPassword.trim().length < 8) {
    return response(
      { success: false, error: 'New password must be at least 8 characters.' },
      400
    );
  }

  const apiKey = env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) {
    return response(
      { success: false, error: 'Password service is not configured.' },
      500
    );
  }

  const normalizedEmail = session.user.email.trim().toLowerCase();

  try {
    const verifyResponse = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: normalizedEmail,
          password: body.currentPassword,
          returnSecureToken: true
        }),
        cache: 'no-store'
      }
    );

    if (!verifyResponse.ok) {
      return response(
        { success: false, error: 'Current password is incorrect.' },
        400
      );
    }

    await firebaseAdmin.auth.updateUser(session.user.id, {
      password: body.newPassword
    });

    return response({ success: true, data: { success: true } });
  } catch {
    return response(
      { success: false, error: 'Could not update password. Please try again.' },
      500
    );
  }
}
