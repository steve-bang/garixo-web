import type { Metadata } from 'next';
import { WorkOrderDetailPage } from '@/features/work-orders/components/work-order-detail-page';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  return {
    title: `Work Order ${id} | Garixo`,
    description: 'View and manage work order details, services, and parts.'
  };
}

export default async function WorkOrderDetailRoute({
  params
}: Props): Promise<JSX.Element> {
  const { id } = await params;

  return <WorkOrderDetailPage orderId={id} />;
}
