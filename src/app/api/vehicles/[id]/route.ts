import { NextResponse } from 'next/server';

import { vehiclesDB, vehicleServicesDB, findVehicleByNormalizedPlate } from '@/app/api/vehicles/vehicles-db';
import { updateVehicleSchema } from '@/features/vehicles/schema';
import type { Vehicle } from '@/features/vehicles/types';
import { toPlateDisplay } from '@/features/vehicles/utils';
import type { ApiResponse } from '@/types/api';

function response<T>(payload: ApiResponse<T>, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json(payload, { status });
}

type RouteContext = {
  params: Promise<{ id: string }>;
};

function findById(id: string): Vehicle | undefined {
  return vehiclesDB.find((item) => item.id === id);
}

export async function GET(_request: Request, context: RouteContext): Promise<NextResponse<ApiResponse<Vehicle>>> {
  const { id } = await context.params;
  const vehicle = findById(id);

  if (!vehicle) {
    return response({ success: false, error: 'Vehicle not found.' }, 404);
  }

  return response({ success: true, data: vehicle });
}

export async function PUT(request: Request, context: RouteContext): Promise<NextResponse<ApiResponse<Vehicle>>> {
  const { id } = await context.params;
  const current = findById(id);

  if (!current) {
    return response({ success: false, error: 'Vehicle not found.' }, 404);
  }

  const body = await request.json().catch(() => null);
  const parsed = updateVehicleSchema.safeParse({ ...body, id });

  if (!parsed.success) {
    return response({ success: false, error: parsed.error.issues[0]?.message ?? 'Invalid payload.' }, 400);
  }

  if (parsed.data.plateNumber) {
    const duplicate = findVehicleByNormalizedPlate(parsed.data.plateNumber);
    if (duplicate && duplicate.id !== id) {
      return response({ success: false, error: 'Plate number already exists.' }, 409);
    }
  }

  const updated: Vehicle = {
    ...current,
    ...parsed.data,
    id,
    plateNumber: parsed.data.plateNumber ? toPlateDisplay(parsed.data.plateNumber) : current.plateNumber,
    updatedAt: new Date().toISOString()
  };

  const index = vehiclesDB.findIndex((item) => item.id === id);
  vehiclesDB[index] = updated;

  return response({ success: true, data: updated });
}

export async function DELETE(_request: Request, context: RouteContext): Promise<NextResponse<ApiResponse<Vehicle>>> {
  const { id } = await context.params;
  const current = findById(id);

  if (!current) {
    return response({ success: false, error: 'Vehicle not found.' }, 404);
  }

  if (current.totalVisits > 0) {
    return response({ success: false, error: 'Vehicle has service history. Set to Inactive instead.' }, 400);
  }

  const index = vehiclesDB.findIndex((item) => item.id === id);
  vehiclesDB.splice(index, 1);
  delete vehicleServicesDB[id];

  return response({ success: true, data: current });
}
