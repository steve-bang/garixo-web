import type { BillingCycle, PlanCode } from '@/features/billing/types';
import type { ApiResponse } from '@/types/api';

type CreateSubscriptionInput = {
  planCode: PlanCode;
  billingCycle: BillingCycle;
};

export type CreateSubscriptionResult = {
  approveUrl: string;
  subscriptionId: string;
};

type CaptureApprovalInput = {
  subscriptionId: string;
};

export type CaptureApprovalResult = {
  status: 'trialing' | 'active' | 'past_due' | 'cancelled' | 'suspended';
  paypalStatus: string | null;
  subscriptionId: string;
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

export async function createSubscription(
  input: CreateSubscriptionInput
): Promise<CreateSubscriptionResult> {
  const response = await fetch('/api/billing/paypal/create-subscription', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(input)
  });

  const payload = await readJson<CreateSubscriptionResult>(response);
  return ensureSuccess(payload);
}

export async function captureSubscriptionApproval(
  input: CaptureApprovalInput
): Promise<CaptureApprovalResult> {
  const response = await fetch('/api/billing/paypal/capture-approval', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(input)
  });

  const payload = await readJson<CaptureApprovalResult>(response);
  return ensureSuccess(payload);
}
