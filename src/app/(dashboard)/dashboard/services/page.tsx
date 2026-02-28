import type { Metadata } from 'next';
import { JSX, Suspense } from 'react';

import { ServicesManagementPage } from '@/features/services/components/services-management-page';

export const metadata: Metadata = {
  title: 'Services | Garixo',
  description: 'Manage service catalog, pricing, and service availability.'
};

export default function ServicesPage(): JSX.Element {
  return (
    <Suspense fallback={<div className="h-32 w-full" />}>
      <ServicesManagementPage />
    </Suspense>
  );
}
