'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Drawer } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { createVehicleSchema, type CreateVehicleInput } from '@/features/vehicles/schema';
import type { ServiceRecord, Vehicle, VehicleStatus } from '@/features/vehicles/types';
import { averageTicket, formatCurrencyVnd, formatDate, toPlateDisplay } from '@/features/vehicles/utils';

type DrawerMode = 'view' | 'create' | 'edit';

type VehicleDrawerProps = {
  open: boolean;
  mode: DrawerMode;
  vehicle?: Vehicle | null;
  detail?: Vehicle;
  services?: ServiceRecord[];
  loadingDetail?: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateVehicleInput) => Promise<void>;
};

function defaults(vehicle?: Vehicle | null): CreateVehicleInput {
  if (!vehicle) {
    return {
      plateNumber: '',
      customerName: '',
      customerPhone: '',
      customerId: '',
      brand: '',
      model: '',
      year: undefined,
      color: '',
      vin: '',
      status: 'ACTIVE',
      notes: ''
    };
  }

  return {
    plateNumber: vehicle.plateNumber,
    customerName: vehicle.customerName,
    customerPhone: vehicle.customerPhone,
    customerId: vehicle.customerId,
    brand: vehicle.brand,
    model: vehicle.model,
    year: vehicle.year,
    color: vehicle.color,
    vin: vehicle.vin,
    status: vehicle.status,
    notes: vehicle.notes
  };
}

function statusStyle(status: VehicleStatus): { text: string; className: string } {
  if (status === 'IN_SERVICE') return { text: 'In Service', className: 'bg-info-100 text-info-800' };
  if (status === 'COMPLETED') return { text: 'Completed', className: 'bg-badge-success text-badge-success-text' };
  if (status === 'OVERDUE') return { text: 'Overdue', className: 'bg-error-100 text-error-800' };
  if (status === 'ACTIVE') return { text: 'Active', className: 'bg-surface-hover text-text-secondary' };
  return { text: 'Inactive', className: 'bg-surface-hover text-text-secondary' };
}

