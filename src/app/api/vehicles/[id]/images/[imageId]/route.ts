import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { getRequestGarageId } from '@/lib/auth/garage-context';
import { deleteCdnFile } from '@/services/cdn/firebase-cdn-service';
import {
  findGarageVehicleById,
  removeGarageVehicleImage
} from '@/services/firebase/vehicles-service';
import type { ApiResponse } from '@/types/api';
import type { Vehicle } from '@/features/vehicles/types';

type RouteContext = {
  params: Promise<{ id: string; imageId: string }>;
};

function response<T>(
  payload: ApiResponse<T>,
  status = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(payload, { status });
}

export async function DELETE(
  _request: Request,
  context: RouteContext
): Promise<NextResponse<ApiResponse<Vehicle>>> {
  const session = await auth();
  if (!session?.user?.id) {
    return response({ success: false, error: 'Unauthorized' }, 401);
  }

  const garageId = await getRequestGarageId(session);
  if (!garageId) {
    return response({ success: false, error: 'Garage not found.' }, 404);
  }

  const { id: vehicleId, imageId } = await context.params;
  const vehicle = await findGarageVehicleById(garageId, vehicleId);
  if (!vehicle) {
    return response({ success: false, error: 'Vehicle not found.' }, 404);
  }

  const result = await removeGarageVehicleImage(garageId, vehicleId, imageId);
  if (!result.vehicle) {
    return response({ success: false, error: 'Vehicle not found.' }, 404);
  }

  if (!result.removed) {
    return response({ success: false, error: 'Image not found.' }, 404);
  }

  // Best-effort CDN cleanup: even if delete fails, metadata is already removed.
  try {
    await deleteCdnFile({ filePath: result.removed.path });
  } catch {
    // No-op; stale CDN files can be cleaned up by maintenance tasks.
  }

  return response({ success: true, data: result.vehicle });
}
