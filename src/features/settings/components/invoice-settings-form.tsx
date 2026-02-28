'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { FileText } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  invoiceSettingsSchema,
  type InvoiceSettingsFormValues
} from '@/features/settings/invoice-settings.schema';
import {
  getInvoiceSettings,
  updateInvoiceSettings
} from '@/features/settings/invoice-settings.service';
import type { InvoiceSettings } from '@/features/settings/invoice-settings.types';

const paymentTermOptions: Array<{
  value: InvoiceSettings['paymentTerm'];
  label: string;
}> = [
  { value: 'DUE_ON_RECEIPT', label: 'Due on receipt' },
  { value: 'NET_7', label: 'Due in 7 days' },
  { value: 'NET_15', label: 'Due in 15 days' },
  { value: 'NET_30', label: 'Due in 30 days' }
];

function toDefaults(data: InvoiceSettings): InvoiceSettingsFormValues {
  return {
    tax: {
      enabled: data.tax.enabled,
      rate: data.tax.rate,
      label: data.tax.label
    },
    paymentTerm: data.paymentTerm
  };
}

export function InvoiceSettingsForm(): JSX.Element {
  const toast = useToast();

  const [savedSettings, setSavedSettings] = useState<InvoiceSettings | null>(
    null
  );
  const [isLoading, setLoading] = useState(true);
  const [isLoadError, setLoadError] = useState(false);

  const form = useForm<InvoiceSettingsFormValues>({
    resolver: zodResolver(invoiceSettingsSchema),
    defaultValues: {
      tax: {
        enabled: false,
        rate: 8.25,
        label: 'Sales Tax'
      },
      paymentTerm: 'DUE_ON_RECEIPT'
    }
  });

  const loadSettings = async () => {
    setLoadError(false);
    setLoading(true);

    try {
      const data = await getInvoiceSettings();
      setSavedSettings(data);
      form.reset(toDefaults(data));
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSettings();
  }, []);

  const taxEnabled = form.watch('tax.enabled');
  const paymentTerm = form.watch('paymentTerm');
  const saveDisabled = !form.formState.isDirty || form.formState.isSubmitting;

  const paymentTermHint = useMemo(() => {
    if (paymentTerm === 'DUE_ON_RECEIPT') {
      return 'Customers should pay when they receive the invoice.';
    }

    if (paymentTerm === 'NET_7') {
      return 'Customers have 7 days to pay from invoice date.';
    }

    if (paymentTerm === 'NET_15') {
      return 'Customers have 15 days to pay from invoice date.';
    }

    return 'Customers have 30 days to pay from invoice date.';
  }, [paymentTerm]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const updated = await updateInvoiceSettings({
        tax: {
          enabled: values.tax.enabled,
          rate: values.tax.rate,
          label: values.tax.label.trim()
        },
        paymentTerm: values.paymentTerm
      });

      setSavedSettings(updated);
      form.reset(toDefaults(updated));
      toast.success('Invoice settings updated.');
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Could not save invoice settings.'
      );
    }
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[720px] space-y-s4">
        <div className="space-y-s2">
          <div className="h-6 w-44 animate-pulse rounded-md bg-surface-hover" />
          <div className="h-4 w-96 animate-pulse rounded-md bg-surface-hover" />
        </div>
        <Card className="space-y-s4 p-s6">
          <div className="h-8 w-full animate-pulse rounded-md bg-surface-hover" />
          <div className="h-8 w-full animate-pulse rounded-md bg-surface-hover" />
          <div className="h-8 w-full animate-pulse rounded-md bg-surface-hover" />
        </Card>
      </div>
    );
  }

  if (isLoadError) {
    return (
      <div className="mx-auto max-w-[720px]">
        <Card className="space-y-s3 p-s6">
          <p className="text-small text-state-error">
            Could not load invoice settings.
          </p>
          <Button type="button" onClick={() => void loadSettings()}>
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[720px] space-y-s4">
      <header className="space-y-s2 border-b border-border pb-s4">
        <div className="flex items-center gap-s2">
          <FileText className="size-5 text-text-secondary" />
          <h2 className="text-h2">Invoice Settings</h2>
        </div>
        <p className="text-small text-text-muted">
          Choose your default tax and payment terms so every invoice is clear
          and consistent.
        </p>
      </header>

      <form className="space-y-s4" onSubmit={onSubmit}>
        <Card className="space-y-s4 p-s6">
          <div className="space-y-s1">
            <h3 className="text-h3">Tax Defaults</h3>
            <p className="text-small text-text-muted">
              Set how tax appears on new invoices.
            </p>
          </div>

          <div className="space-x-s2">
            <label
              htmlFor="taxEnabled"
              className="text-small font-medium text-text-primary"
            >
              Tax
            </label>
            <label className="inline-flex items-center gap-s2 rounded-md border border-border px-s3 py-s2">
              <input
                id="taxEnabled"
                type="checkbox"
                className="size-4 rounded border-input-border"
                {...form.register('tax.enabled')}
              />
              <span className="text-small text-text-secondary">
                Add tax to new invoices
              </span>
            </label>
          </div>

          <div className="grid gap-s4 sm:grid-cols-2">
            <div className="space-y-s1">
              <label
                htmlFor="taxRate"
                className="text-small font-medium text-text-primary"
              >
                Tax rate (%)
              </label>
              <Input
                id="taxRate"
                type="number"
                min={0}
                max={100}
                step={0.01}
                disabled={!taxEnabled}
                {...form.register('tax.rate', { valueAsNumber: true })}
              />
              <p className="text-caption text-text-muted">
                Typical US sales tax ranges from 0% to around 10%.
              </p>
              {form.formState.errors.tax?.rate ? (
                <p className="text-caption text-state-error">
                  {form.formState.errors.tax.rate.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-s1">
              <label
                htmlFor="taxLabel"
                className="text-small font-medium text-text-primary"
              >
                Tax label
              </label>
              <Input
                id="taxLabel"
                disabled={!taxEnabled}
                placeholder="Sales Tax"
                {...form.register('tax.label')}
              />
              <p className="text-caption text-text-muted">
                Example: Sales Tax, State Tax, or Local Tax.
              </p>
              {form.formState.errors.tax?.label ? (
                <p className="text-caption text-state-error">
                  {form.formState.errors.tax.label.message}
                </p>
              ) : null}
            </div>
          </div>
        </Card>

        <Card className="space-y-s4 p-s6">
          <div className="space-y-s1">
            <h3 className="text-h3">Payment Terms</h3>
            <p className="text-small text-text-muted">
              Choose when customers are expected to pay.
            </p>
          </div>

          <div className="space-y-s1">
            <label
              htmlFor="paymentTerm"
              className="text-small font-medium text-text-primary"
            >
              Default payment term
            </label>
            <Select id="paymentTerm" {...form.register('paymentTerm')}>
              {paymentTermOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            <p className="text-caption text-text-muted">{paymentTermHint}</p>
          </div>
        </Card>

        <div className="flex items-center justify-end gap-s2 border-t border-border pt-s4">
          <Button
            type="button"
            variant="ghost"
            disabled={form.formState.isSubmitting || !savedSettings}
            onClick={() => {
              if (!savedSettings) return;
              form.reset(toDefaults(savedSettings));
            }}
          >
            Reset
          </Button>
          <Button type="submit" disabled={saveDisabled}>
            {form.formState.isSubmitting ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </form>
    </div>
  );
}
