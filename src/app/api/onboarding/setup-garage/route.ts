import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { setupGarage } from '@/mocks/onboarding.mock';
import type { SetupGarageInput, OnboardingState } from '@/features/onboarding/types';
import type { ApiResponse } from '@/types/api';

function json<T>(payload: ApiResponse<T>, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json(payload, { status });
}

export async function POST(request: Request): Promise<NextResponse<ApiResponse<OnboardingState>>> {
  const session = await auth();
  if (!session?.user?.id) {
    return json({ success: false, error: 'Unauthorized' }, 401);
  }

  const body = (await request.json()) as SetupGarageInput;
  if (!body.garageName?.trim()) {
    return json({ success: false, error: 'Garage name is required.' }, 400);
  }

  const next = await setupGarage(session.user.id, {
    garageName: body.garageName,
    address: body.address ?? '',
    phone: body.phone ?? ''
  });

  return json({ success: true, data: next });
}
