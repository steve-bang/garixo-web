'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Drawer } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import {
  createServiceSchema,
  type CreateServiceInput
} from '@/features/services/schema';
import {
  SERVICE_CATEGORY_VALUES,
  SERVICE_STATUS_VALUES,
  type Service
} from '@/features/services/types';
import { parseCurrencyInput, toCurrencyInput } from '@/features/services/utils';

type DrawerMode = 'create' | 'edit' | 'duplicate';

type ServiceDrawerProps = {
  open: boolean;
  mode: DrawerMode;
  service?: Service | null;
  onClose: () => void;
  onSubmit: (payload: CreateServiceInput) => Promise<void>;
};

function toDefaults(
  mode: DrawerMode,
  service?: Service | null
): CreateServiceInput {
  if (!service) {
    return {
      name: '',
      category: 'OTHER',
      price: 0,
      estimatedTime: '',
      description: '',
      status: 'ACTIVE'
    };
  }

  return {
    name: mode === 'duplicate' ? `${service.name} (Copy)` : service.name,
    category: service.category,
    price: service.price,
    estimatedTime: service.estimatedTime,
    description: service.description,
    status: service.status
  };
}

export function ServiceDrawer({
  open,
  mode,
  service,
  onClose,
  onSubmit
}: ServiceDrawerProps): JSX.Element | null {
  const [submitError, setSubmitError] = useState('');
  const defaultValues = useMemo(
    () => toDefaults(mode, service),
    [mode, service]
  );

  const form = useForm<CreateServiceInput>({
    resolver: zodResolver(createServiceSchema),
    defaultValues
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    form.reset(defaultValues);
    setSubmitError('');
  }, [defaultValues, form, open]);

  const handleSubmit = form.handleSubmit(async (values) => {
    setSubmitError('');

    try {
      await onSubmit(values);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Could not save service.';
      setSubmitError(message);

      if (message.toLowerCase().includes('name')) {
        form.setError('name', { message });
      }
    }
  });

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={
        mode === 'create'
          ? 'Add Service'
          : mode === 'duplicate'
            ? 'Duplicate Service'
            : 'Edit Service'
      }
      description="Update pricing and service information."
      width="lg"
      disableClose={form.formState.isSubmitting}
      footer={
        <div className="flex justify-end gap-s2">
          <Button
            variant="secondary"
            type="button"
            onClick={onClose}
            disabled={form.formState.isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="service-drawer-form"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </div>
      }
    >
      <form
        id="service-drawer-form"
        className="space-y-s3"
        onSubmit={handleSubmit}
      >
        <div className="space-y-s1">
          <label className="text-small font-medium text-text-secondary">
            Service Name
          </label>
          <Input className="h-11" {...form.register('name')} />
          {form.formState.errors.name ? (
            <p className="text-caption text-state-error">
              {form.formState.errors.name.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-s1">
          <label className="text-small font-medium text-text-secondary">
            Category
          </label>
          <select
            className="h-11 w-full rounded-md border border-input-border bg-input px-s3 text-small text-input-foreground"
            {...form.register('category')}
          >
            {SERVICE_CATEGORY_VALUES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-s1">
          <label className="text-small font-medium text-text-secondary">
            Service Price
          </label>
          <Input
            className="h-11"
            inputMode="decimal"
            value={toCurrencyInput(form.watch('price'))}
            onChange={(event) =>
              form.setValue('price', parseCurrencyInput(event.target.value), {
                shouldDirty: true
              })
            }
          />
          {form.formState.errors.price ? (
            <p className="text-caption text-state-error">
              {form.formState.errors.price.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-s1">
          <label className="text-small font-medium text-text-secondary">
            Estimated Time
          </label>
          <Input
            className="h-11"
            placeholder="30 minutes"
            {...form.register('estimatedTime')}
          />
          {form.formState.errors.estimatedTime ? (
            <p className="text-caption text-state-error">
              {form.formState.errors.estimatedTime.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-s1">
          <label className="text-small font-medium text-text-secondary">
            Description
          </label>
          <Input className="h-11" {...form.register('description')} />
        </div>

        <div className="space-y-s1">
          <label className="text-small font-medium text-text-secondary">
            Status
          </label>
          <select
            className="h-11 w-full rounded-md border border-input-border bg-input px-s3 text-small text-input-foreground"
            {...form.register('status')}
          >
            {SERVICE_STATUS_VALUES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {submitError ? (
          <p className="text-caption text-state-error">{submitError}</p>
        ) : null}
      </form>
    </Drawer>
  );
}
