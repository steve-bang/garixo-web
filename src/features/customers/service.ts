import type { CreateCustomerInput, UpdateCustomerInput } from '@/features/customers/schema';
import type {
  Customer,
  CustomerDetailResponse,
  CustomerListResponse,
  CustomerStatus,
  SpendingTier
} from '@/features/customers/types';
import type { ApiResponse } from '@/types/api';

export type GetCustomersParams = {
  search?: string;
  status?: CustomerStatus;
  spendingTier?: SpendingTier;
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

function toQuery(params: GetCustomersParams): string {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      search.set(key, String(value));
    }
  });

  return search.toString();
}

export async function getCustomers(params: GetCustomersParams): Promise<CustomerListResponse> {
  const query = toQuery(params);
  const response = await fetch(`/api/customers${query ? `?${query}` : ''}`, { method: 'GET' });
  const payload = await readJson<CustomerListResponse>(response);
  return ensureSuccess(payload);
}

export async function getCustomerById(id: string): Promise<CustomerDetailResponse> {
  const response = await fetch(`/api/customers/${id}`, { method: 'GET' });
  const payload = await readJson<CustomerDetailResponse>(response);
  return ensureSuccess(payload);
}

export async function createCustomer(input: CreateCustomerInput): Promise<Customer> {
  const response = await fetch('/api/customers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });

  const payload = await readJson<Customer>(response);
  return ensureSuccess(payload);
}

export async function updateCustomer(id: string, input: Omit<UpdateCustomerInput, 'id'>): Promise<Customer> {
  const response = await fetch(`/api/customers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });

  const payload = await readJson<Customer>(response);
  return ensureSuccess(payload);
}

export async function deleteCustomer(id: string): Promise<Customer> {
  const response = await fetch(`/api/customers/${id}`, {
    method: 'DELETE'
  });

  const payload = await readJson<Customer>(response);
  return ensureSuccess(payload);
}
