import { z } from 'zod';

export const invoicePaymentTermSchema = z.enum([
  'DUE_ON_RECEIPT',
  'NET_7',
  'NET_15',
  'NET_30'
]);

export const invoiceLineItemTypeSchema = z.enum(['service', 'part', 'custom']);

export const invoiceLineItemSchema = z.object({
  key: z.string().trim().min(1),
  type: invoiceLineItemTypeSchema,
  name: z.string().trim().min(1, 'Item name is required.'),
  quantity: z.number().positive('Quantity must be greater than 0.'),
  unitPrice: z.number().min(0, 'Unit price must be 0 or more.'),
  amount: z.number().min(0, 'Amount must be 0 or more.')
});

export const createInvoiceFromWorkOrderSchema = z.object({
  workOrderId: z.string().trim().min(1, 'Work order is required.')
});

export const updateInvoiceSchema = z.object({
  dueDate: z.string().datetime('Due date is invalid.'),
  paymentTerm: invoicePaymentTermSchema,
  notes: z.string().trim().max(2000).optional(),
  tax: z.object({
    enabled: z.boolean(),
    rate: z.number().min(0).max(100),
    label: z.string().trim().min(1).max(40)
  }),
  lineItems: z
    .array(invoiceLineItemSchema)
    .min(1, 'At least one line item is required.')
});

export const sendInvoiceSchema = z.object({
  recipientEmail: z.string().email().optional()
});

export const createInvoiceShareSchema = z.object({
  expiresInDays: z.number().int().min(1).max(365).optional()
});

export const invoicesQuerySchema = z.object({
  search: z.string().optional(),
  workOrderId: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20)
});

export type CreateInvoiceFromWorkOrderSchema = z.infer<
  typeof createInvoiceFromWorkOrderSchema
>;
export type UpdateInvoiceSchema = z.infer<typeof updateInvoiceSchema>;
export type SendInvoiceSchema = z.infer<typeof sendInvoiceSchema>;
export type CreateInvoiceShareSchema = z.infer<typeof createInvoiceShareSchema>;
export type InvoicesQuerySchema = z.infer<typeof invoicesQuerySchema>;
