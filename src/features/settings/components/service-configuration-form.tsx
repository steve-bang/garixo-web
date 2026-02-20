'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil, Plus, Trash2, Wrench } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Drawer } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/hooks/use-toast';
import {
  serviceConfigurationFormSchema,
  type ServiceConfigurationFormValues
} from '@/features/settings/service-configuration.schema';
import {
  createSettingService,
  deleteSettingService,
  getSettingServices,
  updateSettingService
} from '@/features/settings/service-configuration.service';
import type { ServiceConfigurationItem } from '@/features/settings/service-configuration.types';

type DrawerState =
  | { open: false; mode: 'create'; service: null }
  | { open: true; mode: 'create'; service: null }
  | { open: true; mode: 'edit'; service: ServiceConfigurationItem };

function toFormValues(service?: ServiceConfigurationItem | null): ServiceConfigurationFormValues {
  return {
    name: service?.name ?? '',
    description: service?.description ?? '',
    defaultPrice: service?.defaultPrice === null || service?.defaultPrice === undefined ? '' : String(service.defaultPrice),
    standardTimeMinutes:
      service?.standardTimeMinutes === null || service?.standardTimeMinutes === undefined ? '' : String(service.standardTimeMinutes)
  };
}

function toCurrency(value: number | null): string {
  if (value === null) return '—';
  return `$${value.toLocaleString()}`;
}

function toDuration(value: number | null): string {
  if (value === null) return '—';
  if (value === 60) return '1 hour';
  if (value > 60 && value % 60 === 0) return `${value / 60} hours`;
  return `${value} mins`;
}

function normalizeName(value: string): string {
  return value.trim().toLowerCase();
}

