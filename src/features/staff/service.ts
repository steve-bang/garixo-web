import type { CreateStaffInput, DeleteStaffInput, UpdateStaffInput } from '@/features/staff/schema';
import type { Staff } from '@/features/staff/types';
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

export async function getStaff(): Promise<Staff[]> {
  const response = await fetch('/api/staff', { method: 'GET' });
  const payload = await readJson<Staff[]>(response);
  return ensureSuccess(payload);
}

export async function createStaff(input: CreateStaffInput): Promise<Staff> {
  const response = await fetch('/api/staff', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });

  const payload = await readJson<Staff>(response);
  return ensureSuccess(payload);
}

export async function updateStaff(input: UpdateStaffInput): Promise<Staff> {
  const response = await fetch('/api/staff', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });

  const payload = await readJson<Staff>(response);
  return ensureSuccess(payload);
}

export async function disableStaff(input: DeleteStaffInput): Promise<Staff> {
  const response = await fetch('/api/staff', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });

  const payload = await readJson<Staff>(response);
  return ensureSuccess(payload);
}
