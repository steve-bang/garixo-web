import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import type { ServiceConfigurationItem } from '@/features/settings/service-configuration.types';
import { getRequestGarageId } from '@/lib/auth/garage-context';
import {
  deleteGarageService,
  listGarageServices,
  updateGarageService
} from '@/services/firebase/settings-services-service';
import type { ApiResponse } from '@/types/api';

function response<T>(
  payload: ApiResponse<T>,
  status = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(payload, { status });
}

function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

type Params = { params: Promise<{ id: string }> };

export async function PUT(
  request: Request,
  { params }: Params
): Promise<NextResponse<ApiResponse<ServiceConfigurationItem>>> {
  const session = await auth();
  if (!session?.user?.id)
    return response({ success: false, error: 'Unauthorized' }, 401);

  const { id } = await params;
  const garageId = await getRequestGarageId(session);
  if (!garageId)
    return response({ success: false, error: 'Garage not found.' }, 404);

  const body = (await request.json()) as {
    name?: string;
    description?: string;
    defaultPrice?: number | null;
    standardTimeMinutes?: number | null;
  };

  const name = String(body.name ?? '').trim();
  const description = String(body.description ?? '').trim();
  const defaultPrice = body.defaultPrice ?? null;
  const standardTimeMinutes = body.standardTimeMinutes ?? null;

  if (!name) {
    return response(
      { success: false, error: 'Service name is required.' },
      400
    );
  }

  if ((defaultPrice ?? 0) < 0 || (standardTimeMinutes ?? 0) < 0) {
    return response(
      { success: false, error: 'Price and standard time must be 0 or more.' },
      400
    );
  }

  const services = await listGarageServices(garageId);
  const duplicate = services.some(
    (item) => item.id !== id && normalizeName(item.name) === normalizeName(name)
  );
  if (duplicate) {
    return response(
      { success: false, error: 'Service name must be unique.' },
      409
    );
  }

  const updated = await updateGarageService(garageId, id, {
    name,
    description,
    defaultPrice,
    standardDuration: standardTimeMinutes
  });

  return response({
    success: true,
    data: {
      id: updated.id,
      name: updated.name,
      description: updated.description,
      defaultPrice: updated.defaultPrice,
      standardTimeMinutes: updated.standardDuration,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt
    }
  });
}

export async function DELETE(
  _: Request,
  { params }: Params
): Promise<NextResponse<ApiResponse<{ id: string }>>> {
  const session = await auth();
  if (!session?.user?.id)
    return response({ success: false, error: 'Unauthorized' }, 401);

  const { id } = await params;
  const garageId = await getRequestGarageId(session);
  if (!garageId)
    return response({ success: false, error: 'Garage not found.' }, 404);
  await deleteGarageService(garageId, id);

  return response({ success: true, data: { id } });
}
