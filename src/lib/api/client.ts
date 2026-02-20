'use client';

import axios, { AxiosError } from 'axios';
import { getSession, signOut } from 'next-auth/react';

import { appConfig } from '@/config/app';
import { normalizeError } from '@/lib/errors/app-error';

export const apiClient = axios.create({
  baseURL: appConfig.apiBaseUrl,
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
