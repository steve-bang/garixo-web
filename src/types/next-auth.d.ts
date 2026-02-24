import { DefaultSession } from 'next-auth';
import type { UserRole } from '@/types/user';

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    user: DefaultSession['user'] & {
      id: string;
      role: UserRole;
      garageId?: string;
      emailVerifiedAt?: string | null;
    };
  }

  interface User {
    role: UserRole;
    garageId?: string;
    emailVerifiedAt?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: UserRole;
    accessToken?: string;
    garageId?: string;
    emailVerifiedAt?: string | null;
  }
}