export function VehicleDrawer({
  open,
  mode,
  vehicle,
  detail,
  services,
  loadingDetail,
  onClose,
  onSubmit
}: VehicleDrawerProps): JSX.Element | null {
  const [submitError, setSubmitError] = useState('');
  const plateRef = useRef<HTMLInputElement | null>(null);
  const defaultValues = useMemo(() => defaults(vehicle), [vehicle]);

  const form = useForm<CreateVehicleInput>({
    resolver: zodResolver(createVehicleSchema),
    defaultValues,
    mode: 'onChange'
  });

  const plateField = form.register('plateNumber');

  useEffect(() => {
    if (!open) {
      return;
    }

    form.reset(defaultValues);
    setSubmitError('');

    if (mode !== 'view') {
      window.setTimeout(() => plateRef.current?.focus(), 50);
    }
  }, [defaultValues, form, mode, open]);

  const isView = mode === 'view';
  const title = mode === 'create' ? 'Add Vehicle' : mode === 'edit' ? 'Edit Vehicle' : 'Vehicle Details';

  const handleSubmit = form.handleSubmit(async (values) => {
    setSubmitError('');

    try {
      await onSubmit({ ...values, plateNumber: toPlateDisplay(values.plateNumber) });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not save vehicle.';
      setSubmitError(message);

      if (message.toLowerCase().includes('plate')) {
        form.setError('plateNumber', { message: 'Plate number already exists.' });
      }
    }
  });

  const detailVehicle = detail ?? vehicle;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={title}
      description={isView ? 'Review vehicle details, owner info, and latest service records.' : 'Update vehicle profile and owner details.'}
      width="xl"
      disableClose={!isView && form.formState.isSubmitting}
      footer={
        !isView ? (
          <div className="flex items-center justify-end gap-s2">
            <Button variant="secondary" type="button" onClick={onClose} disabled={form.formState.isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" form="vehicle-drawer-form" disabled={!form.formState.isValid || form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </div>
        ) : undefined
      }
    >
      {isView ? (
        <div className="space-y-s4">
            {loadingDetail ? <div className="h-20 animate-pulse rounded-md bg-surface-hover" /> : null}

            {detailVehicle ? (
              <>
                <Card className="p-s4">
                  <div className="flex flex-wrap items-center justify-between gap-s2">
                    <div>
                      <p className="text-[18px] font-semibold text-text-primary">{detailVehicle.plateNumber}</p>
                      <p className="text-small text-text-secondary">{detailVehicle.customerName}</p>
                    </div>
                    <Badge variant="default" className={statusStyle(detailVehicle.status).className}>
                      {statusStyle(detailVehicle.status).text}
                    </Badge>
                  </div>
                </Card>

                <Card className="p-s4">
                  <h4 className="text-small font-semibold text-text-primary">Vehicle Info</h4>
                  <div className="mt-s3 grid gap-s3 md:grid-cols-2">
                    <p className="text-small text-text-secondary">Plate Number: {detailVehicle.plateNumber}</p>
                    <p className="text-small text-text-secondary">Brand: {detailVehicle.brand || '-'}</p>
                    <p className="text-small text-text-secondary">Model: {detailVehicle.model || '-'}</p>
                    <p className="text-small text-text-secondary">Year: {detailVehicle.year || '-'}</p>
                    <p className="text-small text-text-secondary">Color: {detailVehicle.color || '-'}</p>
                    <p className="text-small text-text-secondary">VIN: {detailVehicle.vin || '-'}</p>
                  </div>
                </Card>

                <Card className="p-s4">
                  <h4 className="text-small font-semibold text-text-primary">Owner Info</h4>
                  <div className="mt-s3 grid gap-s3 md:grid-cols-2">
                    <p className="text-small text-text-secondary">Customer Name: {detailVehicle.customerName}</p>
                    <p className="text-small text-text-secondary">Phone: {detailVehicle.customerPhone}</p>
                    <p className="text-small text-text-secondary">Email: -</p>
                  </div>
                </Card>

                <Card className="p-s4">
                  <h4 className="text-small font-semibold text-text-primary">Service History</h4>
                  {services?.length ? (
                    <div className="mt-s3 max-h-[240px] overflow-y-auto">
                      <table className="w-full min-w-[620px] text-left text-small">
                        <thead className="border-b border-border text-text-secondary">
                          <tr>
                            <th className="pb-s2 font-medium">Date</th>
                            <th className="pb-s2 font-medium">Service</th>
                            <th className="pb-s2 text-right font-medium">Amount</th>
                            <th className="pb-s2 font-medium">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {services.map((record) => (
                            <tr key={record.id} className="border-t border-border">
                              <td className="py-s2 text-text-secondary">{formatDate(record.date)}</td>
                              <td className="py-s2">{record.serviceName}</td>
                              <td className="py-s2 text-right tabular-nums font-medium">{formatCurrencyVnd(record.amount)}</td>
                              <td className="py-s2">{record.status}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="mt-s3 text-small text-text-muted">No service history.</p>
                  )}
                </Card>

                <Card className="p-s4">
                  <h4 className="text-small font-semibold text-text-primary">Financial Summary</h4>
                  <div className="mt-s3 grid gap-s3 md:grid-cols-3">
                    <div className="rounded-md border border-border bg-surface-default p-s3">
                      <p className="text-caption text-text-muted">Total Visits</p>
                      <p className="mt-s1 text-h3">{detailVehicle.totalVisits}</p>
                    </div>
                    <div className="rounded-md border border-border bg-surface-default p-s3">
                      <p className="text-caption text-text-muted">Total Spent</p>
                      <p className="mt-s1 text-h3">{formatCurrencyVnd(detailVehicle.totalSpent)}</p>
                    </div>
                    <div className="rounded-md border border-border bg-surface-default p-s3">
                      <p className="text-caption text-text-muted">Average Ticket</p>
                      <p className="mt-s1 text-h3">{formatCurrencyVnd(averageTicket(detailVehicle))}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-s4">
                  <h4 className="text-small font-semibold text-text-primary">Notes</h4>
                  <p className="mt-s2 text-small text-text-secondary">{detailVehicle.notes || '-'}</p>
                </Card>
              </>
            ) : null}
          </div>
      ) : (
        <form id="vehicle-drawer-form" className="space-y-s4" onSubmit={handleSubmit}>
            <Card className="space-y-s3 p-s4">
              <h4 className="text-small font-semibold text-text-primary">Vehicle Info</h4>

              <div className="space-y-s1">
                <label className="text-small font-medium text-text-secondary">Plate Number</label>
                <Input
                  className="h-11"
                  {...plateField}
                  onChange={(event) => form.setValue('plateNumber', toPlateDisplay(event.target.value), { shouldDirty: true })}
                  ref={(node) => {
                    plateField.ref(node);
                    plateRef.current = node;
                  }}
                />
                {form.formState.errors.plateNumber ? (
                  <p className="text-caption text-state-error">{form.formState.errors.plateNumber.message}</p>
                ) : null}
              </div>

              <div className="grid gap-s3 md:grid-cols-2">
                <div className="space-y-s1">
                  <label className="text-small font-medium text-text-secondary">Brand</label>
                  <Input className="h-11" {...form.register('brand')} />
                </div>
                <div className="space-y-s1">
                  <label className="text-small font-medium text-text-secondary">Model</label>
                  <Input className="h-11" {...form.register('model')} />
                </div>
                <div className="space-y-s1">
                  <label className="text-small font-medium text-text-secondary">Year</label>
                  <Input className="h-11" inputMode="numeric" {...form.register('year', { valueAsNumber: true })} />
                </div>
                <div className="space-y-s1">
                  <label className="text-small font-medium text-text-secondary">Color</label>
                  <Input className="h-11" {...form.register('color')} />
                </div>
                <div className="space-y-s1 md:col-span-2">
                  <label className="text-small font-medium text-text-secondary">VIN</label>
                  <Input className="h-11" {...form.register('vin')} />
                </div>
              </div>
            </Card>

            <Card className="space-y-s3 p-s4">
              <h4 className="text-small font-semibold text-text-primary">Owner Info</h4>

              <div className="space-y-s1">
                <label className="text-small font-medium text-text-secondary">Customer Name</label>
                <Input className="h-11" {...form.register('customerName')} />
                {form.formState.errors.customerName ? (
                  <p className="text-caption text-state-error">{form.formState.errors.customerName.message}</p>
                ) : null}
              </div>

              <div className="space-y-s1">
                <label className="text-small font-medium text-text-secondary">Customer Phone</label>
                <Input className="h-11" inputMode="numeric" {...form.register('customerPhone')} />
                {form.formState.errors.customerPhone ? (
                  <p className="text-caption text-state-error">{form.formState.errors.customerPhone.message}</p>
                ) : null}
              </div>

              <div className="space-y-s1">
                <label className="text-small font-medium text-text-secondary">Status</label>
                <select
                  className="h-11 w-full rounded-md border border-input-border bg-input px-s3 text-small text-input-foreground"
                  {...form.register('status')}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="IN_SERVICE">In Service</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="OVERDUE">Overdue</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>

              <div className="space-y-s1">
                <label className="text-small font-medium text-text-secondary">Notes</label>
                <textarea
                  className="min-h-[92px] w-full rounded-md border border-input-border bg-input px-s3 py-s2 text-small text-input-foreground placeholder:text-input-placeholder"
                  {...form.register('notes')}
                />
              </div>
            </Card>

            {submitError ? <p className="text-caption text-state-error">{submitError}</p> : null}
          </form>
      )}
    </Drawer>
  );
}
