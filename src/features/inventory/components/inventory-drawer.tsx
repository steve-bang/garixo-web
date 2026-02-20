'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Drawer } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { createInventorySchema, type CreateInventoryInput } from '@/features/inventory/schema';
import type { InventoryCategory, InventoryItem } from '@/features/inventory/types';
import { parseCurrencyInput, toCurrencyInput } from '@/features/inventory/utils';

type DrawerMode = 'create' | 'edit';

type InventoryDrawerProps = {
  open: boolean;
  mode: DrawerMode;
  item?: InventoryItem | null;
  onClose: () => void;
  onSubmit: (payload: CreateInventoryInput) => Promise<void>;
};

function defaults(item?: InventoryItem | null): CreateInventoryInput {
  if (!item) {
    return {
      name: '',
      sku: '',
      category: 'ENGINE',
      quantity: 0,
      minLevel: 0,
      costPrice: 0,
      notes: ''
    };
  }

  return {
    name: item.name,
    sku: item.sku,
    category: item.category,
    quantity: item.quantity,
    minLevel: item.minLevel,
    costPrice: item.costPrice,
    notes: item.notes
  };
}

export function InventoryDrawer({ open, mode, item, onClose, onSubmit }: InventoryDrawerProps): JSX.Element | null {
  const [submitError, setSubmitError] = useState('');
  const itemNameRef = useRef<HTMLInputElement | null>(null);
  const defaultValues = useMemo(() => defaults(item), [item]);

  const form = useForm<CreateInventoryInput>({
    resolver: zodResolver(createInventorySchema),
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
    window.setTimeout(() => itemNameRef.current?.focus(), 50);
  }, [defaultValues, form, open]);

  const handleSubmit = form.handleSubmit(async (values) => {
    setSubmitError('');

    try {
      await onSubmit(values);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not save item.';
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
      title={mode === 'create' ? 'Add Item' : 'Edit Item'}
      description="Manage part details and stock levels."
      width="lg"
      disableClose={form.formState.isSubmitting}
      footer={
        <div className="flex justify-end gap-s2">
          <Button variant="secondary" type="button" onClick={onClose} disabled={form.formState.isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form="inventory-drawer-form" disabled={!form.formState.isValid || form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </div>
      }
    >
      <form id="inventory-drawer-form" className="space-y-s4" onSubmit={handleSubmit}>
        <section className="space-y-s3">
          <h4 className="text-small font-medium text-text-secondary">Basic Information</h4>

          <div className="space-y-s1">
            <label className="text-small font-medium text-text-secondary">Item Name</label>
            <Input
              className="h-11"
              {...nameField}
              ref={(node) => {
                nameField.ref(node);
                itemNameRef.current = node;
              }}
            />
            {form.formState.errors.name ? <p className="text-caption text-state-error">{form.formState.errors.name.message}</p> : null}
          </div>

          <div className="space-y-s1">
            <label className="text-small font-medium text-text-secondary">Part Code</label>
            <Input className="h-11" {...form.register('sku')} />
          </div>

          <div className="space-y-s1">
            <label className="text-small font-medium text-text-secondary">Category</label>
            <select
              className="h-11 w-full rounded-md border border-input-border bg-input px-s3 text-small text-input-foreground"
              {...form.register('category')}
            >
              {(['ENGINE', 'OIL', 'TIRE', 'BRAKE', 'ELECTRICAL'] as InventoryCategory[]).map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </section>

        <section className="space-y-s3">
          <h4 className="text-small font-medium text-text-secondary">Stock Settings</h4>

          <div className="space-y-s1">
            <label className="text-small font-medium text-text-secondary">Quantity</label>
            <Input className="h-11" inputMode="numeric" {...form.register('quantity', { valueAsNumber: true })} />
            {form.formState.errors.quantity ? <p className="text-caption text-state-error">{form.formState.errors.quantity.message}</p> : null}
          </div>

          <div className="space-y-s1">
            <label className="text-small font-medium text-text-secondary">Minimum Level</label>
            <Input className="h-11" inputMode="numeric" {...form.register('minLevel', { valueAsNumber: true })} />
            {form.formState.errors.minLevel ? <p className="text-caption text-state-error">{form.formState.errors.minLevel.message}</p> : null}
          </div>

          <div className="space-y-s1">
            <label className="text-small font-medium text-text-secondary">Cost Price</label>
            <Input
              className="h-11"
              inputMode="decimal"
              value={toCurrencyInput(form.watch('costPrice'))}
              onChange={(event) => form.setValue('costPrice', parseCurrencyInput(event.target.value), { shouldDirty: true })}
            />
            {form.formState.errors.costPrice ? (
              <p className="text-caption text-state-error">{form.formState.errors.costPrice.message}</p>
            ) : null}
          </div>
        </section>

        <section className="space-y-s1">
          <label className="text-small font-medium text-text-secondary">Notes</label>
          <Input className="h-11" {...form.register('notes')} />
        </section>

        {submitError ? <p className="text-caption text-state-error">{submitError}</p> : null}
      </form>
    </Drawer>
  );
}
