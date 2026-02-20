import { z } from 'zod';

export const serviceConfigurationFormSchema = z.object({
  name: z.string().trim().min(1, 'Service name is required.'),
  description: z.string().trim().max(300, 'Description must be 300 characters or less.').optional(),
  defaultPrice: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || Number(value) >= 0, 'Price must be 0 or more.'),
  standardTimeMinutes: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || Number(value) >= 0, 'Standard time must be 0 or more.')
});

export type ServiceConfigurationFormValues = z.infer<typeof serviceConfigurationFormSchema>;
