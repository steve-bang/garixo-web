import { z } from 'zod';

export const inventoryCategorySchema = z.enum(['ENGINE', 'OIL', 'TIRE', 'BRAKE', 'ELECTRICAL']);
export const stockStatusSchema = z.enum(['IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK']);

export const inventoryItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  sku: z.string().optional(),
  category: inventoryCategorySchema,
  quantity: z.number().int().min(0),
  minLevel: z.number().int().min(0),
  costPrice: z.number().min(0),
  notes: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string()
});

export const inventoryListQuerySchema = z.object({
  search: z.string().optional(),
  category: inventoryCategorySchema.optional(),
  stockStatus: stockStatusSchema.optional(),
  sort: z.enum(['default', 'name_asc', 'name_desc', 'quantity_asc', 'quantity_desc']).default('default'),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20)
});

export const createInventorySchema = z.object({
  name: z.string().trim().min(1, 'Item name is required.'),
  sku: z.string().trim().optional(),
  category: inventoryCategorySchema,
  quantity: z.coerce.number().int().min(0, 'Quantity must be 0 or greater.'),
  minLevel: z.coerce.number().int().min(0, 'Minimum level must be 0 or greater.'),
  costPrice: z.coerce.number().min(0, 'Cost price must be 0 or greater.'),
  notes: z.string().trim().optional()
});

export const updateInventorySchema = createInventorySchema.partial().extend({
  id: z.string().min(1)
});

export const adjustInventorySchema = z.object({
  id: z.string().min(1),
  type: z.enum(['ADD', 'REDUCE']),
  amount: z.coerce.number().int().positive('Amount must be greater than 0.'),
  reason: z.string().trim().optional()
});

export type CreateInventoryInput = z.infer<typeof createInventorySchema>;
export type UpdateInventoryInput = z.infer<typeof updateInventorySchema>;
export type AdjustInventoryInput = z.infer<typeof adjustInventorySchema>;
export type InventoryListQueryInput = z.infer<typeof inventoryListQuerySchema>;
