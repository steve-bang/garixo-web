import type { JSX } from 'react';

import { CustomerVehiclesManagementPage } from '@/features/customers/components/customer-vehicles-management-page';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function CustomerVehiclesPage({
  params
}: PageProps): Promise<JSX.Element> {
  const { id } = await params;
  return <CustomerVehiclesManagementPage customerId={id} />;
}
