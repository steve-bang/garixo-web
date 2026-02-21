import { redirect } from 'next/navigation';

import { DashboardOnboardingState } from '@/features/onboarding/components/dashboard-onboarding-state';
import { auth } from '@/lib/auth';
import { getOnboardingState, listQuickWorkOrders } from '@/mocks/onboarding.mock';

export default async function DashboardPage(): Promise<JSX.Element> {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/auth/login');
  }

  const state = await getOnboardingState(session.user.id);

  if (!state.garageConfigured) {
    redirect('/onboarding/setup-garage');
  }

  const orders = await listQuickWorkOrders(session.user.id);

  return <DashboardOnboardingState workOrders={orders} />;
}
