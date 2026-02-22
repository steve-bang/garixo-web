import { NextResponse } from 'next/server';
import { z } from 'zod';

import { firebaseAdmin } from '@/lib/firebase-admin';
import type { ApiResponse } from '@/types/api';

const registerSchema = z.object({
  garageName: z.string().trim().min(2, 'Garage name is required.'),
  email: z
    .string()
    .trim()
    .min(1, 'Please enter your email address.')
    .max(254, 'Email address is too long.')
    .regex(
      /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
      'Please enter a valid email address.'
    ),
  password: z.string().min(6, 'Password must be at least 6 characters.')
});

type RegisterResponse = {
  email: string;
};

type FirebaseError = {
  code?: string;
  message?: string;
};

function response<T>(
  payload: ApiResponse<T>,
  status = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(payload, { status });
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function POST(
  request: Request
): Promise<NextResponse<ApiResponse<RegisterResponse>>> {
  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return response(
      {
        success: false,
        error: parsed.error.issues[0]?.message ?? 'Invalid input.'
      },
      400
    );
  }

  const normalizedEmail = normalizeEmail(parsed.data.email);
  const usersCollection = firebaseAdmin.db.collection('users');

  try {
    await firebaseAdmin.auth.getUserByEmail(normalizedEmail);
    return response(
      { success: false, error: 'Account already exists. Please sign in.' },
      409
    );
  } catch {
    // User does not exist, continue create flow.
  }

  try {
    const authUser = await firebaseAdmin.auth.createUser({
      email: normalizedEmail,
      password: parsed.data.password,
      displayName: parsed.data.garageName
    });

    const now = new Date().toISOString();
    await usersCollection.doc(authUser.uid).set(
      {
        id: authUser.uid,
        email: normalizedEmail,
        name: parsed.data.garageName,
        role: 'owner',
        createdAt: now
      },
      { merge: true }
    );

    return response(
      {
        success: true,
        data: {
          email: normalizedEmail
        }
      },
      201
    );
  } catch (error) {
    const firebaseError = error as FirebaseError;

    if (firebaseError.code === 'auth/email-already-exists') {
      return response(
        { success: false, error: 'Account already exists. Please sign in.' },
        409
      );
    }

    return response(
      { success: false, error: 'Could not create account. Please try again.' },
      500
    );
  }
}
