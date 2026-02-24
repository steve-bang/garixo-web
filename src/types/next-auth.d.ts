import { DefaultSession } from 'next-auth';
import type { UserRole } from '@/types/user';

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    user: DefaultSession['user'] & {
      id: string;
      role: UserRole;
      garageId?: string;
    };
  }

  interface User {
    role: UserRole;
    garageId?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: UserRole;
    accessToken?: string;
    garageId?: string;
  }
}
