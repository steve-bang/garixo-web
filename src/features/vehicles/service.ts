import type {
  CreateVehicleInput,
  UpdateVehicleInput
} from '@/features/vehicles/schema';
import type {
  VehicleServiceRecord,
  Vehicle,
  VehicleListResponse,
  VehicleStatus
} from '@/features/vehicles/types';
import type { ApiResponse } from '@/types/api';

export type GetVehiclesParams = {
  search?: string;
  brand?: 'TOYOTA' | 'HONDA' | 'HYUNDAI' | 'FORD' | 'OTHER';
  status?: VehicleStatus;
  customerId?: string;
  page?: number;
  pageSize?: number;
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

function toQuery(params: GetVehiclesParams): string {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      search.set(key, String(value));
    }
  });

  return search.toString();
}

export async function getVehicles(
  params: GetVehiclesParams
): Promise<VehicleListResponse> {
  const query = toQuery(params);
  const response = await fetch(`/api/vehicles${query ? `?${query}` : ''}`);
  const payload = await readJson<VehicleListResponse>(response);
  return ensureSuccess(payload);
}

export async function getVehicleById(id: string): Promise<Vehicle> {
  const response = await fetch(`/api/vehicles/${id}`);
  const payload = await readJson<Vehicle>(response);
  return ensureSuccess(payload);
}

export async function getVehicleServices(
  id: string
): Promise<VehicleServiceRecord[]> {
  const response = await fetch(`/api/vehicles/${id}/services`);
  const payload = await readJson<VehicleServiceRecord[]>(response);
  return ensureSuccess(payload);
}

export async function createVehicle(
  input: CreateVehicleInput
): Promise<Vehicle> {
  const response = await fetch('/api/vehicles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });

  const payload = await readJson<Vehicle>(response);
  return ensureSuccess(payload);
}

export async function updateVehicle(
  id: string,
  input: Omit<UpdateVehicleInput, 'id'>
): Promise<Vehicle> {
  const response = await fetch(`/api/vehicles/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });

  const payload = await readJson<Vehicle>(response);
  return ensureSuccess(payload);
}

export async function deleteVehicle(id: string): Promise<Vehicle> {
  const response = await fetch(`/api/vehicles/${id}`, {
    method: 'DELETE'
  });

  const payload = await readJson<Vehicle>(response);
  return ensureSuccess(payload);
}
