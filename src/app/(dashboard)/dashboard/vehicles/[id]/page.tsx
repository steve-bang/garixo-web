import type { Metadata } from 'next';

import { VehicleDetailPage } from '@/features/vehicles/components/vehicle-detail-page';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  return {
    title: `Vehicle ${id} | Garixo`,
    description:
      'View and manage vehicle profile, owner information, and work order history.'
  };
}

export default async function VehicleDetailRoute({
  params
}: Props): Promise<JSX.Element> {
  const { id } = await params;

  return <VehicleDetailPage vehicleId={id} />;
}
