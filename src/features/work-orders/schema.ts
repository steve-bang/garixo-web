import { z } from 'zod';

export const workOrderStatusSchema = z.enum([
  'ASSIGNED',
  'IN_PROGRESS',
  'WAITING_PARTS',
  'READY_FOR_PAYMENT',
  'COMPLETED',
  'CANCELLED'
]);

export const priorityLevelSchema = z.enum(['NORMAL', 'HIGH', 'URGENT']);

export const paymentMethodSchema = z.enum(['CASH', 'BANK_TRANSFER', 'QR']);

export const orderServiceSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number().min(0)
});

export const orderPartSchema = z.object({
  id: z.string(),
  partName: z.string(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().min(0)
});

export const timelineEventSchema = z.object({
  status: workOrderStatusSchema,
  timestamp: z.string()
});

export const workOrdersQuerySchema = z.object({
  search: z.string().optional(),
  workerId: z.string().optional(),
  status: workOrderStatusSchema.optional(),
  dateFilter: z.enum(['all', 'today', 'this_week', 'custom']).default('all'),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20)
});

export const createWorkOrderSchema = z.object({
  plateNumber: z.string().trim().min(1, 'Plate number is required.'),
  customerName: z.string().trim().min(1, 'Customer name is required.'),
  customerPhone: z.string().trim().min(9, 'Customer phone is required.'),
  services: z.array(orderServiceSchema).min(1, 'At least one service is required.'),
  parts: z.array(orderPartSchema).default([]),
  workerId: z.string().optional(),
  workerName: z.string().optional(),
  priority: priorityLevelSchema.default('NORMAL'),
  estimatedTimeMinutes: z.coerce.number().int().positive().optional(),
  notes: z.string().trim().optional()
});

export const updateWorkOrderSchema = createWorkOrderSchema.partial().extend({
  id: z.string().min(1)
});

export const updateStatusSchema = z.object({
  status: workOrderStatusSchema
});

export const paymentSchema = z.object({
  method: paymentMethodSchema
});

export const cancelSchema = z.object({
  reason: z.string().trim().min(1, 'Cancellation reason is required.')
});

export type CreateWorkOrderInput = z.infer<typeof createWorkOrderSchema>;
export type UpdateWorkOrderInput = z.infer<typeof updateWorkOrderSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
export type PaymentInput = z.infer<typeof paymentSchema>;
export type CancelInput = z.infer<typeof cancelSchema>;
