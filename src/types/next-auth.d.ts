import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    user: DefaultSession['user'] & {
      id: string;
      role: 'owner' | 'admin' | 'staff' | 'user';
    };
  }

  interface User {
    role: 'owner' | 'admin' | 'staff' | 'user';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: 'owner' | 'admin' | 'staff' | 'user';
    accessToken?: string;
  }
}
