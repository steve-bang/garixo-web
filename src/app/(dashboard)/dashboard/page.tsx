import { redirect } from 'next/navigation';

import { DashboardOnboardingState } from '@/features/onboarding/components/dashboard-onboarding-state';
import { auth } from '@/lib/auth';
import { getRequestGarage } from '@/lib/auth/garage-context';
import {
  getDashboardOverviewSummary,
  getRevenueSummary
} from '@/services/firebase/dashboard-summary-service';
import { getUserDocument } from '@/services/firebase/user-sync-service';
import { listGarageWorkOrders } from '@/services/firebase/work-orders-service';

export default async function DashboardPage(): Promise<JSX.Element> {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/auth/login');
  }

  const garage = await getRequestGarage(session);
  if (!garage) {
    redirect('/onboarding/setup-garage');
  }

  const [overview, revenue, workOrders, userDoc] = await Promise.all([
    getDashboardOverviewSummary(garage.id),
    getRevenueSummary(garage.id),
    listGarageWorkOrders(garage.id),
    getUserDocument(session.user.id)
  ]);

  const recentWorkOrders = workOrders
    .slice()
    .sort(
      (a, b) =>
        new Date(b.updatedAt ?? b.createdAt).getTime() -
        new Date(a.updatedAt ?? a.createdAt).getTime()
    )
    .slice(0, 5)
    .map((item) => ({
      id: item.id,
      orderCode: item.orderCode,
      customerName: item.customerName,
      licensePlate: item.licensePlate,
      status: item.status,
      totalAmount: item.totalAmount,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    }));

  return (
    <DashboardOnboardingState
      ownerName={session.user.name ?? undefined}
      garageName={garage.name}
      ownerEmail={session.user.email ?? userDoc?.email}
      ownerCreatedAt={userDoc?.createdAt}
      ownerEmailVerifiedAt={
        session.user.emailVerifiedAt ?? userDoc?.emailVerifiedAt ?? null
      }
      metrics={{
        carsInShop: overview.carsInShop,
        waitingForApproval: overview.waitingApproval,
        readyForPickup: overview.readyForPickup,
        stuckInProgress: overview.stuckJobs,
        todayRevenue: revenue.today.totalRevenue,
        weekRevenue: revenue.week.totalRevenue,
        monthRevenue: revenue.month.totalRevenue
      }}
      recentWorkOrders={recentWorkOrders}
    />
  );
}
