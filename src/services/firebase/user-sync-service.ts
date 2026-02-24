import { firebaseAdmin } from '@/lib/firebase-admin';
import type { UserDocument } from '@/types/firebase-models';

export async function syncUserDocument(input: {
  id: string;
  email: string;
  name: string;
  emailVerifiedAt?: string;
}): Promise<UserDocument> {
  const ref = firebaseAdmin.db.collection('users').doc(input.id);
  const snap = await ref.get();

  if (snap.exists) {
    const existing = snap.data() as UserDocument;
    const nextEmailVerifiedAt =
      existing.emailVerifiedAt ?? input.emailVerifiedAt;

    if (
      existing.email !== input.email ||
      existing.name !== input.name ||
      existing.emailVerifiedAt !== nextEmailVerifiedAt
    ) {
      const updates: Partial<UserDocument> = {
        email: input.email,
        name: input.name,
        updatedAt: new Date().toISOString()
      };

      if (nextEmailVerifiedAt) {
        updates.emailVerifiedAt = nextEmailVerifiedAt;
      }

      await ref.set(updates, { merge: true });
      return { ...existing, ...updates };
    }

    return existing;
  }

  const now = new Date().toISOString();
  const doc: UserDocument = {
    id: input.id,
    email: input.email,
    name: input.name,
    role: 'owner',
    createdAt: now,
    ...(input.emailVerifiedAt ? { emailVerifiedAt: input.emailVerifiedAt } : {})
  };

  await ref.set(doc, { merge: true });
  return doc;
}

export async function getUserDocument(
  userId: string
): Promise<UserDocument | null> {
  const ref = firebaseAdmin.db.collection('users').doc(userId);
  const snap = await ref.get();
  if (!snap.exists) return null;
  return snap.data() as UserDocument;
}
