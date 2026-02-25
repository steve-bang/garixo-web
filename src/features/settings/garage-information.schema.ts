import { z } from 'zod';
import { garageIndustryTypes } from '@/types/garage';

export const garageInformationSchema = z.object({
  garageName: z.string().trim().min(1, 'Garage name is required.'),
  industryType: z.enum(garageIndustryTypes),
  phone: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) => !value || /^\+?[0-9()\-\s]{8,20}$/.test(value),
      'Please enter a valid phone number.'
    ),
  email: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value),
      'Please enter a valid email address.'
    ),
  address: z.string().trim().optional(),
  workingHours: z.string().trim().optional(),
  logoUrl: z.string().optional()
});

export type GarageInformationFormValues = z.infer<
  typeof garageInformationSchema
>;
