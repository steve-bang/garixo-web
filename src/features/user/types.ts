import type { User } from '@/types/user';
export type { User } from '@/types/user';

/**
 * Read model used by the Admin Users management page.
 * Includes lightweight audit fields for read-only visibility.
 */
export type UserListItem = User & {
  createdAt?: string;
  emailVerifiedAt?: string | null;
};
