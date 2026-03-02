import type { ApiResponse } from '@/types/api';
import type {
  AdminSupportTicketsQuery,
  SupportTicket,
  SupportTicketListResponse
} from '@/features/support/types';
import type { CreateSupportTicketInput } from '@/features/support/schema';

export class SupportRequestError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'SupportRequestError';
    this.status = status;
  }
}

async function readJson<T>(response: Response): Promise<ApiResponse<T>> {
  return (await response.json()) as ApiResponse<T>;
}

function ensureSuccess<T>(payload: ApiResponse<T>, status = 200): T {
  if (!payload.success || payload.data === undefined) {
    throw new SupportRequestError(payload.error ?? 'Request failed', status);
  }

  return payload.data;
}

export async function getSupportTickets(limit = 10): Promise<SupportTicket[]> {
  const response = await fetch(`/api/support/tickets?limit=${limit}`);
  const payload = await readJson<SupportTicket[]>(response);
  return ensureSuccess(payload, response.status);
}

export async function createSupportTicket(
  input: CreateSupportTicketInput & { screenshotFile?: File | null }
): Promise<SupportTicket> {
  const formData = new FormData();
  formData.append('shortDescription', input.shortDescription);
  formData.append('message', input.message);

  if (input.type) {
    formData.append('type', input.type);
  }

  if (input.screenshotFile) {
    formData.append('screenshot', input.screenshotFile);
  }

  const response = await fetch('/api/support/tickets', {
    method: 'POST',
    body: formData
  });
  const payload = await readJson<SupportTicket>(response);
  return ensureSuccess(payload, response.status);
}

function toQuery(params: AdminSupportTicketsQuery): string {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    const isEmptyString = typeof value === 'string' && value.trim() === '';
    if (value !== undefined && value !== null && !isEmptyString) {
      query.set(key, String(value));
    }
  });

  return query.toString();
}

export async function getAdminSupportTickets(
  params: AdminSupportTicketsQuery
): Promise<SupportTicketListResponse> {
  const query = toQuery(params);
  const response = await fetch(
    `/api/support/admin/tickets${query ? `?${query}` : ''}`
  );
  const payload = await readJson<SupportTicketListResponse>(response);
  return ensureSuccess(payload, response.status);
}

export async function getAdminSupportTicket(
  garageId: string,
  ticketId: string
): Promise<SupportTicket> {
  const response = await fetch(
    `/api/support/admin/tickets/${garageId}/${ticketId}`
  );
  const payload = await readJson<SupportTicket>(response);
  return ensureSuccess(payload, response.status);
}

export async function updateAdminSupportTicketStatus(
  garageId: string,
  ticketId: string,
  status: SupportTicket['status']
): Promise<SupportTicket> {
  const response = await fetch(
    `/api/support/admin/tickets/${garageId}/${ticketId}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    }
  );
  const payload = await readJson<SupportTicket>(response);
  return ensureSuccess(payload, response.status);
}
