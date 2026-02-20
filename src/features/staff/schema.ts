import { z } from 'zod';

export const roleSchema = z.enum(['OWNER', 'MANAGER', 'STAFF']);
export const staffStatusSchema = z.enum(['ACTIVE', 'ON_LEAVE', 'INACTIVE']);

export const staffSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  phone: z.string(),
  email: z.string().email().optional(),
  avatar: z.string().optional(),
  role: roleSchema,
  status: staffStatusSchema,
  currentJobs: z.number().int().nonnegative(),
  branchId: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string()
});

export const createStaffSchema = z.object({
  fullName: z.string().trim().min(1, 'Name is required'),
  phone: z
    .string()
    .trim()
    .min(8, 'Phone is required')
    .max(15, 'Phone is invalid')
    .regex(/^\d+$/, 'Phone must contain only numbers'),
  email: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || z.string().email().safeParse(value).success, 'Invalid email format.'),
  avatar: z.string().optional(),
  role: roleSchema,
  currentJobs: z.number().int().nonnegative().optional(),
  status: staffStatusSchema.optional(),
  branchId: z.string().optional()
});

export const updateStaffSchema = z.object({
  id: z.string().min(1),
  fullName: z.string().trim().min(1, 'Name is required').optional(),
  phone: z
    .string()
    .trim()
    .min(8, 'Phone is required')
    .max(15, 'Phone is invalid')
    .regex(/^\d+$/, 'Phone must contain only numbers')
    .optional(),
  email: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || z.string().email().safeParse(value).success, 'Invalid email format.'),
  avatar: z.string().optional(),
  role: roleSchema.optional(),
  status: staffStatusSchema.optional(),
  currentJobs: z.number().int().nonnegative().optional(),
  branchId: z.string().optional()
});

export const deleteStaffSchema = z.object({
  id: z.string().min(1)
});

export type CreateStaffInput = z.infer<typeof createStaffSchema>;
export type UpdateStaffInput = z.infer<typeof updateStaffSchema>;
export type DeleteStaffInput = z.infer<typeof deleteStaffSchema>;
