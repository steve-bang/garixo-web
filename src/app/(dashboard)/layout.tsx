import { redirect } from 'next/navigation';
import type { JSX, ReactNode } from 'react';

import { DashboardLayoutShell } from '@/components/layout/dashboard-layout-shell';
import { auth } from '@/lib/auth';
import { getRequestGarage } from '@/lib/auth/garage-context';

export default async function DashboardLayout({
  children
}: {
  children: ReactNode;
}): Promise<JSX.Element> {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/auth/login');
  }

  const garage = await getRequestGarage(session);
  if (!garage) {
    redirect('/onboarding/setup-garage');
  }

  return <DashboardLayoutShell>{children}</DashboardLayoutShell>;
}
