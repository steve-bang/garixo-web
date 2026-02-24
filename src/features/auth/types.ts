import type { User, UserRole } from '@/types/user';

export type { UserRole };

export type AuthUser = Pick<User, 'id' | 'email' | 'name' | 'role'> & {
  phone: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  garageName: string;
  email: string;
  password: string;
};

export type ForgotPasswordPayload = {
  identifier: string;
};

export type ResetPasswordPayload = {
  password: string;
  token?: string;
};
