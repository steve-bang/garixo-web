import type { UserListItem } from '@/features/user/types';
import type { ApiResponse } from '@/types/api';

async function readJson<T>(response: Response): Promise<ApiResponse<T>> {
  return (await response.json()) as ApiResponse<T>;
}

function ensureSuccess<T>(payload: ApiResponse<T>): T {
  if (!payload.success || payload.data === undefined) {
    throw new Error(payload.error ?? 'Request failed');
  }

  return payload.data;
}

export async function getUsers(): Promise<UserListItem[]> {
  const response = await fetch('/api/users');
  const payload = await readJson<UserListItem[]>(response);
  return ensureSuccess(payload);
}
