'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useAdminSupportTickets } from '@/features/support/hooks';
import type {
  AdminSupportTicketsQuery,
  SupportTicket,
  SupportTicketDateFilter
} from '@/features/support/types';
import { formatDate } from '@/lib/utils/format';

type QueryValue = string | null | undefined;

function parsePositiveInt(value: string | null, fallback = 1): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
}

function toQueryStringValue(value: QueryValue): string | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }

  const normalized = value.trim();
  return normalized ? normalized : undefined;
}

function parseStatus(
  value: string | null
): SupportTicket['status'] | undefined {
  if (!value) {
    return undefined;
  }

  return value === 'open' || value === 'resolved' ? value : undefined;
}

function parseType(value: string | null): SupportTicket['type'] | undefined {
  if (!value) {
    return undefined;
  }

  return value === 'problem' || value === 'question' || value === 'feature'
    ? value
    : undefined;
}

function parseDateFilter(value: string | null): SupportTicketDateFilter {
  if (value === 'today' || value === '7d' || value === '30d') {
    return value;
  }

  return 'all';
}

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

function statusVariant(status: SupportTicket['status']): 'warning' | 'success' {
  return status === 'open' ? 'warning' : 'success';
}

export function AdminSupportTicketsPage(): JSX.Element {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchInput, setSearchInput] = useState('');

  const status = parseStatus(searchParams.get('status'));
  const type = parseType(searchParams.get('type'));
  const date = parseDateFilter(searchParams.get('date'));
  const page = parsePositiveInt(searchParams.get('page'), 1);
  const pageSize = 20;
  const search = toQueryStringValue(searchParams.get('search')) ?? '';

  const setQueryParams = useCallback(
    (updates: Record<string, QueryValue>) => {
      const nextParams = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        const normalized = toQueryStringValue(value);
        if (!normalized) {
          nextParams.delete(key);
          return;
        }

        nextParams.set(key, normalized);
      });

      const nextQuery = nextParams.toString();
      const currentQuery = searchParams.toString();
      if (nextQuery === currentQuery) {
        return;
      }

      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
        scroll: false
      });
    },
    [pathname, router, searchParams]
  );

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (searchInput.trim() === search) {
        return;
      }

      setQueryParams({
        search: searchInput,
        page: '1'
      });
    }, 300);

    return () => window.clearTimeout(timer);
  }, [search, searchInput, setQueryParams]);

  const queryParams = useMemo<AdminSupportTicketsQuery>(
    () => ({
      status,
      type,
      date,
      page,
      pageSize
    }),
    [status, type, date, page]
  );

  const ticketsQuery = useAdminSupportTickets(queryParams);
  const items = useMemo(
    () => ticketsQuery.data?.items ?? [],
    [ticketsQuery.data?.items]
  );
  const meta = ticketsQuery.data?.meta;

  const visibleItems = useMemo(() => {
    if (!search.trim()) {
      return items;
    }

    const needle = search.trim().toLowerCase();
    return items.filter(
      (item) =>
        item.shortDescription.toLowerCase().includes(needle) ||
        item.message.toLowerCase().includes(needle) ||
        item.createdByEmail.toLowerCase().includes(needle) ||
        item.garageId.toLowerCase().includes(needle)
    );
  }, [items, search]);

  return (
    <div className="space-y-s4 p-s6 xl:p-s8">
      <header>
        <h1 className="text-h1">Support Tickets</h1>
        <p className="text-small text-text-muted">
          Review support requests from all garages in one queue.
        </p>
      </header>

      <Card className="grid gap-s3 p-s4 md:grid-cols-4">
        <div className="space-y-s1">
          <label className="text-small font-medium text-text-secondary">
            Search
          </label>
          <Input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search description, message, email, garage"
          />
        </div>
        <div className="space-y-s1">
          <label className="text-small font-medium text-text-secondary">
            Status
          </label>
          <Select
            value={status ?? ''}
            onChange={(event) =>
              setQueryParams({
                status: event.target.value || undefined,
                page: '1'
              })
            }
          >
            <option value="">All</option>
            <option value="open">Open</option>
            <option value="resolved">Resolved</option>
          </Select>
        </div>
        <div className="space-y-s1">
          <label className="text-small font-medium text-text-secondary">
            Type
          </label>
          <Select
            value={type ?? ''}
            onChange={(event) =>
              setQueryParams({
                type: event.target.value || undefined,
                page: '1'
              })
            }
          >
            <option value="">All</option>
            <option value="problem">Problem</option>
            <option value="question">Question</option>
            <option value="feature">Feature</option>
          </Select>
        </div>
        <div className="space-y-s1">
          <label className="text-small font-medium text-text-secondary">
            Date
          </label>
          <Select
            value={date}
            onChange={(event) =>
              setQueryParams({ date: event.target.value || 'all', page: '1' })
            }
          >
            <option value="all">All time</option>
            <option value="today">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
          </Select>
        </div>
      </Card>

      {ticketsQuery.isLoading ? (
        <Card className="p-s6 text-small text-text-muted">
          Loading support tickets...
        </Card>
      ) : ticketsQuery.isError ? (
        <Card className="p-s6 text-small text-state-error">
          We could not load support tickets right now.
        </Card>
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1240px] text-left text-small">
              <thead className="bg-table-header text-table-header-text">
                <tr>
                  <th className="px-s4 py-s3 font-semibold">Description</th>
                  <th className="px-s4 py-s3 font-semibold">Type</th>
                  <th className="px-s4 py-s3 font-semibold">Status</th>
                  <th className="px-s4 py-s3 font-semibold">User</th>
                  <th className="px-s4 py-s3 font-semibold">Garage</th>
                  <th className="px-s4 py-s3 font-semibold">Date</th>
                  <th className="px-s4 py-s3 text-right font-semibold">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {visibleItems.length > 0 ? (
                  visibleItems.map((ticket) => (
                    <tr
                      key={ticket.id}
                      className="border-t border-border bg-surface-default"
                    >
                      <td className="px-s4 py-s3">
                        <p className="font-medium text-text-primary">
                          {ticket.shortDescription}
                        </p>
                        <p className="line-clamp-2 text-caption text-text-muted">
                          {ticket.message}
                        </p>
                      </td>
                      <td className="px-s4 py-s3">{ticket.type}</td>
                      <td className="px-s4 py-s3">
                        <Badge variant={statusVariant(ticket.status)}>
                          {ticket.status}
                        </Badge>
                      </td>
                      <td className="px-s4 py-s3">
                        <p>{ticket.createdByName || '-'}</p>
                        <p className="text-caption text-text-muted">
                          {ticket.createdByEmail || '-'}
                        </p>
                      </td>
                      <td className="px-s4 py-s3 text-text-secondary">
                        {ticket.garageId}
                      </td>
                      <td className="px-s4 py-s3 text-text-secondary">
                        {formatTicketDate(ticket.createdAt)}
                      </td>
                      <td className="px-s4 py-s3 text-right">
                        <Button asChild size="sm" variant="secondary">
                          <Link
                            href={`/dashboard/administrator/support-tickets/${ticket.garageId}/${ticket.id}`}
                          >
                            View details
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-s4 py-s10 text-center text-small text-text-muted"
                    >
                      No tickets matched your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {meta ? (
            <div className="border-t border-border px-s4 py-s3 text-caption text-text-muted">
              Page {meta.page} of {meta.totalPages} ({meta.total} tickets)
            </div>
          ) : null}
        </Card>
      )}
    </div>
  );
}
