'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useInvoices } from '@/features/invoices/hooks';
import { formatCurrencyUsd, formatDate } from '@/lib/utils/format';

export function InvoicesManagementPage(): JSX.Element {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  const invoicesQuery = useInvoices({
    search,
    page: 1,
    pageSize: 50
  });

  const items = invoicesQuery.data?.items ?? [];

  const emptyMessage = useMemo(() => {
    if (search.trim()) {
      return 'No invoices match this search yet. Try a different customer, work order, or phone number.';
    }

    return 'Your invoice list is empty right now.';
  }, [search]);

  return (
    <div className="space-y-s4">
      <header className="space-y-s1">
        <h1 className="text-h1">Invoices</h1>
        <p className="text-small text-text-muted">
          Keep invoice records organized and easy to find.
        </p>
      </header>

      <Card className="space-y-s3 p-s4">
        <form
          className="flex flex-wrap gap-s2"
          onSubmit={(event) => {
            event.preventDefault();
            setSearch(searchInput.trim());
          }}
        >
          <Input
            className="min-w-[240px] flex-1"
            placeholder="Search invoice, work order, customer, or phone"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
          <Button type="submit">Search</Button>
          {search ? (
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setSearch('');
                setSearchInput('');
              }}
            >
              Clear
            </Button>
          ) : null}
        </form>
      </Card>

      <Card className="overflow-hidden p-0">
        {invoicesQuery.isLoading ? (
          <div className="space-y-s2 p-s4">
            <div className="h-12 animate-pulse rounded-md bg-surface-hover" />
            <div className="h-12 animate-pulse rounded-md bg-surface-hover" />
            <div className="h-12 animate-pulse rounded-md bg-surface-hover" />
          </div>
        ) : invoicesQuery.isError ? (
          <div className="p-s4 text-small text-state-error">
            Could not load invoices.
          </div>
        ) : items.length === 0 ? (
          <div className="grid gap-s3 p-s6 text-center">
            <p className="text-small font-semibold text-text-primary">
              {emptyMessage}
            </p>
            {search ? (
              <p className="text-small text-text-muted">
                You can clear search and check all invoices, or open a completed
                work order to create a new invoice.
              </p>
            ) : (
              <>
                <p className="text-small text-text-muted">
                  This is normal for a new shop. Invoices appear after a work
                  order is completed and you click Create Invoice.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-s2">
                  <Link href="/dashboard/work-orders">
                    <Button variant="secondary">Go to Jobs</Button>
                  </Link>
                  <Link href="/dashboard/work-orders?status=Completed">
                    <Button>View Completed Jobs</Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-small">
              <thead className="border-b border-border bg-table-header text-text-secondary">
                <tr>
                  <th className="px-s3 py-s2 font-medium">Invoice</th>
                  <th className="px-s3 py-s2 font-medium">Customer</th>
                  <th className="px-s3 py-s2 font-medium">Job</th>
                  <th className="px-s3 py-s2 font-medium">Total</th>
                  <th className="px-s3 py-s2 font-medium">Due Date</th>
                  <th className="px-s3 py-s2 text-right font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((invoice) => (
                  <tr key={invoice.id} className="border-t border-border">
                    <td className="px-s3 py-s3 font-medium text-text-primary">
                      {invoice.invoiceNumber}
                    </td>
                    <td className="px-s3 py-s3 text-text-secondary">
                      {invoice.customerName}
                    </td>
                    <td className="px-s3 py-s3 text-text-secondary">
                      {invoice.orderCode}
                    </td>
                    <td className="px-s3 py-s3 text-text-secondary">
                      {formatCurrencyUsd(invoice.total)}
                    </td>
                    <td className="px-s3 py-s3 text-text-secondary">
                      {formatDate(invoice.dueDate)}
                    </td>
                    <td className="px-s3 py-s3 text-right">
                      <Link href={`/dashboard/invoices/${invoice.id}`}>
                        <Button size="sm" variant="secondary">
                          Open
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
