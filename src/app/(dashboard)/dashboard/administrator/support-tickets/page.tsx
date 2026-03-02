import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { JSX } from 'react';

import { AdminSupportTicketsPage } from '@/features/support/components/admin-support-tickets-page';
import { auth } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Support Tickets | Garixo',
  description: 'Review support requests across all garages.'
};

export default async function AdministratorSupportTicketsPage(): Promise<JSX.Element> {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/auth/login');
  }

  if (session.user.role !== 'admin') {
    notFound();
  }

  return <AdminSupportTicketsPage />;
}
