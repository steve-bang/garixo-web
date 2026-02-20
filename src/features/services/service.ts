import type { BulkUpdateInput, CreateServiceInput, UpdateServiceInput } from '@/features/services/schema';
import type { Service, ServiceCategory, ServiceListResponse, ServiceStatus } from '@/features/services/types';
import type { ApiResponse } from '@/types/api';

export type GetServicesParams = {
  search?: string;
  category?: ServiceCategory;
  status?: ServiceStatus;
  page?: number;
  pageSize?: number;
  sort?: 'default' | 'name_asc' | 'name_desc' | 'price_asc' | 'price_desc';
};

async function readJson<T>(response: Response): Promise<ApiResponse<T>> {
  return (await response.json()) as ApiResponse<T>;
}

function ensureSuccess<T>(payload: ApiResponse<T>): T {
  if (!payload.success || payload.data === undefined) {
    throw new Error(payload.error ?? 'Request failed');
  }

  return payload.data;
}

function toQuery(params: GetServicesParams): string {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      search.set(key, String(value));
    }
  });

  return search.toString();
}

export async function getServices(params: GetServicesParams): Promise<ServiceListResponse> {
  const query = toQuery(params);
  const response = await fetch(`/api/services${query ? `?${query}` : ''}`, { method: 'GET' });
  const payload = await readJson<ServiceListResponse>(response);
  return ensureSuccess(payload);
}

export async function createService(input: CreateServiceInput): Promise<Service> {
  const response = await fetch('/api/services', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });

  const payload = await readJson<Service>(response);
  return ensureSuccess(payload);
}

export async function updateService(id: string, input: Omit<UpdateServiceInput, 'id'>): Promise<Service> {
  const response = await fetch(`/api/services/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });

  const payload = await readJson<Service>(response);
  return ensureSuccess(payload);
}

export async function deleteService(id: string): Promise<Service> {
  const response = await fetch(`/api/services/${id}`, {
    method: 'DELETE'
  });

  const payload = await readJson<Service>(response);
  return ensureSuccess(payload);
}

export async function bulkUpdateServices(input: BulkUpdateInput): Promise<Service[]> {
  const response = await fetch('/api/services/bulk-update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });

  const payload = await readJson<Service[]>(response);
  return ensureSuccess(payload);
}
