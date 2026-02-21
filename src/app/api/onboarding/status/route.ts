import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { getOnboardingState } from '@/mocks/onboarding.mock';
import type { OnboardingState } from '@/features/onboarding/types';
import type { ApiResponse } from '@/types/api';

function json<T>(payload: ApiResponse<T>, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json(payload, { status });
}

export async function GET(): Promise<NextResponse<ApiResponse<OnboardingState>>> {
  const session = await auth();
  if (!session?.user?.id) {
    return json({ success: false, error: 'Unauthorized' }, 401);
  }

  const state = await getOnboardingState(session.user.id);
  return json({ success: true, data: state });
}
