import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import type {
  SetupGarageInput,
  OnboardingState
} from '@/features/onboarding/types';
import { createGarageForOwner } from '@/services/firebase/garage-service';
import type { ApiResponse } from '@/types/api';

function json<T>(
  payload: ApiResponse<T>,
  status = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(payload, { status });
}

export async function POST(
  request: Request
): Promise<NextResponse<ApiResponse<OnboardingState>>> {
  const session = await auth();
  if (!session?.user?.id) {
    return json({ success: false, error: 'Unauthorized' }, 401);
  }

  const body = (await request.json()) as SetupGarageInput;
  if (!body.garageName?.trim()) {
    return json({ success: false, error: 'Garage name is required.' }, 400);
  }

  const garage = await createGarageForOwner({
    ownerId: session.user.id,
    name: body.garageName,
    address: body.address ?? '',
    phone: body.phone ?? '',
    email: session.user.email ?? ''
  });

  const next: OnboardingState = {
    garageConfigured: true,
    garage: {
      garageName: garage.name,
      address: garage.address ?? '',
      phone: garage.phone ?? ''
    },
    workOrders: []
  };

  return json({ success: true, data: next });
}
