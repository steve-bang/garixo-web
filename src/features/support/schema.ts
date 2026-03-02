import { z } from 'zod';

export const supportTicketTypeSchema = z.enum([
  'problem',
  'question',
  'feature'
]);
export const supportTicketStatusSchema = z.enum(['open', 'resolved']);
export const supportTicketDateFilterSchema = z.enum([
  'all',
  'today',
  '7d',
  '30d'
]);

export const createSupportTicketSchema = z.object({
  shortDescription: z
    .string()
    .trim()
    .min(3, 'Please enter a short description.')
    .max(120, 'Short description is too long.'),
  message: z
    .string()
    .trim()
    .min(10, 'Please add more details so we can help faster.')
    .max(5000, 'Message is too long.'),
  type: supportTicketTypeSchema.optional()
});

export type CreateSupportTicketInput = z.infer<
  typeof createSupportTicketSchema
>;

export const adminSupportTicketsQuerySchema = z.object({
  status: supportTicketStatusSchema.optional(),
  type: supportTicketTypeSchema.optional(),
  date: supportTicketDateFilterSchema.default('all'),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20)
});

export type AdminSupportTicketsQueryInput = z.infer<
  typeof adminSupportTicketsQuerySchema
>;

export const adminUpdateSupportTicketStatusSchema = z.object({
  status: supportTicketStatusSchema
});

export type AdminUpdateSupportTicketStatusInput = z.infer<
  typeof adminUpdateSupportTicketStatusSchema
>;
