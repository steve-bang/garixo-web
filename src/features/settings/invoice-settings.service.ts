import type {
  InvoiceSettings,
  UpdateInvoiceSettingsInput
} from '@/features/settings/invoice-settings.types';
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

export async function getInvoiceSettings(): Promise<InvoiceSettings> {
  const response = await fetch('/api/settings/invoice');
  const payload = await readJson<InvoiceSettings>(response);
  return ensureSuccess(payload);
}

export async function updateInvoiceSettings(
  input: UpdateInvoiceSettingsInput
): Promise<InvoiceSettings> {
  const response = await fetch('/api/settings/invoice', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(input)
  });

  const payload = await readJson<InvoiceSettings>(response);
  return ensureSuccess(payload);
}
