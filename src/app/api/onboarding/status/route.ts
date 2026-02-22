import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import type { OnboardingState } from '@/features/onboarding/types';
import { getGarageByOwnerId } from '@/services/firebase/garage-service';
import { listGarageWorkOrders } from '@/services/firebase/work-orders-service';
import type { ApiResponse } from '@/types/api';

function json<T>(
  payload: ApiResponse<T>,
  status = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(payload, { status });
}

export async function GET(): Promise<
  NextResponse<ApiResponse<OnboardingState>>
> {
  const session = await auth();
  if (!session?.user?.id) {
    return json({ success: false, error: 'Unauthorized' }, 401);
  }

  const garage = await getGarageByOwnerId(session.user.id);
  const workOrders = garage
    ? (await listGarageWorkOrders(garage.id)).map((order) => ({
        id: order.id,
        customerName: order.customerName,
        licensePlate: order.licensePlate,
        service: order.service,
        notes: order.notes,
        createdAt: order.createdAt
      }))
    : [];

  const state: OnboardingState = {
    garageConfigured: Boolean(garage),
    garage: garage
      ? {
          garageName: garage.name,
          address: garage.address ?? '',
          phone: garage.phone ?? ''
        }
      : undefined,
    workOrders
  };

  return json({ success: true, data: state });
}
