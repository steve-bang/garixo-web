'use client';

import { useQuery } from '@tanstack/react-query';

import { fetchUsers } from '@/features/user/api';

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers
  });
}
