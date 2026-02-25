import { z } from 'zod';
import {
  SERVICE_CATEGORY_VALUES,
  SERVICE_STATUS_VALUES
} from '@/features/services/types';

export const serviceStatusSchema = z.enum(SERVICE_STATUS_VALUES);
export const serviceCategorySchema = z.enum(SERVICE_CATEGORY_VALUES);

export const serviceSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: serviceCategorySchema,
  price: z.number(),
  estimatedTime: z.string(),
  description: z.string().optional(),
  status: serviceStatusSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
  usedInWorkOrder: z.boolean().optional()
});

export const serviceListQuerySchema = z.object({
  search: z.string().optional(),
  category: serviceCategorySchema.optional(),
  status: serviceStatusSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
  sort: z
    .enum(['default', 'name_asc', 'name_desc', 'price_asc', 'price_desc'])
    .default('default')
});

export const createServiceSchema = z.object({
  name: z.string().trim().min(1, 'Service name is required.'),
  category: serviceCategorySchema,
  price: z.coerce.number().positive('Price must be greater than 0.'),
  estimatedTime: z
    .string()
    .trim()
    .min(1, 'Estimated time is required.')
    .regex(
      /^(\d+\s?(minutes?|hours?)|\d+\s?-\s?\d+\s?hours?)$/i,
      'Use format like "30 minutes" or "2-3 hours".'
    ),
  description: z.string().trim().optional(),
  status: serviceStatusSchema.default('ACTIVE'),
  usedInWorkOrder: z.boolean().optional()
});

export const updateServiceSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1, 'Service name is required.').optional(),
  category: serviceCategorySchema.optional(),
  price: z.coerce.number().positive('Price must be greater than 0.').optional(),
  estimatedTime: z
    .string()
    .trim()
    .regex(
      /^(\d+\s?(minutes?|hours?)|\d+\s?-\s?\d+\s?hours?)$/i,
      'Use format like "30 minutes" or "2-3 hours".'
    )
    .optional(),
  description: z.string().trim().optional(),
  status: serviceStatusSchema.optional()
});

export const bulkUpdateSchema = z.object({
  percentage: z.coerce.number().min(-100).max(500)
});

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
export type ServiceListQueryInput = z.infer<typeof serviceListQuerySchema>;
export type BulkUpdateInput = z.infer<typeof bulkUpdateSchema>;
