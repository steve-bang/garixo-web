import { z } from 'zod';

export const vehicleStatusSchema = z.enum([
  'ACTIVE',
  'IN_SERVICE',
  'COMPLETED',
  'OVERDUE',
  'INACTIVE'
]);

export const serviceStatusSchema = z.enum(['OPEN', 'DONE']);

export const vehicleSchema = z.object({
  id: z.string(),
  plateNumber: z.string(),
  brand: z.string().optional(),
  model: z.string().optional(),
  year: z.number().int().optional(),
  color: z.string().optional(),
  vin: z.string().optional(),
  customerId: z.string(),
  customerName: z.string(),
  customerPhone: z.string(),
  status: vehicleStatusSchema,
  totalVisits: z.number().int().min(0),
  totalSpent: z.number().min(0),
  lastServiceDate: z.string().optional(),
  notes: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string()
});

export const serviceRecordSchema = z.object({
  id: z.string(),
  vehicleId: z.string(),
  date: z.string(),
  serviceName: z.string(),
  amount: z.number().min(0),
  status: serviceStatusSchema
});

export const vehiclesListQuerySchema = z.object({
  search: z.string().optional(),
  brand: z.enum(['TOYOTA', 'HONDA', 'HYUNDAI', 'FORD', 'OTHER']).optional(),
  status: vehicleStatusSchema.optional(),
  customerId: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20)
});

export const createVehicleSchema = z.object({
  plateNumber: z.string().trim().min(1, 'Plate number is required.'),
  brand: z.string().trim().optional(),
  model: z.string().trim().optional(),
  year: z.coerce.number().int().min(1900).max(2100).optional(),
  color: z.string().trim().optional(),
  vin: z.string().trim().optional(),
  customerId: z.string().trim().min(1, 'Customer is required.'),
  customerName: z.string().trim().min(1, 'Customer is required.'),
  customerPhone: z.string().trim().min(9, 'Customer phone is required.'),
  status: vehicleStatusSchema.default('ACTIVE'),
  notes: z.string().trim().optional()
});

export const updateVehicleSchema = createVehicleSchema.partial().extend({
  id: z.string().min(1)
});

export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;
export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>;
export type VehiclesListQueryInput = z.infer<typeof vehiclesListQuerySchema>;
