import { apiClient } from '@/lib/api/client';
import type { ApiResponse } from '@/types/api';
import { User } from '@/types/user';

export async function fetchUsers(): Promise<User[]> {
  const response = await apiClient.get<ApiResponse<User[]>>('/users');

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error ?? 'Failed to fetch users');
  }

  return response.data.data;
}
