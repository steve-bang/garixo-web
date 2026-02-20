import { apiClient } from '@/lib/api/client';
import type { User } from '@/features/user/types';
import type { ApiResponse } from '@/types/api';

export async function fetchUsers(): Promise<User[]> {
  const response = await apiClient.get<ApiResponse<User[]>>('/users');

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error ?? 'Failed to fetch users');
  }

  return response.data.data;
}
