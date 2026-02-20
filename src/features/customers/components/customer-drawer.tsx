'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Drawer } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { createCustomerSchema, type CreateCustomerInput } from '@/features/customers/schema';
import type { Customer, CustomerDetailResponse, CustomerStatus } from '@/features/customers/types';
import { calculateAverageTicket, formatCurrencyVnd, formatDate } from '@/features/customers/utils';

type DrawerMode = 'view' | 'create' | 'edit';

type CustomerDrawerProps = {
  open: boolean;
  mode: DrawerMode;
  customer?: Customer | null;
  detail?: CustomerDetailResponse;
  loadingDetail?: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateCustomerInput) => Promise<void>;
};

function defaults(customer?: Customer | null): CreateCustomerInput {
  if (!customer) {
    return {
      name: '',
      phone: '',
      email: '',
      address: '',
      notes: '',
      status: 'ACTIVE'
    };
  }

  return {
    name: customer.name,
    phone: customer.phone,
    email: customer.email ?? '',
    address: customer.address ?? '',
    notes: customer.notes ?? '',
    status: customer.status
  };
}

function statusBadge(status: CustomerStatus): { text: string; className: string } {
  if (status === 'ACTIVE') {
    return { text: 'Active', className: 'bg-badge-success text-badge-success-text' };
  }

  if (status === 'VIP') {
    return { text: 'VIP', className: 'bg-warning-100 text-warning-800' };
  }

  return { text: 'Inactive', className: 'bg-surface-hover text-text-secondary' };
}

