import { redirect } from 'next/navigation';

import { DashboardOnboardingState } from '@/features/onboarding/components/dashboard-onboarding-state';
import { auth } from '@/lib/auth';
import { getGarageByOwnerId } from '@/services/firebase/garage-service';
import { listGarageWorkOrders } from '@/services/firebase/work-orders-service';

export default async function DashboardPage(): Promise<JSX.Element> {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/auth/login');
  }

  const garage = await getGarageByOwnerId(session.user.id);
  if (!garage) {
    redirect('/onboarding/setup-garage');
  }

  const orders = (await listGarageWorkOrders(garage.id)).map((item) => ({
    id: item.id,
    customerName: item.customerName,
    licensePlate: item.licensePlate,
    service: item.service,
    notes: item.notes,
    createdAt: item.createdAt
  }));

  return <DashboardOnboardingState workOrders={orders} />;
}
