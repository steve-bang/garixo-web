import { firebaseAdmin } from '@/lib/firebase-admin';
import type { UserDocument } from '@/types/firebase-models';

export async function syncUserDocument(input: {
  id: string;
  email: string;
  name: string;
}): Promise<UserDocument> {
  const ref = firebaseAdmin.db.collection('users').doc(input.id);
  const snap = await ref.get();

  if (snap.exists) {
    return snap.data() as UserDocument;
  }

  const now = new Date().toISOString();
  const doc: UserDocument = {
    id: input.id,
    email: input.email,
    name: input.name,
    role: 'owner',
    createdAt: now
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
