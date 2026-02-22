export type UserRole = 'admin' | 'staff' | 'user';

export type AuthUser = {
  id: string;
  email: string;
  phone: string;
  name: string;
  role: UserRole;
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
