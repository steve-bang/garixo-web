import type { Metadata } from 'next';
import { JSX, Suspense } from 'react';

import { CustomersManagementPage } from '@/features/customers/components/customers-management-page';

export const metadata: Metadata = {
  title: 'Customers | Garixo',
  description: 'Manage customer profiles, visits, and spending history.'
};

export default function CustomersPage(): JSX.Element {
  return (
    <Suspense fallback={<div className="h-32 w-full" />}>
      <CustomersManagementPage />
    </Suspense>
  );
}
