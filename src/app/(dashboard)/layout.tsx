import { redirect } from 'next/navigation';
import type { JSX, ReactNode } from 'react';

import { DashboardLayoutShell } from '@/components/layout/dashboard-layout-shell';
import type { BillingStatus, PlanCode } from '@/features/billing/types';
import { auth } from '@/lib/auth';
import { getRequestGarage } from '@/lib/auth/garage-context';
import { firebaseAdmin } from '@/lib/firebase-admin';
import type { GarageBillingDocument } from '@/types/firebase-models';

const BILLING_DOC_ID = 'current';

async function getGarageBillingSummary(garageId: string): Promise<{
  planCode: PlanCode;
  status: BillingStatus;
}> {
  const billingRef = firebaseAdmin.db
    .collection('garages')
    .doc(garageId)
    .collection('billing')
    .doc(BILLING_DOC_ID);
  const billingSnap = await billingRef.get();
  if (!billingSnap.exists) {
    return {
      planCode: 'free',
      status: 'active'
    };
  }

  const billing = billingSnap.data() as Partial<GarageBillingDocument>;
  return {
    planCode: billing.planCode ?? 'free',
    status: billing.status ?? 'active'
  };
}

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

  const billingSummary = await getGarageBillingSummary(garage.id);

  return (
    <DashboardLayoutShell
      currentPlan={billingSummary.planCode}
      billingStatus={billingSummary.status}
      currentUserRole={session.user.role}
    >
      {children}
    </DashboardLayoutShell>
  );
}
