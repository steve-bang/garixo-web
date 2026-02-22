'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { useEffect } from 'react';

import { LoadingState } from '@/components/common/loading-state';

type ProtectedRouteProps = {
  children: ReactNode;
  allowedRoles?: Array<'owner' | 'admin' | 'staff' | 'user'>;
};

export function ProtectedRoute({
  children,
  allowedRoles
}: ProtectedRouteProps): JSX.Element {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/auth/login');
      return;
    }

    if (
      status === 'authenticated' &&
      allowedRoles &&
      !allowedRoles.includes(session.user.role)
    ) {
      router.replace('/dashboard');
    }
  }, [allowedRoles, router, session, status]);

  if (status === 'loading') {
    return <LoadingState fullPage />;
  }

  if (status !== 'authenticated') {
    return <LoadingState fullPage label="Redirecting..." />;
  }

  if (allowedRoles && !allowedRoles.includes(session.user.role)) {
    return <LoadingState fullPage label="Checking permissions..." />;
  }

  return <>{children}</>;
}
