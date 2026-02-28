'use client';

import { useQuery } from '@tanstack/react-query';

import { fetchUsers, usersQueryKey } from '@/features/user/api';
import type { UserListItem } from '@/features/user/types';

export type UserKpis = {
  totalUsers: number;
  activeUsers: number;
  verifiedUsers: number;
};

export function useUsers() {
  return useQuery({
    queryKey: usersQueryKey,
    queryFn: fetchUsers
  });
}

/**
 * KPI helper for Users management.
 * In this version, "active" means all users returned for the current garage.
 */
export function toUserKpis(users: UserListItem[]): UserKpis {
  const totalUsers = users.length;
  const verifiedUsers = users.filter((user) =>
    Boolean(user.emailVerifiedAt)
  ).length;

  return {
    totalUsers,
    activeUsers: totalUsers,
    verifiedUsers
  };
}
