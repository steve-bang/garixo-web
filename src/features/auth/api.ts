'use client';

import { signIn, signOut } from 'next-auth/react';

import type { ForgotPasswordPayload, LoginPayload, RegisterPayload, ResetPasswordPayload } from '@/features/auth/types';
import type { ApiResponse } from '@/types/api';

export async function login(payload: LoginPayload): Promise<ApiResponse<null>> {
  const response = await signIn('credentials', {
    ...payload,
    redirect: false
  });

  if (!response || response.error) {
    return {
      success: false,
      error: 'Incorrect email or password.'
    };
  }

  return { success: true, data: null };
}

export async function logout(): Promise<void> {
  await signOut({ callbackUrl: '/auth/login' });
}

export async function register(payload: RegisterPayload): Promise<ApiResponse<{ email: string }>> {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  return (await response.json()) as ApiResponse<{ email: string }>;
}

export async function forgotPassword(payload: ForgotPasswordPayload): Promise<ApiResponse<{ accepted: true }>> {
  const response = await fetch('/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  return (await response.json()) as ApiResponse<{ accepted: true }>;
}

export async function resetPassword(payload: ResetPasswordPayload): Promise<ApiResponse<{ updated: true }>> {
  const response = await fetch('/api/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  return (await response.json()) as ApiResponse<{ updated: true }>;
}