export function ServiceConfigurationForm(): JSX.Element {
  const toast = useToast();
  const nameRef = useRef<HTMLInputElement | null>(null);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [services, setServices] = useState<ServiceConfigurationItem[]>([]);
  const [drawerState, setDrawerState] = useState<DrawerState>({ open: false, mode: 'create', service: null });
  const [deleteTarget, setDeleteTarget] = useState<ServiceConfigurationItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const form = useForm<ServiceConfigurationFormValues>({
    resolver: zodResolver(serviceConfigurationFormSchema),
    defaultValues: toFormValues(),
    mode: 'onBlur'
  });
  const nameField = form.register('name');

  const loadServices = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const data = await getSettingServices();
      setServices(data);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Could not load services.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadServices();
  }, []);

  useEffect(() => {
    if (!drawerState.open) return;
    form.reset(toFormValues(drawerState.service));
    window.setTimeout(() => nameRef.current?.focus(), 30);
  }, [drawerState, form]);

  const sortedServices = useMemo(() => [...services].sort((a, b) => a.name.localeCompare(b.name)), [services]);

  const drawerTitle = drawerState.mode === 'create' ? 'Add Service' : 'Edit Service';
  const drawerDefaults = toFormValues(drawerState.service);
  const hasChanges =
    normalizeName(form.watch('name') ?? '') !== normalizeName(drawerDefaults.name) ||
    (form.watch('description') ?? '') !== (drawerDefaults.description ?? '') ||
    (form.watch('defaultPrice') ?? '') !== drawerDefaults.defaultPrice ||
    (form.watch('standardTimeMinutes') ?? '') !== drawerDefaults.standardTimeMinutes;
  const saveDisabled = submitting || !form.watch('name')?.trim() || (drawerState.mode === 'edit' ? !hasChanges : false);

  const onSubmit = form.handleSubmit(async (values) => {
    const name = values.name.trim();
    const description = (values.description ?? '').trim();
    const defaultPrice = values.defaultPrice?.trim() ? Number(values.defaultPrice) : null;
    const standardTimeMinutes = values.standardTimeMinutes?.trim() ? Number(values.standardTimeMinutes) : null;

    const duplicate = services.some(
      (item) => normalizeName(item.name) === normalizeName(name) && item.id !== (drawerState.service?.id ?? '')
    );
    if (duplicate) {
      form.setError('name', { message: 'Service name must be unique.' });
      return;
    }

    setSubmitting(true);
    try {
      if (drawerState.mode === 'create') {
        const created = await createSettingService({ name, description, defaultPrice, standardTimeMinutes });
        setServices((prev) => [...prev, created]);
        toast.success('Service added successfully.');
      } else if (drawerState.service) {
        const updated = await updateSettingService(drawerState.service.id, { name, description, defaultPrice, standardTimeMinutes });
        setServices((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        toast.success('Service updated successfully.');
      }
      setDrawerState({ open: false, mode: 'create', service: null });
      form.reset(toFormValues());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not save service.');
    } finally {
      setSubmitting(false);
    }
  });

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteSettingService(deleteTarget.id);
      setServices((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      setDeleteTarget(null);
      toast.success('Service deleted successfully.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not delete service.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="mx-auto max-w-[900px] space-y-s4">
      <header className="space-y-s2 border-b border-border pb-s4">
        <div className="flex items-center gap-s2">
          <Wrench className="size-5 text-text-secondary" />
          <h2 className="text-h2">Service Configuration</h2>
        </div>
        <p className="text-small text-text-muted">
          This configuration defines how your system calculates pricing and service duration.
        </p>
      </header>

      <Card className="space-y-s4 p-s6">
        <div className="flex items-center justify-between gap-s3">
          <div>
            <h3 className="text-h3">Services</h3>
            <p className="text-small text-text-muted">Define your standard services, pricing, and duration.</p>
          </div>
          <Button
            type="button"
            onClick={() => setDrawerState({ open: true, mode: 'create', service: null })}
          >
            <Plus className="size-4" />
            Add Service
          </Button>
        </div>

        {loading ? (
          <div className="space-y-s2">
            <div className="h-10 animate-pulse rounded-md bg-surface-hover" />
            <div className="h-10 animate-pulse rounded-md bg-surface-hover" />
            <div className="h-10 animate-pulse rounded-md bg-surface-hover" />
          </div>
        ) : loadError ? (
          <div className="space-y-s3 rounded-md border border-border p-s4">
            <p className="text-small text-state-error">{loadError}</p>
            <Button type="button" variant="secondary" onClick={() => void loadServices()}>
              Try Again
            </Button>
          </div>
        ) : sortedServices.length === 0 ? (
          <div className="grid place-items-center gap-s2 rounded-md border border-dashed border-border px-s4 py-s8 text-center">
            <Wrench className="size-8 text-text-muted" />
            <p className="text-small font-semibold text-text-primary">No services configured yet.</p>
            <p className="text-small text-text-muted">Add your first service to start using the system.</p>
            <Button type="button" onClick={() => setDrawerState({ open: true, mode: 'create', service: null })}>
              Add Service
            </Button>
          </div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-small">
                <thead className="border-b border-border text-text-secondary">
                  <tr>
                    <th className="px-s3 py-s2 font-medium">Service Name</th>
                    <th className="px-s3 py-s2 font-medium">Description</th>
                    <th className="px-s3 py-s2 font-medium">Default Price</th>
                    <th className="px-s3 py-s2 font-medium">Standard Time</th>
                    <th className="px-s3 py-s2 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedServices.map((item) => (
                    <tr key={item.id} className="border-t border-border">
                      <td className="px-s3 py-s3 font-medium text-text-primary">{item.name}</td>
                      <td className="px-s3 py-s3 text-text-secondary">{item.description || '—'}</td>
                      <td className="px-s3 py-s3 text-text-secondary">{toCurrency(item.defaultPrice)}</td>
                      <td className="px-s3 py-s3 text-text-secondary">{toDuration(item.standardTimeMinutes)}</td>
                      <td className="px-s3 py-s3">
                        <div className="flex items-center justify-end gap-s1">
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="h-9 w-9 p-0"
                            aria-label={`Edit ${item.name}`}
                            onClick={() => setDrawerState({ open: true, mode: 'edit', service: item })}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="h-9 w-9 p-0 text-state-error hover:text-state-error"
                            aria-label={`Delete ${item.name}`}
                            onClick={() => setDeleteTarget(item)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-s2 md:hidden">
              {sortedServices.map((item) => (
                <div key={item.id} className="rounded-md border border-border p-s3">
                  <p className="text-small font-semibold text-text-primary">{item.name}</p>
                  {item.description ? <p className="mt-s1 text-small text-text-secondary">{item.description}</p> : null}
                  <p className="mt-s1 text-small text-text-secondary">
                    {toCurrency(item.defaultPrice)} • {toDuration(item.standardTimeMinutes)}
                  </p>
                  <div className="mt-s2 flex items-center gap-s2">
                    <Button type="button" variant="secondary" size="sm" onClick={() => setDrawerState({ open: true, mode: 'edit', service: item })}>
                      Edit
                    </Button>
                    <Button type="button" variant="secondary" size="sm" onClick={() => setDeleteTarget(item)}>
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      <Drawer
        open={drawerState.open}
        onClose={() => setDrawerState({ open: false, mode: 'create', service: null })}
        title={drawerTitle}
        description="Default price can be changed per invoice."
        width="md"
        disableClose={submitting}
        footer={
          <div className="flex justify-end gap-s2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setDrawerState({ open: false, mode: 'create', service: null })}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" form="service-configuration-form" disabled={saveDisabled}>
              {submitting ? 'Saving...' : 'Save'}
            </Button>
          </div>
        }
      >
        <form id="service-configuration-form" className="space-y-s4" onSubmit={onSubmit}>
          <div className="space-y-s1">
            <label className="text-small font-medium text-text-secondary">Service Name</label>
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
            <label className="text-small font-medium text-text-secondary">Description</label>
            <Input className="h-11" placeholder="Short service description" {...form.register('description')} />
            {form.formState.errors.description ? (
              <p className="text-caption text-state-error">{form.formState.errors.description.message}</p>
            ) : null}
          </div>

          <div className="space-y-s1">
            <label className="text-small font-medium text-text-secondary">Default Price</label>
            <Input className="h-11" inputMode="decimal" {...form.register('defaultPrice')} />
            {form.formState.errors.defaultPrice ? (
              <p className="text-caption text-state-error">{form.formState.errors.defaultPrice.message}</p>
            ) : (
              <p className="text-caption text-text-muted">Default price can be changed per invoice.</p>
            )}
          </div>

          <div className="space-y-s1">
            <label className="text-small font-medium text-text-secondary">Standard Time (minutes)</label>
            <Input className="h-11" inputMode="numeric" {...form.register('standardTimeMinutes')} />
            {form.formState.errors.standardTimeMinutes ? (
              <p className="text-caption text-state-error">{form.formState.errors.standardTimeMinutes.message}</p>
            ) : null}
          </div>
        </form>
      </Drawer>

      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete Service?"
        width="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => void handleDelete()} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </>
        }
      >
        <p className="text-small text-text-secondary">Are you sure you want to delete this service?</p>
      </Modal>
    </div>
  );
}
