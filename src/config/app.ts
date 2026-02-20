import { env } from '@/config/env';

export const appConfig = {
  appName: 'Garixo',
  appDescription: 'Garage management system',
  apiBaseUrl: env.NEXT_PUBLIC_API_URL,
  roles: ['admin', 'staff', 'user'] as const
};
