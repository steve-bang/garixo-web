'use client';

import Image from 'next/image';
import { LifeBuoy } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import { useSupportTickets } from '@/features/support/hooks';
import type { SupportTicket } from '@/features/support/types';
import { formatDate } from '@/lib/utils/format';

function formatTicketDate(value: string): string {
  return formatDate(value, {
    locale: 'en-US',
    options: {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    }
  });
}

type SupportTicketRecentRequestsProps = {
  onCreateTicket?: () => void;
};

export function SupportTicketRecentRequests({
  onCreateTicket
}: SupportTicketRecentRequestsProps): JSX.Element {
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(
    null
  );
  const ticketsQuery = useSupportTickets(8);

  return (
    <>
      <Card className="p-s6">
        <div className="space-y-s1">
          <h3 className="text-h3">Recent Requests</h3>
          <p className="text-small text-text-muted">
            Your latest support requests from this garage.
          </p>
        </div>

        {ticketsQuery.isLoading ? (
          <div className="mt-s3 h-20 animate-pulse rounded-md bg-surface-hover" />
        ) : ticketsQuery.isError ? (
          <p className="mt-s3 text-small text-state-error">
            Could not load recent requests.
          </p>
        ) : (ticketsQuery.data ?? []).length === 0 ? (
          <div className="mt-s4 rounded-lg border border-dashed border-border bg-surface-default p-s6 text-center">
            <div className="mx-auto mb-s3 grid size-11 place-items-center rounded-full bg-surface-hover text-text-secondary">
              <LifeBuoy className="size-5" />
            </div>
            <h4 className="text-small font-semibold text-text-primary">
              No support requests yet
            </h4>
            <p className="mx-auto mt-s2 max-w-[440px] text-small text-text-muted">
              When you need help, you can send a request here and track it in
              one place.
            </p>
            <div className="mt-s4 flex justify-center">
              <Button type="button" onClick={() => onCreateTicket?.()}>
                Create New Ticket
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-s3 space-y-s2">
            {(ticketsQuery.data ?? []).map((ticket) => (
              <button
                key={ticket.id}
                type="button"
                onClick={() => setSelectedTicket(ticket)}
                className="group w-full rounded-lg border border-border bg-surface-default p-s3 text-left shadow-xs transition-all duration-200 hover:border-primary-200 hover:bg-surface-hover hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-s3">
                  <div className="min-w-0 flex-1 space-y-s2">
                    <p className="line-clamp-2 text-small font-semibold text-text-primary">
                      {ticket.shortDescription}
                    </p>
                    <div className="flex flex-wrap items-center gap-s2">
                      <span className="rounded-md bg-surface-hover px-s2 py-1 text-caption font-medium capitalize text-text-secondary">
                        {ticket.type}
                      </span>
                      <span
                        className="text-caption text-text-muted"
                        aria-hidden="true"
                      >
                        •
                      </span>
                      <span className="text-caption text-text-muted">
                        {formatTicketDate(ticket.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-s2">
                    <Badge
                      variant={ticket.status === 'open' ? 'warning' : 'success'}
                    >
                      {ticket.status === 'open' ? 'Open' : 'Closed'}
                    </Badge>
                    <span className="text-text-muted transition-colors group-hover:text-text-primary">
                      ›
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </Card>

      <Modal
        open={Boolean(selectedTicket)}
        onClose={() => setSelectedTicket(null)}
        title="Support Request Details"
        width="lg"
      >
        {selectedTicket ? (
          <div className="space-y-s4">
            <div className="rounded-lg border border-border bg-surface-default p-s4">
              <p className="text-caption uppercase tracking-wide text-text-muted">
                Request summary
              </p>
              <div className="mt-s2 flex flex-wrap items-start justify-between gap-s2">
                <p className="text-small font-semibold text-text-primary">
                  {selectedTicket.shortDescription}
                </p>
                <Badge
                  variant={
                    selectedTicket.status === 'open' ? 'warning' : 'success'
                  }
                >
                  {selectedTicket.status === 'open' ? 'Open' : 'Closed'}
                </Badge>
              </div>
            </div>

            <div className="grid gap-s2 sm:grid-cols-3">
              <div className="rounded-md border border-border bg-surface-default p-s3">
                <p className="text-caption text-text-muted">Request type</p>
                <p className="mt-1 text-small font-medium capitalize text-text-primary">
                  {selectedTicket.type}
                </p>
              </div>
              <div className="rounded-md border border-border bg-surface-default p-s3">
                <p className="text-caption text-text-muted">Status</p>
                <p className="mt-1 text-small font-medium text-text-primary">
                  {selectedTicket.status === 'open' ? 'Open' : 'Closed'}
                </p>
              </div>
              <div className="rounded-md border border-border bg-surface-default p-s3">
                <p className="text-caption text-text-muted">Submitted</p>
                <p className="mt-1 text-small font-medium text-text-primary">
                  {formatTicketDate(selectedTicket.createdAt)}
                </p>
              </div>
            </div>

            <div className="rounded-md border border-border bg-surface-default p-s4">
              <p className="text-caption text-text-muted">Details</p>
              <p className="mt-s2 whitespace-pre-wrap text-small leading-6 text-text-secondary">
                {selectedTicket.message}
              </p>
            </div>

            {selectedTicket.screenshot ? (
              <div className="space-y-s2 rounded-md border border-border bg-surface-default p-s4">
                <div className="flex items-center justify-between gap-s2">
                  <p className="text-caption text-text-muted">Screenshot</p>
                  <a
                    href={selectedTicket.screenshot.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary text-caption font-medium hover:underline"
                  >
                    Open full image
                  </a>
                </div>
                <div className="overflow-hidden rounded-md border border-border bg-surface-hover">
                  <Image
                    src={selectedTicket.screenshot.url}
                    alt={selectedTicket.screenshot.name || 'Support screenshot'}
                    width={1200}
                    height={800}
                    className="max-h-[340px] w-full object-contain"
                  />
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </Modal>
    </>
  );
}
