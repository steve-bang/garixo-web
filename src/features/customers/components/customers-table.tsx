import { Car, Copy, Eye, Pencil, Trash2, User } from 'lucide-react';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { Customer, CustomerStatus } from '@/features/customers/types';
import { cn } from '@/lib/utils/cn';
import { formatCurrencyUsd, formatDate } from '@/lib/utils/format';

type UserRole = 'OWNER' | 'MANAGER' | 'STAFF';

type CustomersTableProps = {
  customers: Customer[];
  loading?: boolean;
  currentUserRole: UserRole;
  highlightedId?: string | null;
  onAddFirst: () => void;
  onView: (customer: Customer) => void;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
  onCopyPhone: (phone: string) => void;
};

function formatCustomerDate(value?: string | null): string {
  return formatDate(value, {
    locale: 'en-US',
    options: {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    }
  });
}

function statusTone(status: CustomerStatus): {
  text: string;
  className: string;
} {
  if (status === 'ACTIVE') {
    return {
      text: 'Active',
      className: 'bg-badge-success text-badge-success-text'
    };
  }

  if (status === 'VIP') {
    return { text: 'VIP', className: 'bg-warning-100 text-warning-800' };
  }

  return {
    text: 'Inactive',
    className: 'bg-surface-hover text-text-secondary'
  };
}

