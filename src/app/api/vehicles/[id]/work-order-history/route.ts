import { NextResponse } from 'next/server';

import type { VehicleWorkOrderHistoryRecord } from '@/features/vehicles/types';
import { auth } from '@/lib/auth';
import { getRequestGarageId } from '@/lib/auth/garage-context';
import { findGarageVehicleById } from '@/services/firebase/vehicles-service';
import { listGarageVehicleWorkOrderHistory } from '@/services/firebase/vehicle-work-order-history-service';
import type { ApiResponse } from '@/types/api';

function response<T>(
  payload: ApiResponse<T>,
  status = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(payload, { status });
}

type RouteContext = {
  params: Promise<{ id: string }>;
};

function parseLimit(value: string | null): number {
  if (!value) {
    return 50;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    return 50;
  }

  return Math.min(100, parsed);
}

export async function GET(
  request: Request,
  context: RouteContext
): Promise<NextResponse<ApiResponse<VehicleWorkOrderHistoryRecord[]>>> {
  const session = await auth();
  if (!session?.user?.id) {
    return response({ success: false, error: 'Unauthorized' }, 401);
  }

  const garageId = await getRequestGarageId(session);
  if (!garageId) {
    return response({ success: false, error: 'Garage not found.' }, 404);
  }

  const { id } = await context.params;
  const vehicle = await findGarageVehicleById(garageId, id);

  if (!vehicle) {
    return response({ success: false, error: 'Vehicle not found.' }, 404);
  }

  const url = new URL(request.url);
  const limit = parseLimit(url.searchParams.get('limit'));
  const history = await listGarageVehicleWorkOrderHistory(garageId, id, limit);
  return response({ success: true, data: history });
}
