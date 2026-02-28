import type { Metadata } from 'next';

import { InvoicesManagementPage } from '@/features/invoices/components/invoices-management-page';

export const metadata: Metadata = {
  title: 'Invoices | Garixo',
  description: 'Manage customer invoices and send them quickly.'
};

export default function InvoicesRoute(): JSX.Element {
  return <InvoicesManagementPage />;
}
