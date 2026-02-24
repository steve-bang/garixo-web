import { z } from 'zod';
import { USER_ROLES } from '@/types/user';

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(USER_ROLES)
});

export const usersSchema = z.array(userSchema);
