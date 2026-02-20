'use client';

import { SessionProvider } from 'next-auth/react';
import type { ReactNode } from 'react';
import { Toaster } from 'sonner';

import { ReactQueryProvider } from '@/lib/react-query/provider';

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps): JSX.Element {
  return (
    <SessionProvider>
      <ReactQueryProvider>
        {children}
        <Toaster richColors position="top-right" />
      </ReactQueryProvider>
    </SessionProvider>
  );
}
