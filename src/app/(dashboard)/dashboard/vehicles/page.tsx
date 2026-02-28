import type { Metadata } from 'next';
import { JSX, Suspense } from 'react';

import { VehiclesManagementPage } from '@/features/vehicles/components/vehicles-management-page';

export const metadata: Metadata = {
  title: 'Vehicles | Garixo',
  description: 'Track vehicle records, service status, and maintenance history.'
};

export default function VehiclesPage(): JSX.Element {
  return (
    <Suspense fallback={<div className="h-32 w-full" />}>
      <VehiclesManagementPage />
    </Suspense>
  );
}
