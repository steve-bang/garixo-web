import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    user: DefaultSession['user'] & {
      id: string;
      role: 'admin' | 'staff' | 'user';
    };
  }

  interface User {
    role: 'admin' | 'staff' | 'user';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: 'admin' | 'staff' | 'user';
    accessToken?: string;
  }
}
