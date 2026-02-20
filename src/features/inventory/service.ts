import type { AdjustInventoryInput, CreateInventoryInput, UpdateInventoryInput } from '@/features/inventory/schema';
import type { InventoryCategory, InventoryItem, InventoryListResponse, StockStatus } from '@/features/inventory/types';
import type { ApiResponse } from '@/types/api';

export type GetInventoryParams = {
  search?: string;
  category?: InventoryCategory;
  stockStatus?: StockStatus;
  sort?: 'default' | 'name_asc' | 'name_desc' | 'quantity_asc' | 'quantity_desc';
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

function toQuery(params: GetInventoryParams): string {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      query.set(key, String(value));
    }
  });

  return query.toString();
}

export async function getInventory(params: GetInventoryParams): Promise<InventoryListResponse> {
  const query = toQuery(params);
  const response = await fetch(`/api/inventory${query ? `?${query}` : ''}`);
  const payload = await readJson<InventoryListResponse>(response);
  return ensureSuccess(payload);
}

export async function createInventoryItem(input: CreateInventoryInput): Promise<InventoryItem> {
  const response = await fetch('/api/inventory', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });

  const payload = await readJson<InventoryItem>(response);
  return ensureSuccess(payload);
}

export async function updateInventoryItem(id: string, input: Omit<UpdateInventoryInput, 'id'>): Promise<InventoryItem> {
  const response = await fetch(`/api/inventory/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });

  const payload = await readJson<InventoryItem>(response);
  return ensureSuccess(payload);
}

export async function deleteInventoryItem(id: string): Promise<InventoryItem> {
  const response = await fetch(`/api/inventory/${id}`, {
    method: 'DELETE'
  });

  const payload = await readJson<InventoryItem>(response);
  return ensureSuccess(payload);
}

export async function adjustInventory(input: AdjustInventoryInput): Promise<InventoryItem> {
  const response = await fetch('/api/inventory/adjust', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });

  const payload = await readJson<InventoryItem>(response);
  return ensureSuccess(payload);
}
