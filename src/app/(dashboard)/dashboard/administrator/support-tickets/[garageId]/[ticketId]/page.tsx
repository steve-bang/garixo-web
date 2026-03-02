import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { JSX } from 'react';

import { AdminSupportTicketDetailPage } from '@/features/support/components/admin-support-ticket-detail-page';
import { auth } from '@/lib/auth';

type Props = {
  params: Promise<{
    garageId: string;
    ticketId: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticketId } = await params;

  return {
    title: `Support Ticket ${ticketId} | Garixo`,
    description: 'Review the full support ticket details and request context.'
  };
}

export default async function AdministratorSupportTicketDetailRoute({
  params
}: Props): Promise<JSX.Element> {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/auth/login');
  }

  if (session.user.role !== 'admin') {
    notFound();
  }

  const { garageId, ticketId } = await params;
  return (
    <AdminSupportTicketDetailPage garageId={garageId} ticketId={ticketId} />
  );
}
