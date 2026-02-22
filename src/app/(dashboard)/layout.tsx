import { redirect } from 'next/navigation';
import type { JSX, ReactNode } from 'react';

import { DashboardLayoutShell } from '@/components/layout/dashboard-layout-shell';
import { auth } from '@/lib/auth';
import { getGarageByOwnerId } from '@/services/firebase/garage-service';

export default async function DashboardLayout({
  children
}: {
  children: ReactNode;
}): Promise<JSX.Element> {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/auth/login');
  }

  const garage = await getGarageByOwnerId(session.user.id);
  if (!garage) {
    redirect('/onboarding/setup-garage');
  }

  return <DashboardLayoutShell>{children}</DashboardLayoutShell>;
}
