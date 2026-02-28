import { z } from 'zod';

import { invoicePaymentTerms } from '@/features/settings/invoice-settings.types';

export const invoiceSettingsSchema = z.object({
  tax: z.object({
    enabled: z.boolean(),
    rate: z
      .number({ invalid_type_error: 'Tax rate must be a number.' })
      .min(0, 'Tax rate must be at least 0%.')
      .max(100, 'Tax rate cannot exceed 100%.'),
    label: z
      .string()
      .trim()
      .min(1, 'Tax label is required.')
      .max(40, 'Tax label must be 40 characters or less.')
  }),
  paymentTerm: z.enum(invoicePaymentTerms)
});

export type InvoiceSettingsFormValues = z.infer<typeof invoiceSettingsSchema>;
