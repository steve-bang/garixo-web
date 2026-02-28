import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { errorResponse, successResponse } from '@/lib/api/handler';
import { firebaseAdmin } from '@/lib/firebase-admin';
import type { UserDocument } from '@/types/firebase-models';
import type { User } from '@/types/user';

/**
 * Users management list endpoint.
 *
 * Access model:
 * - Authenticated users only.
 * - Admin-only visibility.
 * - System-wide read for admin users.
 */

function toUserViewModel(
  id: string,
  doc: UserDocument
): User & { createdAt?: string; emailVerifiedAt?: string | null } {
  return {
    id,
    name: doc.name ?? '',
    email: doc.email ?? '',
    role: doc.role ?? 'user',
    phone: '',
    garageId: doc.garageId,
    avatarUrl: doc.avatarUrl,
    emailVerifiedAt: doc.emailVerifiedAt ?? null,
    createdAt: doc.createdAt
  };
}

export async function GET(): Promise<NextResponse> {
  try {
    const session = await auth();

    if (!session?.user) {
      return errorResponse(new Error('Unauthorized'), 401);
    }

    if (session.user.role !== 'admin') {
      return errorResponse(new Error('Unauthorized'), 401);
    }

    const snapshot = await firebaseAdmin.db.collection('users').get();

    const users = snapshot.docs
      .map((doc: { id: string; data: () => unknown }) =>
        toUserViewModel(doc.id, doc.data() as UserDocument)
      )
      .sort(
        (
          a: User & { createdAt?: string; emailVerifiedAt?: string | null },
          b: User & { createdAt?: string; emailVerifiedAt?: string | null }
        ) => {
          const left = new Date(b.createdAt ?? 0).getTime();
          const right = new Date(a.createdAt ?? 0).getTime();
          return left - right;
        }
      )
      .slice(0, 500);

    return successResponse(users);
  } catch (error) {
    return errorResponse(error);
  }
}
