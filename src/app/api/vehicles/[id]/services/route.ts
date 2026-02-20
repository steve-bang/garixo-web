import { NextResponse } from 'next/server';

import { vehicleServicesDB, vehiclesDB } from '@/app/api/vehicles/vehicles-db';
import type { ServiceRecord } from '@/features/vehicles/types';
import { latestService } from '@/features/vehicles/utils';
import type { ApiResponse } from '@/types/api';

function response<T>(payload: ApiResponse<T>, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json(payload, { status });
}

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext): Promise<NextResponse<ApiResponse<ServiceRecord[]>>> {
  const { id } = await context.params;
  const vehicle = vehiclesDB.find((item) => item.id === id);

  if (!vehicle) {
    return response({ success: false, error: 'Vehicle not found.' }, 404);
  }

  const services = latestService(vehicleServicesDB[id] ?? []);
  return response({ success: true, data: services });
}
