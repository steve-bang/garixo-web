import { z } from 'zod';

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(['admin', 'staff', 'user'])
});

export const usersSchema = z.array(userSchema);
