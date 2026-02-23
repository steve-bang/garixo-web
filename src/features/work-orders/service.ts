import type {
  CancelInput,
  CreateWorkOrderInput,
  PaymentInput,
  UpdateStatusInput,
  UpdateWorkOrderInput
} from '@/features/work-orders/schema';
import type {
  WorkOrder,
  WorkOrdersResponse,
  WorkOrderStatus
} from '@/features/work-orders/types';
import type { ApiResponse } from '@/types/api';

export type GetWorkOrdersParams = {
  search?: string;
  workerId?: string;
  status?: WorkOrderStatus;
  dateFilter?: 'all' | 'today' | 'this_week' | 'this_month' | 'custom';
  dateFrom?: string;
  dateTo?: string;
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

function toQuery(params: GetWorkOrdersParams): string {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      query.set(key, String(value));
    }
  });

  return query.toString();
}

export async function getWorkOrders(
  params: GetWorkOrdersParams
): Promise<WorkOrdersResponse> {
  const query = toQuery(params);
  const response = await fetch(`/api/work-orders${query ? `?${query}` : ''}`);
  const payload = await readJson<WorkOrdersResponse>(response);
  return ensureSuccess(payload);
}

export async function getWorkOrderById(id: string): Promise<WorkOrder> {
  const response = await fetch(`/api/work-orders/${id}`);
  const payload = await readJson<WorkOrder>(response);
  return ensureSuccess(payload);
}

export async function createWorkOrder(
  input: CreateWorkOrderInput
): Promise<WorkOrder> {
  const response = await fetch('/api/work-orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });

  const payload = await readJson<WorkOrder>(response);
  return ensureSuccess(payload);
}

export async function updateWorkOrder(
  id: string,
  input: Omit<UpdateWorkOrderInput, 'id'>
): Promise<WorkOrder> {
  const response = await fetch(`/api/work-orders/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });

  const payload = await readJson<WorkOrder>(response);
  return ensureSuccess(payload);
}

export async function updateWorkOrderStatus(
  id: string,
  input: UpdateStatusInput
): Promise<WorkOrder> {
  const response = await fetch(`/api/work-orders/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });

  const payload = await readJson<WorkOrder>(response);
  return ensureSuccess(payload);
}

export async function payWorkOrder(
  id: string,
  input: PaymentInput
): Promise<WorkOrder> {
  const response = await fetch(`/api/work-orders/${id}/payment`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });

  const payload = await readJson<WorkOrder>(response);
  return ensureSuccess(payload);
}

export async function cancelWorkOrder(
  id: string,
  input: CancelInput
): Promise<WorkOrder> {
  const response = await fetch(`/api/work-orders/${id}/cancel`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });

  const payload = await readJson<WorkOrder>(response);
  return ensureSuccess(payload);
}
