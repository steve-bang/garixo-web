import type {
  CreateQuickWorkOrderInput,
  OnboardingState,
  QuickWorkOrder,
  SetupGarageInput
} from '@/features/onboarding/types';
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

export async function fetchOnboardingStatus(): Promise<OnboardingState> {
  const response = await fetch('/api/onboarding/status');
  return ensureSuccess(await readJson<OnboardingState>(response));
}

export async function submitGarageSetup(input: SetupGarageInput): Promise<OnboardingState> {
  const response = await fetch('/api/onboarding/setup-garage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
  return ensureSuccess(await readJson<OnboardingState>(response));
}

export async function fetchQuickWorkOrders(): Promise<QuickWorkOrder[]> {
  const response = await fetch('/api/onboarding/work-orders');
  return ensureSuccess(await readJson<QuickWorkOrder[]>(response));
}

export async function createFirstWorkOrder(input: CreateQuickWorkOrderInput): Promise<QuickWorkOrder> {
  const response = await fetch('/api/onboarding/work-orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
  return ensureSuccess(await readJson<QuickWorkOrder>(response));
}
