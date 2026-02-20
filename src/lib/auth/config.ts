import type { NextAuthOptions } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { createHash, timingSafeEqual } from 'node:crypto';
import { z } from 'zod';

import { loginSchema } from '@/features/auth/schema';
import { mockUsers } from '@/lib/auth/mock-users';

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_WINDOW_MS = 10 * 60 * 1000;

type LoginAttemptState = {
  failedAttempts: number;
  lockedUntil: number;
};

const loginAttempts = new Map<string, LoginAttemptState>();

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function safeComparePassword(input: string, actual: string): boolean {
  const inputHash = createHash('sha256').update(input).digest();
  const actualHash = createHash('sha256').update(actual).digest();
  return timingSafeEqual(inputHash, actualHash);
}

function isLocked(email: string, now: number): boolean {
  const state = loginAttempts.get(email);
  return Boolean(state && state.lockedUntil > now);
}

function registerFailedAttempt(email: string, now: number): void {
  const previous = loginAttempts.get(email);
  const failedAttempts = (previous?.failedAttempts ?? 0) + 1;

  if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
    loginAttempts.set(email, { failedAttempts: 0, lockedUntil: now + LOCK_WINDOW_MS });
    return;
  }

  loginAttempts.set(email, { failedAttempts, lockedUntil: 0 });
}

function clearFailedAttempts(email: string): void {
  loginAttempts.delete(email);
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

        const user = mockUsers.find((item) => normalizeEmail(item.email) === normalizedEmail);

        if (!user) {
          registerFailedAttempt(normalizedEmail, now);
          return null;
        }

        const isValidPassword = safeComparePassword(parsed.data.password, user.password);

        if (!isValidPassword) {
          registerFailedAttempt(normalizedEmail, now);
          return null;
        }

        clearFailedAttempts(normalizedEmail);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.accessToken = `mock-token-${user.id}`;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? '';
        session.user.role = z.enum(['admin', 'staff', 'user']).parse(token.role ?? 'user');
        session.accessToken = token.accessToken;
      }

      return session;
    }
  }
};
