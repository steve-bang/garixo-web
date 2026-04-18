'use client';

import Link from 'next/link';
import { useMemo, useRef, useState, type ChangeEvent } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  createVehicleSchema,
  type CreateVehicleInput
} from '@/features/vehicles/schema';
import {
  useDeleteVehicleImage,
  useUpdateVehicle,
  useVehicleDetail,
  useUploadVehicleImage,
  useVehicleWorkOrderHistory
} from '@/features/vehicles/hooks';
import type { VehicleStatus } from '@/features/vehicles/types';
import { averageTicket } from '@/features/vehicles/utils';
import { useToast } from '@/hooks/use-toast';
import { formatCurrencyUsd, formatDate } from '@/lib/utils/format';
import { Trash, Upload } from 'lucide-react';

type Props = {
  vehicleId: string;
};

const statusOptions: VehicleStatus[] = [
  'ACTIVE',
  'IN_SERVICE',
  'COMPLETED',
  'OVERDUE',
  'INACTIVE'
];

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

function toFormValues(input: {
  plateNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  brand?: string;
  model?: string;
  year?: number;
  color?: string;
  vin?: string;
  status: VehicleStatus;
  notes?: string;
}): CreateVehicleInput {
  return {
    plateNumber: input.plateNumber,
    customerId: input.customerId,
    customerName: input.customerName,
    customerPhone: input.customerPhone,
    brand: input.brand ?? '',
    model: input.model ?? '',
    year: input.year,
    color: input.color ?? '',
    vin: input.vin ?? '',
    status: input.status,
    notes: input.notes ?? ''
  };
}

