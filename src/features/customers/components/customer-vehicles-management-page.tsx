'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ArrowLeft, Car, Pencil, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { LoadingState } from '@/components/common/loading-state';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Drawer } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import {
  createCustomerVehicle,
  deleteCustomerVehicle,
  getCustomerById,
  getCustomerVehicles,
  updateCustomerVehicle
} from '@/features/customers/service';
import type { CustomerVehicle } from '@/features/customers/types';
import { useToast } from '@/hooks/use-toast';
import { formatDate } from '@/lib/utils/format';

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

const customerVehicleSchema = z.object({
  plate: z.string().trim().min(1, 'Plate number is required.'),
  brand: z.string().trim().min(1, 'Brand is required.'),
  model: z.string().trim().optional(),
  year: z.coerce.number().int().min(1900).max(2100).optional(),
  color: z.string().trim().optional(),
  lastServiceDate: z.string().optional()
});

type CustomerVehicleForm = z.infer<typeof customerVehicleSchema>;
type DrawerMode = 'create' | 'edit';

function defaults(vehicle?: CustomerVehicle | null): CustomerVehicleForm {
  if (!vehicle) {
    return {
      plate: '',
      brand: '',
      model: '',
      year: undefined,
      color: '',
      lastServiceDate: ''
    };
  }

  return {
    plate: vehicle.plate,
    brand: vehicle.brand,
    model: vehicle.model ?? '',
    year: vehicle.year,
    color: vehicle.color ?? '',
    lastServiceDate: vehicle.lastServiceDate
      ? new Date(vehicle.lastServiceDate).toISOString().slice(0, 10)
      : ''
  };
}

