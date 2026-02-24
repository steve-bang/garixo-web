import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

import { env } from '@/config/env';
import { firebaseAdmin } from '@/lib/firebase-admin';
import { getGarageByOwnerId } from '@/services/firebase/garage-service';
import { getUserDocument } from '@/services/firebase/user-sync-service';
import { sendVerificationEmail } from '@/services/email.service';
import type { UserDocument } from '@/types/firebase-models';

const VERIFY_TOKEN_WINDOW_MS = 48 * 60 * 60 * 1000;

type VerificationRecord = UserDocument & {
  emailVerifyTokenHash?: string | null;
  emailVerifyTokenExpiresAt?: string | null;
  emailVerifyTokenUsedAt?: string | null;
};

export type VerifyStatus =
  | 'success'
  | 'expired'
  | 'invalid'
  | 'already_verified';

type SendOptions = {
  userId: string;
  email?: string;
  ownerName?: string;
};

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function hashVerifyToken(token: string): string {
  return createHash('sha256')
    .update(`${token}.${env.NEXTAUTH_SECRET}`)
    .digest('hex');
}

function buildVerifyUrl(userId: string, token: string): string {
  const verifyUrl = new URL('/api/auth/verify-email', env.NEXTAUTH_URL);
  verifyUrl.searchParams.set('uid', userId);
  verifyUrl.searchParams.set('token', token);
  return verifyUrl.toString();
}

async function readVerificationRecord(
  userId: string
): Promise<VerificationRecord | null> {
  const snap = await firebaseAdmin.db.collection('users').doc(userId).get();
  if (!snap.exists) return null;
  return snap.data() as VerificationRecord;
}

async function resolveTargetUser(
  options: SendOptions
): Promise<{ userId: string; email: string; ownerName?: string } | null> {
  const userId = options.userId;
  const authUser = await firebaseAdmin.auth.getUser(userId).catch(() => null);
  if (!authUser?.email) return null;

  const userDoc = await getUserDocument(userId);
  const email = normalizeEmail(options.email ?? authUser.email);
  const ownerName = options.ownerName ?? userDoc?.name ?? undefined;
  return { userId, email, ownerName };
}

async function hasGarage(userId: string): Promise<boolean> {
  const garage = await getGarageByOwnerId(userId);
  return Boolean(garage);
}

export async function sendVerificationForUser(options: SendOptions): Promise<{
  success: boolean;
  alreadyVerified: boolean;
}> {
  const target = await resolveTargetUser(options);
  if (!target) {
    return { success: true, alreadyVerified: false };
  }

  const garageExists = await hasGarage(target.userId);
  if (!garageExists) {
    return { success: true, alreadyVerified: false };
  }

  const authUser = await firebaseAdmin.auth
    .getUser(target.userId)
    .catch(() => null);
  const userDoc = await getUserDocument(target.userId);
  const isVerified = Boolean(
    authUser?.emailVerified || userDoc?.emailVerifiedAt
  );

  if (isVerified) {
    const verifiedAt =
      userDoc?.emailVerifiedAt ??
      authUser?.metadata.lastSignInTime ??
      authUser?.metadata.creationTime ??
      new Date().toISOString();

    await firebaseAdmin.db.collection('users').doc(target.userId).set(
      {
        emailVerifiedAt: verifiedAt,
        emailVerifyTokenHash: null,
        emailVerifyTokenExpiresAt: null,
        emailVerifyTokenUsedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      { merge: true }
    );

    return { success: true, alreadyVerified: true };
  }

  const token = randomBytes(32).toString('hex');
  const tokenHash = hashVerifyToken(token);
  const expiresAt = new Date(Date.now() + VERIFY_TOKEN_WINDOW_MS).toISOString();

  await firebaseAdmin.db.collection('users').doc(target.userId).set(
    {
      emailVerifyTokenHash: tokenHash,
      emailVerifyTokenExpiresAt: expiresAt,
      emailVerifyTokenUsedAt: null,
      updatedAt: new Date().toISOString()
    },
    { merge: true }
  );

  const sent = await sendVerificationEmail({
    recipientEmail: target.email,
    ownerName: target.ownerName,
    verifyUrl: buildVerifyUrl(target.userId, token)
  });

  return {
    success: sent,
    alreadyVerified: false
  };
}

export async function verifyEmailToken(input: {
  uid: string;
  token: string;
}): Promise<{ status: VerifyStatus; email?: string }> {
  const record = await readVerificationRecord(input.uid);
  if (!record) {
    return { status: 'invalid' };
  }

  const garageExists = await hasGarage(input.uid);
  if (!garageExists) {
    return { status: 'invalid' };
  }

  if (record.emailVerifiedAt) {
    return { status: 'already_verified', email: record.email };
  }

  const now = Date.now();
  const tokenHash = record.emailVerifyTokenHash;
  const tokenExpiresAt = record.emailVerifyTokenExpiresAt;
  const tokenUsedAt = record.emailVerifyTokenUsedAt;

  if (!tokenHash || !tokenExpiresAt || tokenUsedAt) {
    return { status: 'invalid', email: record.email };
  }

  if (new Date(tokenExpiresAt).getTime() < now) {
    await firebaseAdmin.db.collection('users').doc(input.uid).set(
      {
        emailVerifyTokenUsedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      { merge: true }
    );
    return { status: 'expired', email: record.email };
  }

  const expected = Buffer.from(hashVerifyToken(input.token));
  const received = Buffer.from(tokenHash);
  const isMatch =
    expected.length === received.length && timingSafeEqual(expected, received);

  if (!isMatch) {
    return { status: 'invalid', email: record.email };
  }

  await firebaseAdmin.auth.updateUser(input.uid, { emailVerified: true });

  const verifiedAt = new Date().toISOString();
  await firebaseAdmin.db.collection('users').doc(input.uid).set(
    {
      emailVerifiedAt: verifiedAt,
      emailVerifyTokenHash: null,
      emailVerifyTokenExpiresAt: null,
      emailVerifyTokenUsedAt: verifiedAt,
      updatedAt: verifiedAt
    },
    { merge: true }
  );

  return { status: 'success', email: record.email };
}

export async function sendVerificationByEmail(email: string): Promise<boolean> {
  const normalizedEmail = normalizeEmail(email);
  const authUser = await firebaseAdmin.auth
    .getUserByEmail(normalizedEmail)
    .catch(() => null);
  if (!authUser?.uid) {
    return true;
  }

  const result = await sendVerificationForUser({
    userId: authUser.uid,
    email: normalizedEmail
  });

  return result.success;
}
