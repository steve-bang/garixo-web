import { z } from 'zod';

import { getSpendingTier } from '@/features/customers/utils';

export const customerStatusSchema = z.enum(['ACTIVE', 'INACTIVE', 'VIP']);
export const spendingTierSchema = z.enum(['LOW', 'MEDIUM', 'HIGH']);

export const vehicleSchema = z.object({
  id: z.string(),
  plate: z.string(),
  brand: z.string(),
  lastServiceDate: z.string().optional()
});

export const serviceRecordSchema = z.object({
  id: z.string(),
  date: z.string(),
  vehiclePlate: z.string(),
  serviceName: z.string(),
  amount: z.number()
});

export const customerSchema = z.object({
  id: z.string(),
  name: z.string(),
  phone: z.string(),
  email: z.string().optional(),
  address: z.string().optional(),
  status: customerStatusSchema,
  vehicles: z.array(vehicleSchema),
  totalVisits: z.number(),
  totalSpent: z.number(),
  lastVisit: z.string().optional(),
  notes: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string()
});

export const customerListQuerySchema = z.object({
  search: z.string().optional(),
  status: customerStatusSchema.optional(),
  spendingTier: spendingTierSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20)
});

export const createCustomerSchema = z.object({
  name: z.string().trim().min(1, 'Name is required.'),
  phone: z
    .string()
    .trim()
    .min(9, 'Phone must be at least 9 digits.')
    .regex(/^\+?[\d\s-]+$/, 'Invalid phone format.'),
  email: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || z.string().email().safeParse(value).success, 'Invalid email format.'),
  address: z.string().trim().optional(),
  notes: z.string().trim().optional(),
  status: customerStatusSchema.default('ACTIVE')
});

export const updateCustomerSchema = createCustomerSchema.partial().extend({
  id: z.string().min(1)
});

export function matchesSpendingTier(totalSpent: number, tier?: 'LOW' | 'MEDIUM' | 'HIGH'): boolean {
  if (!tier) {
    return true;
  }

  return getSpendingTier(totalSpent) === tier;
}

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
