import { Car, Eye, Pencil, Trash2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { Vehicle, VehicleStatus } from '@/features/vehicles/types';
import { formatVehicleLabel } from '@/features/vehicles/utils';
import { cn } from '@/lib/utils/cn';
import { formatDate } from '@/lib/utils/format';
import type { Role } from '@/types/primitives';

type VehiclesTableProps = {
  vehicles: Vehicle[];
  loading?: boolean;
  hasQuery: boolean;
  currentUserRole: Role;
  highlightedId?: string | null;
  onAddFirst: () => void;
  onView: (vehicle: Vehicle) => void;
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (vehicle: Vehicle) => void;
};

function formatVehicleDate(value?: string | null): string {
  return formatDate(value, { locale: 'en-GB' });
}

function statusStyle(status: VehicleStatus): {
  text: string;
  className: string;
} {
  if (status === 'IN_SERVICE')
    return { text: 'In Service', className: 'bg-info-100 text-info-800' };
  if (status === 'COMPLETED')
    return {
      text: 'Completed',
      className: 'bg-badge-success text-badge-success-text'
    };
  if (status === 'OVERDUE')
    return { text: 'Overdue', className: 'bg-error-100 text-error-800' };
  if (status === 'ACTIVE')
    return {
      text: 'Active',
      className: 'bg-surface-hover text-text-secondary'
    };
  return {
    text: 'Inactive',
    className: 'bg-surface-hover text-text-secondary'
  };
}

export function VehiclesTable({
  vehicles,
  loading = false,
  hasQuery,
  currentUserRole,
  highlightedId,
  onAddFirst,
  onView,
  onEdit,
  onDelete
}: VehiclesTableProps): JSX.Element {
  if (loading) {
    return (
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] text-left text-small">
            <thead className="bg-table-header text-table-header-text">
              <tr>
                <th className="px-s4 py-s3 font-semibold">Plate Number</th>
                <th className="px-s4 py-s3 font-semibold">Customer</th>
                <th className="px-s4 py-s3 font-semibold">Brand/Model</th>
                <th className="px-s4 py-s3 font-semibold">Last Service</th>
                <th className="px-s4 py-s3 font-semibold">Status</th>
                <th className="px-s4 py-s3 font-semibold">Total Visits</th>
                <th className="px-s4 py-s3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 8 }).map((_, index) => (
                <tr
                  key={`vehicle-skeleton-${index}`}
                  className="border-t border-border bg-surface-default"
                >
                  <td className="px-s4 py-s3">
                    <div className="h-4 w-24 animate-pulse rounded bg-surface-hover" />
                  </td>
                  <td className="px-s4 py-s3">
                    <div className="space-y-s2">
                      <div className="h-4 w-28 animate-pulse rounded bg-surface-hover" />
                      <div className="h-3 w-20 animate-pulse rounded bg-surface-hover" />
                    </div>
                  </td>
                  <td className="px-s4 py-s3">
                    <div className="h-4 w-24 animate-pulse rounded bg-surface-hover" />
                  </td>
                  <td className="px-s4 py-s3">
                    <div className="h-4 w-20 animate-pulse rounded bg-surface-hover" />
                  </td>
                  <td className="px-s4 py-s3">
                    <div className="h-6 w-20 animate-pulse rounded bg-surface-hover" />
                  </td>
                  <td className="px-s4 py-s3">
                    <div className="h-4 w-12 animate-pulse rounded bg-surface-hover" />
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

  if (vehicles.length === 0) {
    return (
      <Card className="grid min-h-[260px] place-items-center p-s6 text-center">
        <div className="space-y-s2">
          <div className="mx-auto grid size-10 place-items-center rounded-full bg-surface-hover text-text-secondary">
            <Car className="size-5" />
          </div>
          <h3 className="text-h3">
            {hasQuery ? 'No vehicles found.' : 'No vehicles added yet.'}
          </h3>
          <p className="text-small text-text-muted">
            {hasQuery
              ? 'Try changing search or filters, or add a new vehicle.'
              : 'Add your first vehicle to start tracking service records.'}
          </p>
          <div className="pt-s2">
            <Button onClick={onAddFirst}>
              {hasQuery ? 'Add new vehicle' : 'Add your first vehicle'}
            </Button>
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
              <th className="px-s4 py-s3 font-semibold">Plate Number</th>
              <th className="px-s4 py-s3 font-semibold">Customer</th>
              <th className="px-s4 py-s3 font-semibold">Brand/Model</th>
              <th className="px-s4 py-s3 font-semibold">Last Service</th>
              <th className="px-s4 py-s3 font-semibold">Status</th>
              <th className="px-s4 py-s3 font-semibold">Total Visits</th>
              <th className="px-s4 py-s3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((vehicle) => {
              const badge = statusStyle(vehicle.status);

              return (
                <tr
                  key={vehicle.id}
                  className={cn(
                    'border-t border-border bg-surface-default text-text-primary hover:bg-surface-hover',
                    highlightedId === vehicle.id ? 'bg-primary-50/70' : ''
                  )}
                >
                  <td className="px-s4 py-s3">
                    <div className="flex items-center gap-s2">
                      {vehicle.images?.[0]?.url ? (
                        <img
                          src={vehicle.images[0].url}
                          alt={`${vehicle.plateNumber} photo`}
                          className="size-10 shrink-0 rounded-md border border-border object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <span className="grid size-8 shrink-0 place-items-center rounded-md border border-border bg-surface-hover text-text-muted">
                          <Car className="size-4" />
                        </span>
                      )}

                      <button
                        type="button"
                        className="text-left text-[15px] font-semibold"
                        onClick={() => onView(vehicle)}
                      >
                        {vehicle.plateNumber}
                      </button>
                    </div>
                  </td>
                  <td className="px-s4 py-s3">
                    <p className="font-medium">{vehicle.customerName}</p>
                    <p className="text-caption text-text-muted">
                      {vehicle.customerPhone}
                    </p>
                  </td>
                  <td className="px-s4 py-s3 text-text-secondary">
                    {formatVehicleLabel(vehicle)}
                  </td>
                  <td className="px-s4 py-s3 text-text-secondary">
                    {formatVehicleDate(vehicle.lastServiceDate)}
                  </td>
                  <td className="px-s4 py-s3">
                    <Badge variant="default" className={badge.className}>
                      {badge.text}
                    </Badge>
                  </td>
                  <td className="px-s4 py-s3">{vehicle.totalVisits} visits</td>
                  <td className="px-s4 py-s3">
                    <div className="flex flex-wrap items-center gap-s2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onView(vehicle)}
                      >
                        <Eye className="size-4" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onEdit(vehicle)}
                      >
                        <Pencil className="size-4" />
                        Edit
                      </Button>
                      {currentUserRole === 'OWNER' ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-state-error"
                          onClick={() => onDelete(vehicle)}
                        >
                          <Trash2 className="size-4" />
                          Delete
                        </Button>
                      ) : null}
                    </div>
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