export function CustomerDrawer({ open, mode, customer, detail, loadingDetail, onClose, onSubmit }: CustomerDrawerProps): JSX.Element | null {
  const [submitError, setSubmitError] = useState('');
  const nameRef = useRef<HTMLInputElement | null>(null);
  const defaultValues = useMemo(() => defaults(customer), [customer]);

  const form = useForm<CreateCustomerInput>({
    resolver: zodResolver(createCustomerSchema),
    defaultValues,
    mode: 'onChange'
  });

  const nameField = form.register('name');

  useEffect(() => {
    if (!open) {
      return;
    }

    form.reset(defaultValues);
    setSubmitError('');

    if (mode !== 'view') {
      window.setTimeout(() => nameRef.current?.focus(), 50);
    }
  }, [defaultValues, form, mode, open]);

  const isView = mode === 'view';
  const title = mode === 'create' ? 'Add Customer' : mode === 'edit' ? 'Edit Customer' : 'Customer Details';

  const handleSubmit = form.handleSubmit(async (values) => {
    setSubmitError('');

    try {
      await onSubmit(values);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not save customer.';
      setSubmitError(message);

      if (message.toLowerCase().includes('phone')) {
        form.setError('phone', { message: 'Phone already exists.' });
      }
    }
  });

  const detailCustomer = detail?.customer ?? customer;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={title}
      description={isView ? 'Review customer profile, vehicles, and latest service records.' : 'Manage customer information and notes.'}
      width="xl"
      disableClose={!isView && form.formState.isSubmitting}
      footer={
        !isView ? (
          <div className="flex items-center justify-end gap-s2">
            <Button variant="secondary" type="button" onClick={onClose} disabled={form.formState.isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" form="customer-drawer-form" disabled={!form.formState.isValid || form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </div>
        ) : undefined
      }
    >
      {isView ? (
        <div className="space-y-s4">
            {loadingDetail ? <div className="h-20 animate-pulse rounded-md bg-surface-hover" /> : null}

            {detailCustomer ? (
              <>
                <Card className="p-s4">
                  <div className="flex flex-wrap items-center justify-between gap-s2">
                    <div>
                      <p className="text-[17px] font-semibold text-text-primary">{detailCustomer.name}</p>
                      <p className="text-small text-text-secondary">{detailCustomer.phone}</p>
                    </div>
                    <Badge variant="default" className={statusBadge(detailCustomer.status).className}>
                      {statusBadge(detailCustomer.status).text}
                    </Badge>
                  </div>
                </Card>

                <Card className="p-s4">
                  <h4 className="text-small font-semibold text-text-primary">Basic Information</h4>
                  <div className="mt-s3 grid gap-s3 md:grid-cols-2">
                    <p className="text-small text-text-secondary">Email: {detailCustomer.email || '-'}</p>
                    <p className="text-small text-text-secondary">Address: {detailCustomer.address || '-'}</p>
                    <p className="text-small text-text-secondary">Last Visit: {formatDate(detailCustomer.lastVisit)}</p>
                    <p className="text-small text-text-secondary">Last Updated: {formatDate(detailCustomer.updatedAt)}</p>
                  </div>
                </Card>

                <Card className="p-s4">
                  <h4 className="text-small font-semibold text-text-primary">Vehicles</h4>
                  {detailCustomer.vehicles.length === 0 ? (
                    <p className="mt-s3 text-small text-text-muted">Customer has no registered vehicles.</p>
                  ) : (
                    <div className="mt-s3 overflow-x-auto">
                      <table className="w-full min-w-[460px] text-left text-small">
                        <thead className="border-b border-border text-text-secondary">
                          <tr>
                            <th className="pb-s2 font-medium">Plate</th>
                            <th className="pb-s2 font-medium">Brand</th>
                            <th className="pb-s2 font-medium">Last Service</th>
                          </tr>
                        </thead>
                        <tbody>
                          {detailCustomer.vehicles.map((vehicle) => (
                            <tr key={vehicle.id} className="border-t border-border">
                              <td className="py-s2">{vehicle.plate}</td>
                              <td className="py-s2">{vehicle.brand}</td>
                              <td className="py-s2 text-text-secondary">{formatDate(vehicle.lastServiceDate)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Card>

                <Card className="p-s4">
                  <h4 className="text-small font-semibold text-text-primary">Service History</h4>
                  {detail?.serviceHistory.length ? (
                    <div className="mt-s3 max-h-[240px] overflow-y-auto">
                      <table className="w-full min-w-[620px] text-left text-small">
                        <thead className="border-b border-border text-text-secondary">
                          <tr>
                            <th className="pb-s2 font-medium">Date</th>
                            <th className="pb-s2 font-medium">Vehicle</th>
                            <th className="pb-s2 font-medium">Service</th>
                            <th className="pb-s2 text-right font-medium">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {detail.serviceHistory.map((record) => (
                            <tr key={record.id} className="border-t border-border">
                              <td className="py-s2 text-text-secondary">{formatDate(record.date)}</td>
                              <td className="py-s2">{record.vehiclePlate}</td>
                              <td className="py-s2">{record.serviceName}</td>
                              <td className="py-s2 text-right tabular-nums font-medium">{formatCurrencyVnd(record.amount)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="mt-s3 text-small text-text-muted">No service history yet.</p>
                  )}
                </Card>

                <Card className="p-s4">
                  <h4 className="text-small font-semibold text-text-primary">Financial Summary</h4>
                  <div className="mt-s3 grid gap-s3 md:grid-cols-3">
                    <div className="rounded-md border border-border bg-surface-default p-s3">
                      <p className="text-caption text-text-muted">Total Visits</p>
                      <p className="mt-s1 text-h3">{detailCustomer.totalVisits}</p>
                    </div>
                    <div className="rounded-md border border-border bg-surface-default p-s3">
                      <p className="text-caption text-text-muted">Total Spent</p>
                      <p className="mt-s1 text-h3">{formatCurrencyVnd(detailCustomer.totalSpent)}</p>
                    </div>
                    <div className="rounded-md border border-border bg-surface-default p-s3">
                      <p className="text-caption text-text-muted">Average Ticket</p>
                      <p className="mt-s1 text-h3">{formatCurrencyVnd(calculateAverageTicket(detailCustomer))}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-s4">
                  <h4 className="text-small font-semibold text-text-primary">Notes</h4>
                  <p className="mt-s2 text-small text-text-secondary">{detailCustomer.notes || '-'}</p>
                </Card>
              </>
            ) : null}
          </div>
      ) : (
        <form id="customer-drawer-form" className="space-y-s4" onSubmit={handleSubmit}>
            <Card className="space-y-s3 p-s4">
              <h4 className="text-small font-semibold text-text-primary">Basic Information</h4>

              <div className="space-y-s1">
                <label className="text-small font-medium text-text-secondary">Name</label>
                <Input
                  className="h-11"
                  {...nameField}
                  ref={(node) => {
                    nameField.ref(node);
                    nameRef.current = node;
                  }}
                />
                {form.formState.errors.name ? <p className="text-caption text-state-error">{form.formState.errors.name.message}</p> : null}
              </div>

              <div className="space-y-s1">
                <label className="text-small font-medium text-text-secondary">Phone</label>
                <Input className="h-11" inputMode="numeric" {...form.register('phone')} />
                {form.formState.errors.phone ? <p className="text-caption text-state-error">{form.formState.errors.phone.message}</p> : null}
              </div>

              <div className="space-y-s1">
                <label className="text-small font-medium text-text-secondary">Email</label>
                <Input className="h-11" type="email" {...form.register('email')} />
                {form.formState.errors.email ? <p className="text-caption text-state-error">{form.formState.errors.email.message}</p> : null}
              </div>

              <div className="space-y-s1">
                <label className="text-small font-medium text-text-secondary">Address</label>
                <Input className="h-11" {...form.register('address')} />
              </div>

              <div className="space-y-s1">
                <label className="text-small font-medium text-text-secondary">Status</label>
                <select
                  className="h-11 w-full rounded-md border border-input-border bg-input px-s3 text-small text-input-foreground"
                  {...form.register('status')}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="VIP">VIP</option>
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

            {customer ? (
              <p className="text-caption text-text-muted">Last Updated: {formatDate(customer.updatedAt)}</p>
            ) : null}

            {submitError ? <p className="text-caption text-state-error">{submitError}</p> : null}
          </form>
      )}
    </Drawer>
  );
}
