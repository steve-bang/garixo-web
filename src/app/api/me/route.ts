import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { getRequestGarageId } from '@/lib/auth/garage-context';
import { firebaseAdmin } from '@/lib/firebase-admin';
import {
  CdnValidationError,
  uploadUserAvatarToCdn
} from '@/services/cdn/firebase-cdn-service';
import type { UserDocument } from '@/types/firebase-models';
import type { ApiResponse } from '@/types/api';
import { USER_ROLES, type User, type UserRole } from '@/types/user';

function response<T>(
  payload: ApiResponse<T>,
  status = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(payload, { status });
}

function validImageType(type: string): boolean {
  return ['image/jpeg', 'image/png', 'image/webp'].includes(type);
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function validEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

function mapRole(role: string | undefined): UserRole {
  return USER_ROLES.includes(role as UserRole) ? (role as UserRole) : 'owner';
}

function toProfile(
  doc: Partial<UserDocument> & { id: string; email: string; avatarUrl?: string }
): User {
  return {
    id: doc.id,
    email: doc.email,
    name: doc.name ?? doc.email,
    avatarUrl: doc.avatarUrl,
    role: mapRole(doc.role),
    emailVerifiedAt: doc.emailVerifiedAt
  };
}

export async function GET(): Promise<NextResponse<ApiResponse<User>>> {
  const session = await auth();

  if (!session?.user?.id || !session.user.email) {
    return response({ success: false, error: 'Unauthorized' }, 401);
  }

  const userRef = firebaseAdmin.db.collection('users').doc(session.user.id);
  const snapshot = await userRef.get();

  if (!snapshot.exists) {
    const createdAt = new Date().toISOString();
    const created: UserDocument = {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name ?? session.user.email,
      role: mapRole(session.user.role),
      createdAt,
      emailVerifiedAt: session.user.emailVerifiedAt
    };
    await userRef.set(created, { merge: true });
    return response({ success: true, data: toProfile(created) });
  }

  const data = snapshot.data() as UserDocument;
  const profile = toProfile({
    ...data,
    id: data.id ?? session.user.id,
    email: data.email ?? session.user.email
  });

  return response({ success: true, data: profile });
}

export async function PUT(
  request: Request
): Promise<NextResponse<ApiResponse<User>>> {
  const session = await auth();

  if (!session?.user?.id || !session.user.email) {
    return response({ success: false, error: 'Unauthorized' }, 401);
  }

  const contentType = request.headers.get('content-type') ?? '';

  if (!contentType.includes('multipart/form-data')) {
    return response({ success: false, error: 'Invalid payload format.' }, 400);
  }

  const formData = await request.formData();
  const emailRaw = String(formData.get('email') ?? '');
  const email = normalizeEmail(emailRaw);
  const fullName = String(formData.get('fullName') ?? '').trim();
  const avatarFile = formData.get('avatarFile');

  if (!email) {
    return response(
      { success: false, error: 'Please enter your email address.' },
      400
    );
  }

  if (email.length > 254) {
    return response(
      { success: false, error: 'Email address is too long.' },
      400
    );
  }

  if (!validEmail(email)) {
    return response(
      { success: false, error: 'Please enter a valid email address.' },
      400
    );
  }

  const userRef = firebaseAdmin.db.collection('users').doc(session.user.id);
  const currentSnapshot = await userRef.get();
  const currentData = currentSnapshot.exists
    ? (currentSnapshot.data() as UserDocument & { avatarUrl?: string })
    : null;
  const garageId = await getRequestGarageId(session);

  let avatarUrl = currentData?.avatarUrl;

  if (avatarFile instanceof File && avatarFile.size > 0) {
    if (!validImageType(avatarFile.type)) {
      return response(
        { success: false, error: 'Only jpg, png, webp files are allowed.' },
        400
      );
    }

    if (avatarFile.size > 2 * 1024 * 1024) {
      return response(
        { success: false, error: 'Image must be 2MB or smaller.' },
        400
      );
    }

    try {
      const uploaded = await uploadUserAvatarToCdn({
        garageId: garageId ?? undefined,
        userId: session.user.id,
        file: avatarFile
      });
      avatarUrl = uploaded.url;
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

  const createdAt = currentData?.createdAt ?? new Date().toISOString();
  const nextName = fullName || currentData?.name || session.user.name || email;
  const nextRole = mapRole(currentData?.role ?? session.user.role);

  try {
    if (email !== normalizeEmail(session.user.email)) {
      await firebaseAdmin.auth.updateUser(session.user.id, { email });
    }
  } catch {
    return response(
      {
        success: false,
        error: 'This email cannot be used. Please try another email address.'
      },
      400
    );
  }

  const payload: UserDocument = {
    id: session.user.id,
    email,
    name: nextName,
    role: nextRole,
    createdAt,
    emailVerifiedAt:
      currentData?.emailVerifiedAt ?? session.user.emailVerifiedAt,
    updatedAt: new Date().toISOString(),
    ...(avatarUrl ? { avatarUrl } : {})
  };

  await userRef.set(payload, { merge: true });

  const updated = toProfile({
    id: payload.id,
    email: payload.email,
    name: payload.name,
    role: payload.role,
    avatarUrl: payload.avatarUrl
  });

  return response({ success: true, data: updated });
}
