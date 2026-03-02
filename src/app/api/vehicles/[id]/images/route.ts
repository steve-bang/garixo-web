import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { getRequestGarageId } from '@/lib/auth/garage-context';
import {
  CdnValidationError,
  deleteCdnFile,
  uploadGarageVehicleImageToCdn
} from '@/services/cdn/firebase-cdn-service';
import {
  addGarageVehicleImage,
  findGarageVehicleById
} from '@/services/firebase/vehicles-service';
import type { ApiResponse } from '@/types/api';
import type { Vehicle } from '@/features/vehicles/types';

type RouteContext = {
  params: Promise<{ id: string }>;
};

function response<T>(
  payload: ApiResponse<T>,
  status = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(payload, { status });
}

export async function POST(
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

  const { id: vehicleId } = await context.params;
  const vehicle = await findGarageVehicleById(garageId, vehicleId);
  if (!vehicle) {
    return response({ success: false, error: 'Vehicle not found.' }, 404);
  }

  const contentType = request.headers.get('content-type') ?? '';
  if (!contentType.includes('multipart/form-data')) {
    return response({ success: false, error: 'Invalid upload payload.' }, 400);
  }

  const formData = await request.formData();
  const imageFile = formData.get('file');
  if (!(imageFile instanceof File)) {
    return response(
      { success: false, error: 'Please choose an image file.' },
      400
    );
  }

  try {
    // Upload first and keep returned storage path so we can reference/delete later.
    const uploaded = await uploadGarageVehicleImageToCdn({
      garageId,
      vehicleId,
      file: imageFile
    });

    const updated = await addGarageVehicleImage(garageId, vehicleId, {
      id: randomUUID(),
      url: uploaded.url,
      path: uploaded.path,
      name: uploaded.name,
      contentType: uploaded.contentType,
      size: uploaded.size,
      uploadedByUserId: session.user.id,
      uploadedAt: new Date().toISOString()
    });

    if (!updated) {
      // Vehicle no longer exists after upload; cleanup just-uploaded CDN object.
      await deleteCdnFile({ filePath: uploaded.path });
      return response({ success: false, error: 'Vehicle not found.' }, 404);
    }

    return response({ success: true, data: updated });
  } catch (error) {
    if (error instanceof CdnValidationError) {
      return response({ success: false, error: error.message }, 400);
    }

    if (error instanceof Error) {
      if (error.message.includes('up to 10 images')) {
        return response({ success: false, error: error.message }, 400);
      }
    }

    return response(
      { success: false, error: 'Could not upload vehicle image right now.' },
      500
    );
  }
}
