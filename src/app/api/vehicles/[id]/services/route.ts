import { NextResponse } from 'next/server';

import type { ServiceRecord } from '@/features/vehicles/types';
import { auth } from '@/lib/auth';
import { getRequestGarageId } from '@/lib/auth/garage-context';
import {
  findGarageVehicleById,
  listGarageVehicleServices
} from '@/services/firebase/vehicles-service';
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

export async function GET(
  _request: Request,
  context: RouteContext
): Promise<NextResponse<ApiResponse<ServiceRecord[]>>> {
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

  const services = await listGarageVehicleServices(garageId, id);
  return response({ success: true, data: services });
}
