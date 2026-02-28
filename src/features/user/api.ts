import { apiClient } from '@/lib/api/client';
import type { ApiResponse } from '@/types/api';
import type { UserListItem } from '@/features/user/types';

export async function fetchUsers(): Promise<UserListItem[]> {
  const response = await apiClient.get<ApiResponse<UserListItem[]>>('/users');

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error ?? 'Failed to fetch users');
  }

  return response.data.data;
}
