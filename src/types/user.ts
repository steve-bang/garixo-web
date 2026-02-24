export const USER_ROLES = ['owner', 'admin', 'staff', 'user'] as const;

export type UserRole = (typeof USER_ROLES)[number];

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  emailVerifiedAt?: string | null;
  phone?: string;
  avatarUrl?: string;
  garageId?: string;
}