function VehicleFormDrawer({
  open,
  mode,
  vehicle,
  onClose,
  onSubmit
}: {
  open: boolean;
  mode: DrawerMode;
  vehicle: CustomerVehicle | null;
  onClose: () => void;
  onSubmit: (values: CustomerVehicleForm) => Promise<void>;
}): JSX.Element | null {
  const defaultValues = useMemo(() => defaults(vehicle), [vehicle]);
  const form = useForm<CustomerVehicleForm>({
    resolver: zodResolver(customerVehicleSchema),
    defaultValues,
    mode: 'onChange'
  });
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (!open) {
      return;
    }

    form.reset(defaultValues);
  }, [defaultValues, form, open]);

  const handleSubmit = form.handleSubmit(async (values) => {
    setSubmitError('');
    try {
      await onSubmit(values);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Could not save vehicle.'
      );
    }
  });

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={
        mode === 'create' ? 'Add Customer Vehicle' : 'Edit Customer Vehicle'
      }
      description="Keep this customer's vehicles up to date."
      width="lg"
      disableClose={form.formState.isSubmitting}
      footer={
        <div className="flex items-center justify-end gap-s2">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={form.formState.isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="customer-vehicle-form"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </div>
      }
    >
      <form
        id="customer-vehicle-form"
        className="space-y-s3"
        onSubmit={handleSubmit}
      >
        <div className="space-y-s1">
          <label className="text-small font-medium text-text-secondary">
            Plate Number
          </label>
          <Input className="h-11" {...form.register('plate')} />
          {form.formState.errors.plate ? (
            <p className="text-caption text-state-error">
              {form.formState.errors.plate.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-s1">
          <label className="text-small font-medium text-text-secondary">
            Brand
          </label>
          <Input className="h-11" {...form.register('brand')} />
          {form.formState.errors.brand ? (
            <p className="text-caption text-state-error">
              {form.formState.errors.brand.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-s1">
          <label className="text-small font-medium text-text-secondary">
            Model
          </label>
          <Input className="h-11" {...form.register('model')} />
        </div>

        <div className="grid gap-s3 md:grid-cols-2">
          <div className="space-y-s1">
            <label className="text-small font-medium text-text-secondary">
              Year
            </label>
            <Input
              className="h-11"
              type="number"
              inputMode="numeric"
              {...form.register('year', { valueAsNumber: true })}
            />
            {form.formState.errors.year ? (
              <p className="text-caption text-state-error">
                {form.formState.errors.year.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-s1">
            <label className="text-small font-medium text-text-secondary">
              Color
            </label>
            <Input className="h-11" {...form.register('color')} />
          </div>
        </div>

        <div className="space-y-s1">
          <label className="text-small font-medium text-text-secondary">
            Last Service Date
          </label>
          <Input
            className="h-11"
            type="date"
            {...form.register('lastServiceDate')}
          />
        </div>

        {submitError ? (
          <p className="text-caption text-state-error">{submitError}</p>
        ) : null}
      </form>
    </Drawer>
  );
}

export function CustomerVehiclesManagementPage({
  customerId
}: {
  customerId: string;
}): JSX.Element {
  const toast = useToast();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>('create');
  const [selected, setSelected] = useState<CustomerVehicle | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CustomerVehicle | null>(
    null
  );

  const detailQuery = useQuery({
    queryKey: ['customers', 'detail', customerId],
    queryFn: () => getCustomerById(customerId)
  });

  const vehiclesQuery = useQuery({
    queryKey: ['customers', 'vehicles', customerId],
    queryFn: () => getCustomerVehicles(customerId)
  });

  const createMutation = useMutation({
    mutationFn: (input: CustomerVehicleForm) =>
      createCustomerVehicle(customerId, input)
  });
  const updateMutation = useMutation({
    mutationFn: ({
      vehicleId,
      input
    }: {
      vehicleId: string;
      input: CustomerVehicleForm;
    }) => updateCustomerVehicle(customerId, vehicleId, input)
  });
  const deleteMutation = useMutation({
    mutationFn: (vehicleId: string) =>
      deleteCustomerVehicle(customerId, vehicleId)
  });

  const isTableUpdating =
    (vehiclesQuery.isFetching && !vehiclesQuery.isLoading) ||
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  const vehicles = useMemo(
    () => vehiclesQuery.data ?? [],
    [vehiclesQuery.data]
  );
  const customerName = detailQuery.data?.customer.name ?? 'Customer';

  const refreshData = async (): Promise<void> => {
    await Promise.all([vehiclesQuery.refetch(), detailQuery.refetch()]);
  };

  const openCreate = () => {
    setDrawerMode('create');
    setSelected(null);
    setDrawerOpen(true);
  };

  const openEdit = (vehicle: CustomerVehicle) => {
    setDrawerMode('edit');
    setSelected(vehicle);
    setDrawerOpen(true);
  };

  const handleSubmit = async (values: CustomerVehicleForm): Promise<void> => {
    if (drawerMode === 'create') {
      await createMutation.mutateAsync(values);
      toast.success('Vehicle added.');
    } else if (selected) {
      await updateMutation.mutateAsync({
        vehicleId: selected.id,
        input: values
      });
      toast.success('Vehicle updated.');
    }

    setDrawerOpen(false);
    await refreshData();
  };

  const handleDelete = async (): Promise<void> => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
    toast.success('Vehicle removed.');
    await refreshData();
  };

  if (detailQuery.isLoading || vehiclesQuery.isLoading) {
    return <LoadingState label="Loading customer vehicles..." />;
  }

  if (detailQuery.isError || vehiclesQuery.isError) {
    return (
      <Card className="m-s8 p-s6">
        <p className="text-small text-state-error">
          Could not load customer vehicle data.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-s6 p-s8">
      <header className="flex flex-col items-start justify-between gap-s3 md:flex-row md:items-center">
        <div className="space-y-s2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard/customers">
              <ArrowLeft className="size-4" />
              Back to Customers
            </Link>
          </Button>
          <div>
            <h1 className="text-h1">{customerName} - Vehicles</h1>
            <p className="text-small text-text-muted">
              Manage vehicles linked to this customer.
            </p>
          </div>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          Add Vehicle
        </Button>
      </header>

      {isTableUpdating ? (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-small">
              <thead className="bg-table-header text-table-header-text">
                <tr>
                  <th className="px-s4 py-s3 font-semibold">Plate Number</th>
                  <th className="px-s4 py-s3 font-semibold">Brand</th>
                  <th className="px-s4 py-s3 font-semibold">Model</th>
                  <th className="px-s4 py-s3 font-semibold">Year</th>
                  <th className="px-s4 py-s3 font-semibold">Color</th>
                  <th className="px-s4 py-s3 font-semibold">Last Service</th>
                  <th className="px-s4 py-s3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 6 }).map((_, idx) => (
                  <tr
                    key={`customer-vehicle-skeleton-${idx}`}
                    className="border-t border-border bg-surface-default"
                  >
                    <td className="px-s4 py-s3">
                      <div className="h-4 w-24 animate-pulse rounded bg-surface-hover" />
                    </td>
                    <td className="px-s4 py-s3">
                      <div className="h-4 w-20 animate-pulse rounded bg-surface-hover" />
                    </td>
                    <td className="px-s4 py-s3">
                      <div className="h-4 w-20 animate-pulse rounded bg-surface-hover" />
                    </td>
                    <td className="px-s4 py-s3">
                      <div className="h-4 w-12 animate-pulse rounded bg-surface-hover" />
                    </td>
                    <td className="px-s4 py-s3">
                      <div className="h-4 w-16 animate-pulse rounded bg-surface-hover" />
                    </td>
                    <td className="px-s4 py-s3">
                      <div className="h-4 w-24 animate-pulse rounded bg-surface-hover" />
                    </td>
                    <td className="px-s4 py-s3">
                      <div className="h-4 w-28 animate-pulse rounded bg-surface-hover" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : vehicles.length === 0 ? (
        <Card className="grid min-h-[240px] place-items-center p-s6 text-center">
          <div className="space-y-s2">
            <div className="mx-auto grid size-10 place-items-center rounded-full bg-surface-hover text-text-secondary">
              <Car className="size-5" />
            </div>
            <h3 className="text-h3">No vehicles for this customer yet</h3>
            <p className="text-small text-text-muted">
              Add the first vehicle so your team can track service history
              clearly.
            </p>
            <div className="pt-s2">
              <Button onClick={openCreate}>Add First Vehicle</Button>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-small">
              <thead className="bg-table-header text-table-header-text">
                <tr>
                  <th className="px-s4 py-s3 font-semibold">Plate Number</th>
                  <th className="px-s4 py-s3 font-semibold">Brand</th>
                  <th className="px-s4 py-s3 font-semibold">Model</th>
                  <th className="px-s4 py-s3 font-semibold">Year</th>
                  <th className="px-s4 py-s3 font-semibold">Color</th>
                  <th className="px-s4 py-s3 font-semibold">Last Service</th>
                  <th className="px-s4 py-s3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((vehicle) => (
                  <tr
                    key={vehicle.id}
                    className="border-t border-border bg-surface-default text-text-primary hover:bg-surface-hover"
                  >
                    <td className="px-s4 py-s3 font-medium">{vehicle.plate}</td>
                    <td className="px-s4 py-s3">{vehicle.brand}</td>
                    <td className="px-s4 py-s3">{vehicle.model || '-'}</td>
                    <td className="px-s4 py-s3">{vehicle.year || '-'}</td>
                    <td className="px-s4 py-s3">{vehicle.color || '-'}</td>
                    <td className="px-s4 py-s3 text-text-secondary">
                      {formatCustomerDate(vehicle.lastServiceDate)}
                    </td>
                    <td className="px-s4 py-s3">
                      <div className="flex items-center gap-s2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEdit(vehicle)}
                        >
                          <Pencil className="size-4" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-state-error"
                          onClick={() => setDeleteTarget(vehicle)}
                        >
                          <Trash2 className="size-4" />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <VehicleFormDrawer
        open={drawerOpen}
        mode={drawerMode}
        vehicle={selected}
        onClose={() => setDrawerOpen(false)}
        onSubmit={handleSubmit}
      />

      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete vehicle?"
        width="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => void handleDelete()}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </>
        }
      >
        <p className="text-small text-text-muted">
          Remove this vehicle from this customer profile. This action cannot be
          undone.
        </p>
      </Modal>
    </div>
  );
}
