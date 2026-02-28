import type { Metadata } from 'next';

import { InvoiceDetailPage } from '@/features/invoices/components/invoice-detail-page';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  return {
    title: `Invoice ${id} | Garixo`,
    description: 'Review and send invoice details for this work order.'
  };
}

export default async function InvoiceDetailRoute({
  params
}: Props): Promise<JSX.Element> {
  const { id } = await params;

  return <InvoiceDetailPage invoiceId={id} />;
}
