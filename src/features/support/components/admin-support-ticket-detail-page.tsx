'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import {
  useAdminSupportTicket,
  useUpdateAdminSupportTicketStatus
} from '@/features/support/hooks';
import { formatDate } from '@/lib/utils/format';

type AdminSupportTicketDetailPageProps = {
  garageId: string;
  ticketId: string;
};

function formatTicketDate(value?: string | null): string {
  return formatDate(value, {
    locale: 'en-US',
    options: {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    }
  });
}

function statusVariant(status: 'open' | 'resolved'): 'warning' | 'success' {
  return status === 'open' ? 'warning' : 'success';
}

export function AdminSupportTicketDetailPage({
  garageId,
  ticketId
}: AdminSupportTicketDetailPageProps): JSX.Element {
  const ticketQuery = useAdminSupportTicket(garageId, ticketId);
  const updateStatusMutation = useUpdateAdminSupportTicketStatus();
  const ticket = ticketQuery.data;
  const [selectedStatus, setSelectedStatus] = useState<
    'open' | 'resolved' | null
  >(null);
  const nextStatus = selectedStatus ?? ticket?.status ?? 'open';

  return (
    <div className="space-y-s4 p-s6 xl:p-s8">
      <header className="space-y-s2">
        <div className="flex flex-wrap items-center justify-between gap-s2">
          <h1 className="text-h1">Support Ticket Details</h1>
          <Button asChild variant="secondary" size="sm">
            <Link href="/dashboard/administrator/support-tickets">
              Back to Tickets
            </Link>
          </Button>
        </div>
        <p className="text-small text-text-muted">
          View full context for this support request.
        </p>
      </header>

      {ticketQuery.isLoading ? (
        <Card className="p-s6 text-small text-text-muted">
          Loading ticket details...
        </Card>
      ) : ticketQuery.isError || !ticket ? (
        <Card className="p-s6 text-small text-state-error">
          We could not load this support ticket.
        </Card>
      ) : (
        <div className="space-y-s4">
          <Card className="space-y-s3 p-s4">
            <div className="space-y-s1">
              <p className="text-caption uppercase tracking-wide text-text-muted">
                Admin controls
              </p>
              <p className="text-small text-text-secondary">
                Update ticket status to keep the queue accurate for your team.
              </p>
            </div>
            <div className="flex flex-col gap-s2 sm:flex-row sm:items-end">
              <div className="w-full space-y-s1 sm:max-w-[220px]">
                <label
                  htmlFor="ticket-status"
                  className="text-small font-medium text-text-secondary"
                >
                  Status
                </label>
                <Select
                  id="ticket-status"
                  value={nextStatus}
                  onChange={(event) =>
                    setSelectedStatus(event.target.value as 'open' | 'resolved')
                  }
                  disabled={updateStatusMutation.isPending}
                >
                  <option value="open">Open</option>
                  <option value="resolved">Resolved</option>
                </Select>
              </div>
              <Button
                type="button"
                onClick={() =>
                  updateStatusMutation.mutate({
                    garageId,
                    ticketId,
                    status: nextStatus
                  })
                }
                disabled={
                  updateStatusMutation.isPending || nextStatus === ticket.status
                }
              >
                {updateStatusMutation.isPending ? 'Saving...' : 'Update status'}
              </Button>
            </div>
            {updateStatusMutation.isError ? (
              <p className="text-small text-state-error">
                Could not update the ticket status. Please try again.
              </p>
            ) : null}
            {updateStatusMutation.isSuccess ? (
              <p className="text-small text-state-success">
                Ticket status updated successfully.
              </p>
            ) : null}
          </Card>

          <Card className="space-y-s3 p-s4">
            <div className="flex flex-wrap items-start justify-between gap-s2">
              <div className="space-y-s1">
                <p className="text-caption uppercase tracking-wide text-text-muted">
                  Summary
                </p>
                <p className="text-h3 text-text-primary">
                  {ticket.shortDescription}
                </p>
              </div>
              <Badge variant={statusVariant(ticket.status)}>
                {ticket.status === 'open' ? 'Open' : 'Resolved'}
              </Badge>
            </div>

            <div className="grid gap-s2 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-md border border-border bg-surface-default p-s3">
                <p className="text-caption text-text-muted">Type</p>
                <p className="mt-1 text-small font-medium capitalize text-text-primary">
                  {ticket.type}
                </p>
              </div>
              <div className="rounded-md border border-border bg-surface-default p-s3">
                <p className="text-caption text-text-muted">Created</p>
                <p className="mt-1 text-small font-medium text-text-primary">
                  {formatTicketDate(ticket.createdAt)}
                </p>
              </div>
              <div className="rounded-md border border-border bg-surface-default p-s3">
                <p className="text-caption text-text-muted">Requester</p>
                <p className="mt-1 text-small font-medium text-text-primary">
                  {ticket.createdByName || '-'}
                </p>
              </div>
              <div className="rounded-md border border-border bg-surface-default p-s3">
                <p className="text-caption text-text-muted">Garage ID</p>
                <p className="mt-1 truncate text-small font-medium text-text-primary">
                  {ticket.garageId}
                </p>
              </div>
            </div>
          </Card>

          <Card className="space-y-s2 p-s4">
            <p className="text-caption uppercase tracking-wide text-text-muted">
              Message
            </p>
            <p className="whitespace-pre-wrap text-small leading-6 text-text-secondary">
              {ticket.message}
            </p>
          </Card>

          {ticket.screenshot ? (
            <Card className="space-y-s2 p-s4">
              <div className="flex flex-wrap items-center justify-between gap-s2">
                <p className="text-caption uppercase tracking-wide text-text-muted">
                  Screenshot
                </p>
                <a
                  href={ticket.screenshot.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary text-small font-medium hover:underline"
                >
                  Open full image
                </a>
              </div>
              <div className="overflow-hidden rounded-md border border-border bg-surface-hover">
                <Image
                  src={ticket.screenshot.url}
                  alt={ticket.screenshot.name || 'Support screenshot'}
                  width={1400}
                  height={900}
                  className="max-h-[520px] w-full object-contain"
                />
              </div>
            </Card>
          ) : null}
        </div>
      )}
    </div>
  );
}
