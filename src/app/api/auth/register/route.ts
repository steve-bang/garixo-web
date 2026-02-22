import { NextResponse } from 'next/server';
import { z } from 'zod';

import { firebaseAdmin } from '@/lib/firebase-admin';
import type { ApiResponse } from '@/types/api';

const registerSchema = z.object({
  garageName: z.string().trim().min(2, 'Garage name is required.'),
  phone: z
    .string()
    .trim()
    .min(9, 'Phone number must be at least 9 digits.')
    .regex(/^\+?[\d\s-]{9,}$/, 'Enter a valid phone number.'),
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

function buildGeneratedEmail(garageName: string, phone: string): string {
  const slug = garageName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '.');
  const phoneSuffix = phone.slice(-4);
  return `${slug || 'garage'}.${phoneSuffix}@garixo.local`;
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

  const normalizedPhone = parsed.data.phone.replace(/\D/g, '');
  const usersCollection = firebaseAdmin.db.collection('users');

  const existingByPhone = await usersCollection
    .where('phoneNormalized', '==', normalizedPhone)
    .limit(1)
    .get();
  if (!existingByPhone.empty) {
    return response(
      { success: false, error: 'Phone number already exists.' },
      409
    );
  }

  const generatedEmail = buildGeneratedEmail(
    parsed.data.garageName,
    normalizedPhone
  );

  try {
    await firebaseAdmin.auth.getUserByEmail(generatedEmail);
    return response(
      { success: false, error: 'Account already exists. Please sign in.' },
      409
    );
  } catch {
    // User does not exist, continue create flow.
  }

  try {
    const authUser = await firebaseAdmin.auth.createUser({
      email: generatedEmail,
      password: parsed.data.password,
      displayName: parsed.data.garageName
    });

    const now = new Date().toISOString();
    await usersCollection.doc(authUser.uid).set(
      {
        id: authUser.uid,
        email: generatedEmail,
        name: parsed.data.garageName,
        role: 'owner',
        phone: parsed.data.phone,
        phoneNormalized: normalizedPhone,
        createdAt: now
      },
      { merge: true }
    );

    return response(
      {
        success: true,
        data: {
          email: generatedEmail
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
