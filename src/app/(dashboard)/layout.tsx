import { redirect } from 'next/navigation';
import type { JSX, ReactNode } from 'react';

import { DashboardLayoutShell } from '@/components/layout/dashboard-layout-shell';
import { auth } from '@/lib/auth';

export default async function DashboardLayout({ children }: { children: ReactNode }): Promise<JSX.Element> {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/login');
  }

  return <DashboardLayoutShell>{children}</DashboardLayoutShell>;
}
