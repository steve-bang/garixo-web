import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { firebaseAdmin } from '@/lib/firebase-admin';
import type { User } from '@/features/profile/types';
import type { UserDocument } from '@/types/firebase-models';
import type { ApiResponse } from '@/types/api';

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

function mapRole(role: string | undefined): User['role'] {
  return role === 'staff' ? 'staff' : 'owner';
}

function extensionFromMime(type: string): string {
  if (type === 'image/png') return 'png';
  if (type === 'image/webp') return 'webp';
  return 'jpg';
}

function toProfile(
  doc: Partial<UserDocument> & { id: string; email: string; avatarUrl?: string }
): User {
  return {
    id: doc.id,
    email: doc.email,
    fullName: doc.name,
    avatarUrl: doc.avatarUrl,
    role: mapRole(doc.role)
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
      createdAt
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

    const buffer = Buffer.from(await avatarFile.arrayBuffer());
    const ext = extensionFromMime(avatarFile.type);
    const filePath = `users/${session.user.id}/avatar.${ext}`;
    const file = firebaseAdmin.storage.bucket().file(filePath);

    await file.save(buffer, {
      contentType: avatarFile.type,
      resumable: false
    });

    const [signedUrl] = await file.getSignedUrl({
      action: 'read',
      expires: '2100-01-01'
    });
    avatarUrl = signedUrl;
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