function formatVehicleDate(value?: string | null): string {
  return formatDate(value, {
    locale: 'en-US',
    options: {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    }
  });
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function VehicleDetailPage({ vehicleId }: Props): JSX.Element {
  const toast = useToast();
  const detailQuery = useVehicleDetail(vehicleId);
  const historyQuery = useVehicleWorkOrderHistory(vehicleId);
  const updateMutation = useUpdateVehicle();
  const uploadImageMutation = useUploadVehicleImage();
  const deleteImageMutation = useDeleteVehicleImage();
  const [draft, setDraft] = useState<CreateVehicleInput | null>(null);
  const [editing, setEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const vehicle = detailQuery.data;
  const history = historyQuery.data ?? [];
  const baseForm = useMemo(
    () =>
      vehicle
        ? toFormValues({
            plateNumber: vehicle.plateNumber,
            customerId: vehicle.customerId,
            customerName: vehicle.customerName,
            customerPhone: vehicle.customerPhone,
            brand: vehicle.brand,
            model: vehicle.model,
            year: vehicle.year,
            color: vehicle.color,
            vin: vehicle.vin,
            status: vehicle.status,
            notes: vehicle.notes
          })
        : null,
    [vehicle]
  );
  const form = draft ?? baseForm;
  const badge = useMemo(
    () => (vehicle ? statusStyle(vehicle.status) : null),
    [vehicle]
  );
  const images = useMemo(
    () =>
      [...(vehicle?.images ?? [])].sort(
        (a, b) =>
          new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      ),
    [vehicle?.images]
  );

  if (detailQuery.isLoading) {
    return (
      <div className="space-y-s4 p-s8">
        <div className="h-8 w-64 animate-pulse rounded bg-surface-hover" />
        <div className="h-32 animate-pulse rounded-lg border border-border bg-surface-default" />
        <div className="h-80 animate-pulse rounded-lg border border-border bg-surface-default" />
      </div>
    );
  }

  if (detailQuery.isError || !vehicle || !form || !baseForm) {
    return (
      <div className="space-y-s4 p-s8">
        <Card className="p-s6">
          <p className="text-small text-state-error">
            Could not load vehicle details.
          </p>
          <div className="mt-s3">
            <Button asChild variant="secondary">
              <Link href="/dashboard/vehicles">Back to Vehicles</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const onSave = async () => {
    const parsed = createVehicleSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(
        parsed.error.issues[0]?.message ?? 'Please check your input.'
      );
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: vehicleId,
        payload: parsed.data
      });
      await Promise.all([detailQuery.refetch(), historyQuery.refetch()]);
      setDraft(null);
      setEditing(false);
      toast.success('Vehicle information updated.');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Could not update vehicle.'
      );
    }
  };

  const onReset = () => {
    setDraft(null);
    setEditing(false);
  };

  const onFileSelected = async (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    // Reset input immediately so selecting the same file again still fires change.
    event.target.value = '';

    if (!selected) {
      return;
    }

    try {
      await uploadImageMutation.mutateAsync({ vehicleId, file: selected });
      await detailQuery.refetch();
      toast.success('Vehicle photo uploaded.');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Could not upload photo.'
      );
    }
  };

  const onDeleteImage = async (imageId: string) => {
    try {
      await deleteImageMutation.mutateAsync({ vehicleId, imageId });
      await detailQuery.refetch();
      toast.success('Vehicle photo removed.');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Could not remove photo.'
      );
    }
  };

  return (
    <div className="space-y-s6 p-s8">
      <header className="flex flex-col gap-s3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-s2">
            <h1 className="text-h1">{vehicle.plateNumber}</h1>
            {badge ? (
              <Badge variant="default" className={badge.className}>
                {badge.text}
              </Badge>
            ) : null}
          </div>
          <p className="text-small text-text-muted">
            Vehicle details and full work order history.
          </p>
        </div>
        <div className="flex items-center gap-s2">
          <Button asChild variant="secondary">
            <Link href="/dashboard/vehicles">Back to Vehicles</Link>
          </Button>
          {editing ? (
            <>
              <Button variant="secondary" onClick={onReset}>
                Cancel
              </Button>
              <Button onClick={onSave} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          ) : (
            <Button onClick={() => setEditing(true)}>Edit Vehicle</Button>
          )}
        </div>
      </header>

      <div className="grid gap-s3 md:grid-cols-3">
        <Card className="p-s4">
          <p className="text-caption text-text-muted">Total Visits</p>
          <p className="mt-s1 text-h3">{vehicle.totalVisits}</p>
        </Card>
        <Card className="p-s4">
          <p className="text-caption text-text-muted">Total Spent</p>
          <p className="mt-s1 text-h3">
            {formatCurrencyUsd(vehicle.totalSpent)}
          </p>
        </Card>
        <Card className="p-s4">
          <p className="text-caption text-text-muted">Last Service Date</p>
          <p className="mt-s1 text-h3">
            {formatVehicleDate(vehicle.lastServiceDate)}
          </p>
        </Card>
      </div>

      <Card className="p-s4">
        <h2 className="text-h3">Vehicle Information</h2>
        <div className="mt-s3 grid gap-s3 md:grid-cols-2">
          <div className="space-y-s1">
            <label className="text-small font-medium text-text-secondary">
              Plate Number
            </label>
            <Input
              className="h-11"
              value={form.plateNumber}
              disabled={!editing}
              onChange={(event) =>
                setDraft((current) =>
                  current
                    ? {
                        ...current,
                        plateNumber: event.target.value.toUpperCase()
                      }
                    : {
                        ...baseForm,
                        plateNumber: event.target.value.toUpperCase()
                      }
                )
              }
            />
          </div>
          <div className="space-y-s1">
            <label className="text-small font-medium text-text-secondary">
              Status
            </label>
            <Select
              className="h-11"
              value={form.status}
              disabled={!editing}
              onChange={(event) =>
                setDraft((current) =>
                  current
                    ? {
                        ...current,
                        status: event.target.value as VehicleStatus
                      }
                    : {
                        ...baseForm,
                        status: event.target.value as VehicleStatus
                      }
                )
              }
            >
              {statusOptions.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-s1">
            <label className="text-small font-medium text-text-secondary">
              Brand
            </label>
            <Input
              className="h-11"
              value={form.brand ?? ''}
              disabled={!editing}
              onChange={(event) =>
                setDraft((current) =>
                  current
                    ? { ...current, brand: event.target.value }
                    : { ...baseForm, brand: event.target.value }
                )
              }
            />
          </div>
          <div className="space-y-s1">
            <label className="text-small font-medium text-text-secondary">
              Model
            </label>
            <Input
              className="h-11"
              value={form.model ?? ''}
              disabled={!editing}
              onChange={(event) =>
                setDraft((current) =>
                  current
                    ? { ...current, model: event.target.value }
                    : { ...baseForm, model: event.target.value }
                )
              }
            />
          </div>
          <div className="space-y-s1">
            <label className="text-small font-medium text-text-secondary">
              Year
            </label>
            <Input
              className="h-11"
              inputMode="numeric"
              value={form.year ?? ''}
              disabled={!editing}
              onChange={(event) =>
                setDraft((current) =>
                  current
                    ? {
                        ...current,
                        year: event.target.value
                          ? Number(event.target.value)
                          : undefined
                      }
                    : {
                        ...baseForm,
                        year: event.target.value
                          ? Number(event.target.value)
                          : undefined
                      }
                )
              }
            />
          </div>
          <div className="space-y-s1">
            <label className="text-small font-medium text-text-secondary">
              Color
            </label>
            <Input
              className="h-11"
              value={form.color ?? ''}
              disabled={!editing}
              onChange={(event) =>
                setDraft((current) =>
                  current
                    ? { ...current, color: event.target.value }
                    : { ...baseForm, color: event.target.value }
                )
              }
            />
          </div>
          <div className="space-y-s1 md:col-span-2">
            <label className="text-small font-medium text-text-secondary">
              VIN
            </label>
            <Input
              className="h-11"
              value={form.vin ?? ''}
              disabled={!editing}
              onChange={(event) =>
                setDraft((current) =>
                  current
                    ? { ...current, vin: event.target.value }
                    : { ...baseForm, vin: event.target.value }
                )
              }
            />
          </div>
        </div>
      </Card>

      <Card className="p-s4">
        <h2 className="text-h3">Owner Information</h2>
        <div className="mt-s3 grid gap-s3 md:grid-cols-2">
          <p className="text-small text-text-secondary">
            Customer: {vehicle.customerName}
          </p>
          <p className="text-small text-text-secondary">
            Phone: {vehicle.customerPhone}
          </p>
        </div>
      </Card>

      <Card className="p-s4">
        <div className="flex flex-wrap items-center justify-between gap-s2">
          <div>
            <h2 className="text-h3">Photos</h2>
            <p className="text-small text-text-muted">
              Add clear photos so your team and customers can review vehicle
              condition quickly.
            </p>
          </div>
          <div className="flex items-center gap-s2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={onFileSelected}
            />
            <Button
              size="sm"
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadImageMutation.isPending || images.length >= 10}
            >
              {uploadImageMutation.isPending ? (
                'Uploading...'
              ) : (
                <>
                  {' '}
                  <Upload className="mr-s1 h-4 w-4" /> Upload
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="mt-s3">
          {images.length === 0 ? (
            <p className="text-small text-text-muted">
              No photos yet. Upload up to 10 images (JPG, PNG, WEBP, max 5MB
              each).
            </p>
          ) : (
            <div className="grid gap-s3 sm:grid-cols-2 lg:grid-cols-3">
              {images.map((image) => (
                <div
                  key={image.id}
                  className="overflow-hidden rounded-md border border-border bg-surface-default"
                >
                  <a
                    href={image.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block bg-surface-hover"
                  >
                    <img
                      src={image.url}
                      alt={image.name || 'Vehicle photo'}
                      className="h-44 w-full object-cover"
                      loading="lazy"
                    />
                  </a>
                  <div className="space-y-s1 p-s2">
                    {/* <p className="truncate text-small font-medium text-text-primary">
                      {image.name}
                    </p> */}
                    {/* <p className="text-caption text-text-muted">
                      {formatFileSize(image.size)} •{' '}
                      {formatVehicleDate(image.uploadedAt)}
                    </p> */}
                    <div className="flex items-center justify-between">
                      <a
                        href={image.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-caption font-medium text-primary-700 hover:underline"
                      >
                        View full size
                      </a>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onDeleteImage(image.id)}
                        disabled={deleteImageMutation.isPending}
                      >
                        <Trash className="h-4 w-4 text-rose-500" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      <Card className="p-s4">
        <h2 className="text-h3">Job History</h2>
        {historyQuery.isLoading ? (
          <div className="mt-s3 h-20 animate-pulse rounded-md bg-surface-hover" />
        ) : history.length ? (
          <div className="mt-s3 overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-small">
              <thead className="border-b border-border text-text-secondary">
                <tr>
                  <th className="pb-s2 font-medium">Order</th>
                  <th className="pb-s2 font-medium">Date</th>
                  <th className="pb-s2 font-medium">Service</th>
                  <th className="pb-s2 font-medium">Status</th>
                  <th className="pb-s2 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {history.map((record) => (
                  <tr key={record.id} className="border-t border-border">
                    <td className="py-s2">
                      <Link
                        href={`/dashboard/work-orders/${record.workOrderId}`}
                        className="text-primary-700 hover:underline"
                      >
                        {record.orderCode}
                      </Link>
                    </td>
                    <td className="py-s2 text-text-secondary">
                      {formatVehicleDate(
                        record.completedAt ?? record.paidAt ?? record.updatedAt
                      )}
                    </td>
                    <td className="py-s2">
                      {record.services.length > 0
                        ? record.services
                            .map((service) => service.name)
                            .join(', ')
                        : 'General service'}
                    </td>
                    <td className="py-s2">{record.status}</td>
                    <td className="py-s2 text-right font-medium tabular-nums">
                      {formatCurrencyUsd(record.totalAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-s3 text-small text-text-muted">
            No work order history yet for this vehicle.
          </p>
        )}
      </Card>

      <Card className="p-s4">
        <h2 className="text-h3">Notes</h2>
        {editing ? (
          <Textarea
            className="mt-s3 min-h-[120px]"
            value={form.notes ?? ''}
            onChange={(event) =>
              setDraft((current) =>
                current
                  ? { ...current, notes: event.target.value }
                  : { ...baseForm, notes: event.target.value }
              )
            }
          />
        ) : (
          <p className="mt-s3 text-small text-text-secondary">
            {vehicle.notes || '-'}
          </p>
        )}
      </Card>

      <Card className="p-s4">
        <h2 className="text-h3">Financial Snapshot</h2>
        <div className="mt-s3 grid gap-s3 md:grid-cols-3">
          <div className="rounded-md border border-border bg-surface-default p-s3">
            <p className="text-caption text-text-muted">Average Ticket</p>
            <p className="mt-s1 text-h3">
              {formatCurrencyUsd(averageTicket(vehicle))}
            </p>
          </div>
          <div className="rounded-md border border-border bg-surface-default p-s3">
            <p className="text-caption text-text-muted">Created</p>
            <p className="mt-s1 text-h3">
              {formatVehicleDate(vehicle.createdAt)}
            </p>
          </div>
          <div className="rounded-md border border-border bg-surface-default p-s3">
            <p className="text-caption text-text-muted">Last Updated</p>
            <p className="mt-s1 text-h3">
              {formatVehicleDate(vehicle.updatedAt)}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
