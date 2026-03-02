import { NextResponse } from 'next/server';

import { updateVehicleSchema } from '@/features/vehicles/schema';
import type { Vehicle } from '@/features/vehicles/types';
import { toPlateDisplay } from '@/features/vehicles/utils';
import { auth } from '@/lib/auth';
import { getRequestGarageId } from '@/lib/auth/garage-context';
import { deleteCdnFile } from '@/services/cdn/firebase-cdn-service';
import {
  deleteGarageVehicle,
  findGarageVehicleById,
  findGarageVehicleByNormalizedPlate,
  updateGarageVehicle
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
): Promise<NextResponse<ApiResponse<Vehicle>>> {
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

  return response({ success: true, data: vehicle });
}

export async function PUT(
  request: Request,
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

  const { id } = await context.params;
  const current = await findGarageVehicleById(garageId, id);

  if (!current) {
    return response({ success: false, error: 'Vehicle not found.' }, 404);
  }

  const body = await request.json().catch(() => null);
  const parsed = updateVehicleSchema.safeParse({ ...body, id });

  if (!parsed.success) {
    return response(
      {
        success: false,
        error: parsed.error.issues[0]?.message ?? 'Invalid payload.'
      },
      400
    );
  }

  if (parsed.data.plateNumber) {
    const duplicate = await findGarageVehicleByNormalizedPlate(
      garageId,
      parsed.data.plateNumber
    );
    if (duplicate && duplicate.id !== id) {
      return response(
        { success: false, error: 'Plate number already exists.' },
        409
      );
    }
  }

  const updated = await updateGarageVehicle(garageId, id, {
    ...parsed.data,
    plateNumber: parsed.data.plateNumber
      ? toPlateDisplay(parsed.data.plateNumber)
      : undefined
  });
  if (!updated) {
    return response({ success: false, error: 'Vehicle not found.' }, 404);
  }

  return response({ success: true, data: updated });
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

  const { id } = await context.params;
  const current = await findGarageVehicleById(garageId, id);

  if (!current) {
    return response({ success: false, error: 'Vehicle not found.' }, 404);
  }

  if (current.totalVisits > 0) {
    return response(
      {
        success: false,
        error: 'Vehicle has service history. Set to Inactive instead.'
      },
      400
    );
  }

  const deleted = await deleteGarageVehicle(garageId, id);
  if (!deleted) {
    return response({ success: false, error: 'Vehicle not found.' }, 404);
  }

  // Cleanup linked vehicle photos from CDN after document deletion.
  if (Array.isArray(current.images) && current.images.length > 0) {
    await Promise.all(
      current.images.map(async (image) => {
        try {
          await deleteCdnFile({ filePath: image.path });
        } catch {
          // Best effort cleanup only; metadata is already removed with vehicle.
        }
      })
    );
  }

  return response({ success: true, data: deleted });
}
