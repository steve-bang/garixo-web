import type {
  GarageSettings,
  UpdateGarageSettingsInput
} from '@/features/settings/garage-information.types';
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

export async function getGarageSettings(): Promise<GarageSettings> {
  const response = await fetch('/api/settings/garage');
  const payload = await readJson<GarageSettings>(response);
  return ensureSuccess(payload);
}

export async function updateGarageSettings(
  input: UpdateGarageSettingsInput
): Promise<GarageSettings> {
  const formData = new FormData();
  formData.set('garageName', input.garageName);
  formData.set('industryType', input.industryType);
  formData.set('phone', input.phone ?? '');
  formData.set('email', input.email ?? '');
  formData.set('address', input.address ?? '');
  formData.set('workingHours', input.workingHours ?? '');
  formData.set('removeLogo', input.removeLogo ? 'true' : 'false');

  if (input.logoFile) {
    formData.set('logoFile', input.logoFile);
  }

  const response = await fetch('/api/settings/garage', {
    method: 'PUT',
    body: formData
  });

  const payload = await readJson<GarageSettings>(response);
  return ensureSuccess(payload);
}
