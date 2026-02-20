import type {
  ServiceConfigurationItem,
  UpsertServiceConfigurationInput
} from '@/features/settings/service-configuration.types';
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

export async function getSettingServices(): Promise<ServiceConfigurationItem[]> {
  const response = await fetch('/api/settings/services');
  const payload = await readJson<ServiceConfigurationItem[]>(response);
  return ensureSuccess(payload);
}

export async function createSettingService(input: UpsertServiceConfigurationInput): Promise<ServiceConfigurationItem> {
  const response = await fetch('/api/settings/services', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
  const payload = await readJson<ServiceConfigurationItem>(response);
  return ensureSuccess(payload);
}

export async function updateSettingService(id: string, input: UpsertServiceConfigurationInput): Promise<ServiceConfigurationItem> {
  const response = await fetch(`/api/settings/services/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
  const payload = await readJson<ServiceConfigurationItem>(response);
  return ensureSuccess(payload);
}

export async function deleteSettingService(id: string): Promise<{ id: string }> {
  const response = await fetch(`/api/settings/services/${id}`, {
    method: 'DELETE'
  });
  const payload = await readJson<{ id: string }>(response);
  return ensureSuccess(payload);
}
