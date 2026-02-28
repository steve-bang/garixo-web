import type { Metadata } from 'next';
import { JSX, Suspense } from 'react';

import { WorkOrdersManagementPage } from '@/features/work-orders/components/work-orders-management-page';

export const metadata: Metadata = {
  title: 'Work Orders | Garixo',
  description: 'Track, prioritize, and manage garage work orders.'
};

export default function WorkOrdersPage(): JSX.Element {
  return (
    <Suspense fallback={<div className="h-32 w-full" />}>
      <WorkOrdersManagementPage />
    </Suspense>
  );
}
