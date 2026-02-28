import { z } from 'zod';
import { USER_ROLES } from '@/types/user';

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(USER_ROLES),
  createdAt: z.string().optional(),
  emailVerifiedAt: z.string().nullable().optional()
});

export const usersSchema = z.array(userSchema);