export function CustomersTable({
  customers,
  loading = false,
  currentUserRole,
  highlightedId,
  onAddFirst,
  onView,
  onEdit,
  onDelete,
  onCopyPhone
}: CustomersTableProps): JSX.Element {
  if (loading) {
    return (
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] text-left text-small">
            <thead className="bg-table-header text-table-header-text">
              <tr>
                <th className="px-s4 py-s3 font-semibold">Customer Name</th>
                <th className="px-s4 py-s3 font-semibold">Phone</th>
                <th className="px-s4 py-s3 font-semibold">Vehicles</th>
                <th className="px-s4 py-s3 text-right font-semibold">
                  Total Visits
                </th>
                <th className="px-s4 py-s3 text-right font-semibold">
                  Total Spent
                </th>
                <th className="px-s4 py-s3 font-semibold">Last Visit</th>
                <th className="px-s4 py-s3 font-semibold">Status</th>
                <th className="px-s4 py-s3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 8 }).map((_, index) => (
                <tr
                  key={`customer-skeleton-${index}`}
                  className="border-t border-border bg-surface-default"
                >
                  <td className="px-s4 py-s3">
                    <div className="h-4 w-36 animate-pulse rounded bg-surface-hover" />
                  </td>
                  <td className="px-s4 py-s3">
                    <div className="h-4 w-24 animate-pulse rounded bg-surface-hover" />
                  </td>
                  <td className="px-s4 py-s3">
                    <div className="h-4 w-20 animate-pulse rounded bg-surface-hover" />
                  </td>
                  <td className="px-s4 py-s3 text-right">
                    <div className="ml-auto h-4 w-8 animate-pulse rounded bg-surface-hover" />
                  </td>
                  <td className="px-s4 py-s3 text-right">
                    <div className="ml-auto h-4 w-20 animate-pulse rounded bg-surface-hover" />
                  </td>
                  <td className="px-s4 py-s3">
                    <div className="h-4 w-20 animate-pulse rounded bg-surface-hover" />
                  </td>
                  <td className="px-s4 py-s3">
                    <div className="h-6 w-16 animate-pulse rounded bg-surface-hover" />
                  </td>
                  <td className="px-s4 py-s3">
                    <div className="h-4 w-32 animate-pulse rounded bg-surface-hover" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    );
  }

  if (customers.length === 0) {
    return (
      <Card className="grid min-h-[260px] place-items-center p-s6 text-center">
        <div className="space-y-s2">
          <div className="mx-auto grid size-10 place-items-center rounded-full bg-surface-hover text-text-secondary">
            <User className="size-5" />
          </div>
          <h3 className="text-h3">No customers yet.</h3>
          <p className="text-small text-text-muted">
            Add your first customer to start tracking visits.
          </p>
          <div className="pt-s2">
            <Button onClick={onAddFirst}>Add your first customer</Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1080px] text-left text-small">
          <thead className="bg-table-header text-table-header-text">
            <tr>
              <th className="px-s4 py-s3 font-semibold">Customer Name</th>
              <th className="px-s4 py-s3 font-semibold">Phone</th>
              <th className="px-s4 py-s3 font-semibold">Vehicles</th>
              <th className="px-s4 py-s3 text-right font-semibold">
                Total Visits
              </th>
              <th className="px-s4 py-s3 text-right font-semibold">
                Total Spent
              </th>
              <th className="px-s4 py-s3 font-semibold">Last Visit</th>
              <th className="px-s4 py-s3 font-semibold">Status</th>
              <th className="px-s4 py-s3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => {
              const badge = statusTone(customer.status);
              const vehicleLabel = `${customer.vehicles.length} vehicle${customer.vehicles.length === 1 ? '' : 's'}`;
              const vehicleTooltip =
                customer.vehicles.length > 0
                  ? customer.vehicles.map((v) => v.plate).join(', ')
                  : 'No vehicles';

              return (
                <tr
                  key={customer.id}
                  className={cn(
                    'cursor-pointer border-t border-border bg-surface-default text-text-primary hover:bg-surface-hover',
                    highlightedId === customer.id ? 'bg-primary-50/70' : ''
                  )}
                  onClick={() => onView(customer)}
                >
                  <td className="px-s4 py-s3">
                    <button
                      type="button"
                      className="text-left text-[15px] font-semibold"
                      onClick={() => onView(customer)}
                    >
                      {customer.name}
                    </button>
                  </td>
                  <td className="px-s4 py-s3">
                    <div className="flex items-center gap-s2">
                      <span>{customer.phone}</span>
                      <button
                        type="button"
                        className="rounded p-1 text-text-muted hover:bg-surface-hover hover:text-text-primary"
                        onClick={(event) => {
                          event.stopPropagation();
                          onCopyPhone(customer.phone);
                        }}
                      >
                        <Copy className="size-3.5" />
                      </button>
                    </div>
                  </td>
                  <td className="px-s4 py-s3" title={vehicleTooltip}>
                    {vehicleLabel}
                  </td>
                  <td className="px-s4 py-s3 text-right tabular-nums">
                    {customer.totalVisits}
                  </td>
                  <td className="px-s4 py-s3 text-right font-semibold tabular-nums">
                    {formatCurrencyUsd(customer.totalSpent)}
                  </td>
                  <td className="px-s4 py-s3 text-text-secondary">
                    {formatCustomerDate(customer.lastVisit)}
                  </td>
                  <td className="px-s4 py-s3">
                    <Badge variant="default" className={badge.className}>
                      {badge.text}
                    </Badge>
                  </td>
                  <td
                    className="px-s4 py-s3"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <div className="flex flex-wrap items-center gap-s2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onView(customer)}
                      >
                        <Eye className="size-4" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onEdit(customer)}
                      >
                        <Pencil className="size-4" />
                        Edit
                      </Button>
                      <Button asChild size="sm" variant="ghost">
                        <Link
                          href={`/dashboard/customers/${customer.id}/vehicles`}
                        >
                          <Car className="size-4" />
                          Vehicles
                        </Link>
                      </Button>
                      {currentUserRole === 'OWNER' ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-state-error"
                          disabled={customer.totalVisits > 0}
                          onClick={() => onDelete(customer)}
                        >
                          <Trash2 className="size-4" />
                          Delete
                        </Button>
                      ) : null}
                    </div>
                    {customer.totalVisits > 0 ? (
                      <p className="mt-s1 text-caption text-text-muted">
                        Has service history
                      </p>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
