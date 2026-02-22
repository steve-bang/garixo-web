import type { NextAuthOptions } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';

import { env } from '@/config/env';
import { loginSchema } from '@/features/auth/schema';
import { firebaseAdmin } from '@/lib/firebase-admin';
import {
  getUserDocument,
  syncUserDocument
} from '@/services/firebase/user-sync-service';

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_WINDOW_MS = 10 * 60 * 1000;

type LoginAttemptState = {
  failedAttempts: number;
  lockedUntil: number;
};

const loginAttempts = new Map<string, LoginAttemptState>();
const firebaseSignInResponseSchema = z.object({
  localId: z.string().min(1),
  email: z.string().email(),
  displayName: z.string().optional(),
  idToken: z.string().min(1)
});

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function isLocked(email: string, now: number): boolean {
  const state = loginAttempts.get(email);
  return Boolean(state && state.lockedUntil > now);
}

function registerFailedAttempt(email: string, now: number): void {
  const previous = loginAttempts.get(email);
  const failedAttempts = (previous?.failedAttempts ?? 0) + 1;

  if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
    loginAttempts.set(email, {
      failedAttempts: 0,
      lockedUntil: now + LOCK_WINDOW_MS
    });
    return;
  }

  loginAttempts.set(email, { failedAttempts, lockedUntil: 0 });
}

function clearFailedAttempts(email: string): void {
  loginAttempts.delete(email);
}

async function signInWithFirebase(
  email: string,
  password: string
): Promise<z.infer<typeof firebaseSignInResponseSchema> | null> {
  const apiKey = env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) {
    return null;
  }

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        returnSecureToken: true
      }),
      cache: 'no-store'
    }
  );

  if (!response.ok) {
    return null;
  }

  const payload = await response.json().catch(() => null);
  const parsed = firebaseSignInResponseSchema.safeParse(payload);

  if (!parsed.success) {
    return null;
  }

  return parsed.data;
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt' as const
  },
  pages: {
    signIn: '/auth/login'
  },
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email address', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        const normalizedEmail = normalizeEmail(parsed.data.email);
        const now = Date.now();

        if (isLocked(normalizedEmail, now)) {
          return null;
        }

        const firebaseSession = await signInWithFirebase(
          normalizedEmail,
          parsed.data.password
        );

        if (!firebaseSession) {
          registerFailedAttempt(normalizedEmail, now);
          return null;
        }

        const userDoc = await getUserDocument(firebaseSession.localId);

        clearFailedAttempts(normalizedEmail);

        return {
          id: firebaseSession.localId,
          email: firebaseSession.email,
          name:
            userDoc?.name ??
            firebaseSession.displayName ??
            firebaseSession.email,
          role: userDoc?.role ?? 'owner',
          accessToken: firebaseSession.idToken
        };
      }
    })
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.id || !user.email) {
        return false;
      }

      try {
        await syncUserDocument({
          id: user.id,
          email: user.email,
          name: user.name ?? user.email
        });
        return true;
      } catch {
        return false;
      }
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.accessToken =
          (user as { accessToken?: string }).accessToken ??
          (token.sub
            ? await firebaseAdmin.auth.createCustomToken(token.sub)
            : token.accessToken);
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const firestoreUser = token.sub
          ? await getUserDocument(token.sub)
          : null;
        session.user.id = token.sub ?? '';
        session.user.role = z
          .enum(['owner', 'admin', 'staff', 'user'])
          .parse(firestoreUser?.role ?? token.role ?? 'owner');
        session.accessToken = token.accessToken;
      }

      return session;
    }
  }
};
