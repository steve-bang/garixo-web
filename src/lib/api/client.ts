'use client';

import axios, { AxiosError } from 'axios';
import { getSession, signOut } from 'next-auth/react';

import { normalizeError } from '@/lib/errors/app-error';

export const apiClient = axios.create({
  // Use public runtime env directly to avoid importing server-only env schema
  // into client bundles (which validates NEXTAUTH_* and can throw in browser).
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

apiClient.interceptors.request.use(async (config) => {
  const session = await getSession();

  if (session?.accessToken) {
    config.headers.Authorization = `Bearer ${session.accessToken}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      await signOut({ callbackUrl: '/auth/login' });
    }

    return Promise.reject(normalizeError(error));
  }
);
