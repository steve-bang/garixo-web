'use client';

import { HelpCircle } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { SupportTicketForm } from '@/features/settings/components/support-ticket-form';
import { SupportTicketRecentRequests } from '@/features/settings/components/support-ticket-recent-requests';

export function SupportTicketSection(): JSX.Element {
  const [view, setView] = useState<'recent' | 'create'>('recent');

  return (
    <div className="mx-auto max-w-[820px] space-y-s4">
      <header className="space-y-s2 border-b border-border pb-s4">
        <div className="flex flex-wrap items-center justify-between gap-s3">
          <div className="flex items-center gap-s2">
            <HelpCircle className="size-5 text-text-secondary" />
            <h2 className="text-h2">Support</h2>
          </div>
          {view === 'recent' ? (
            <Button type="button" onClick={() => setView('create')}>
              Create New Ticket
            </Button>
          ) : (
            <Button
              type="button"
              variant="secondary"
              onClick={() => setView('recent')}
            >
              Back to Recent
            </Button>
          )}
        </div>
        <p className="text-small text-text-muted">
          Tell us what happened. Our support team will get back to you as soon
          as possible.
        </p>
      </header>

      {view === 'create' ? (
        <SupportTicketForm onSubmitted={() => setView('recent')} />
      ) : (
        <SupportTicketRecentRequests onCreateTicket={() => setView('create')} />
      )}
    </div>
  );
}
