import { WorkOrderDetailPage } from '@/features/work-orders/components/work-order-detail-page';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function WorkOrderDetailRoute({
  params
}: Props): Promise<JSX.Element> {
  const { id } = await params;

  return <WorkOrderDetailPage orderId={id} />;
}
