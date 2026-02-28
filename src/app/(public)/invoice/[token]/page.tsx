import type { Metadata } from 'next';

import { PublicInvoicePage } from '@/features/invoices/components/public-invoice-page';

type Props = {
  params: Promise<{ token: string }>;
};

export const metadata: Metadata = {
  title: 'Invoice Details | Garixo',
  description:
    'Secure invoice page with service details, due date, and total amount.',
  robots: {
    index: false,
    follow: false
  }
};

export default async function PublicInvoiceRoute({
  params
}: Props): Promise<JSX.Element> {
  const { token } = await params;

  return <PublicInvoicePage token={token} />;
}
