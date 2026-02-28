import type {
  CreateInvoiceShareInput,
  CreateInvoiceFromWorkOrderInput,
  Invoice,
  InvoiceListResponse,
  InvoiceShareResult,
  PublicInvoiceView,
  SendInvoiceInput,
  UpdateInvoiceInput
} from '@/features/invoices/types';
import type { ApiResponse } from '@/types/api';

export type GetInvoicesParams = {
  search?: string;
  workOrderId?: string;
  page?: number;
  pageSize?: number;
};

export class InvoiceRequestError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'InvoiceRequestError';
    this.status = status;
  }
}

async function readJson<T>(response: Response): Promise<ApiResponse<T>> {
  return (await response.json()) as ApiResponse<T>;
}

function ensureSuccess<T>(payload: ApiResponse<T>, status = 200): T {
  if (!payload.success || payload.data === undefined) {
    throw new InvoiceRequestError(payload.error ?? 'Request failed', status);
  }

  return payload.data;
}

function toQuery(params: GetInvoicesParams): string {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      query.set(key, String(value));
    }
  });

  return query.toString();
}

export async function getInvoices(
  params: GetInvoicesParams = {}
): Promise<InvoiceListResponse> {
  const query = toQuery(params);
  const response = await fetch(`/api/invoices${query ? `?${query}` : ''}`);
  const payload = await readJson<InvoiceListResponse>(response);
  return ensureSuccess(payload, response.status);
}

export async function getInvoiceById(id: string): Promise<Invoice> {
  const response = await fetch(`/api/invoices/${id}`);
  const payload = await readJson<Invoice>(response);
  return ensureSuccess(payload, response.status);
}

export async function createInvoiceFromWorkOrder(
  input: CreateInvoiceFromWorkOrderInput
): Promise<Invoice> {
  const response = await fetch('/api/invoices/from-work-order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(input)
  });

  const payload = await readJson<Invoice>(response);
  return ensureSuccess(payload, response.status);
}

export async function updateInvoice(
  id: string,
  input: UpdateInvoiceInput
): Promise<Invoice> {
  const response = await fetch(`/api/invoices/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(input)
  });

  const payload = await readJson<Invoice>(response);
  return ensureSuccess(payload, response.status);
}

export async function sendInvoice(
  id: string,
  input: SendInvoiceInput = {}
): Promise<{ sentAt: string; sentCount: number }> {
  const response = await fetch(`/api/invoices/${id}/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(input)
  });

  const payload = await readJson<{ sentAt: string; sentCount: number }>(
    response
  );
  return ensureSuccess(payload, response.status);
}

export async function createInvoiceShare(
  id: string,
  input: CreateInvoiceShareInput = {}
): Promise<InvoiceShareResult> {
  const response = await fetch(`/api/invoices/${id}/share`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(input)
  });

  const payload = await readJson<InvoiceShareResult>(response);
  return ensureSuccess(payload, response.status);
}

export async function getCurrentInvoiceShare(
  id: string
): Promise<InvoiceShareResult | null> {
  const response = await fetch(`/api/invoices/${id}/share/current`, {
    cache: 'no-store'
  });

  const payload = await readJson<InvoiceShareResult | null>(response);
  return ensureSuccess(payload, response.status);
}

export async function revokeInvoiceShare(
  id: string
): Promise<{ revoked: number }> {
  const response = await fetch(`/api/invoices/${id}/share/revoke`, {
    method: 'POST'
  });

  const payload = await readJson<{ revoked: number }>(response);
  return ensureSuccess(payload, response.status);
}

export async function getPublicInvoiceByToken(
  token: string
): Promise<PublicInvoiceView> {
  const response = await fetch(`/api/public/invoices/${token}`, {
    cache: 'no-store'
  });
  const payload = await readJson<PublicInvoiceView>(response);
  return ensureSuccess(payload, response.status);
}
