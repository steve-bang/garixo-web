import { NextResponse } from 'next/server';

import {
  deleteGarageService,
  findGarageServiceById,
  hasDuplicateServiceName,
  isServiceUsedInWorkOrders,
  updateGarageService
} from '@/app/api/services/services-db';
import { updateServiceSchema } from '@/features/services/schema';
import type { Service } from '@/features/services/types';
import { auth } from '@/lib/auth';
import { getGarageByOwnerId } from '@/services/firebase/garage-service';
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

export async function PUT(
  request: Request,
  context: RouteContext
): Promise<NextResponse<ApiResponse<Service>>> {
  const session = await auth();
  if (!session?.user?.id) {
    return response({ success: false, error: 'Unauthorized' }, 401);
  }

  const garage = await getGarageByOwnerId(session.user.id);
  if (!garage) {
    return response({ success: false, error: 'Garage not found.' }, 404);
  }

  const { id } = await context.params;
  const existing = await findGarageServiceById(garage.id, id);

  if (!existing) {
    return response({ success: false, error: 'Service not found.' }, 404);
  }

  const body = await request.json().catch(() => null);
  const parsed = updateServiceSchema.safeParse({ ...body, id });

  if (!parsed.success) {
    return response(
      {
        success: false,
        error: parsed.error.issues[0]?.message ?? 'Invalid payload.'
      },
      400
    );
  }

  const duplicate =
    parsed.data.name &&
    (await hasDuplicateServiceName(garage.id, parsed.data.name, id));

  if (duplicate) {
    return response(
      { success: false, error: 'Service name already exists.' },
      409
    );
  }

  const updated = await updateGarageService(garage.id, id, parsed.data);
  if (!updated) {
    return response({ success: false, error: 'Service not found.' }, 404);
  }

  return response({ success: true, data: updated });
}

export async function DELETE(
  _request: Request,
  context: RouteContext
): Promise<NextResponse<ApiResponse<Service>>> {
  const session = await auth();
  if (!session?.user?.id) {
    return response({ success: false, error: 'Unauthorized' }, 401);
  }

  const garage = await getGarageByOwnerId(session.user.id);
  if (!garage) {
    return response({ success: false, error: 'Garage not found.' }, 404);
  }

  const { id } = await context.params;
  const existing = await findGarageServiceById(garage.id, id);

  if (!existing) {
    return response({ success: false, error: 'Service not found.' }, 404);
  }

  const usedInWorkOrder = await isServiceUsedInWorkOrders(garage.id, {
    id: existing.id,
    name: existing.name
  });
  if (usedInWorkOrder) {
    return response(
      {
        success: false,
        error: 'This service is used in a work order and cannot be deleted.'
      },
      400
    );
  }

  const deleted = await deleteGarageService(garage.id, id);
  if (!deleted) {
    return response({ success: false, error: 'Service not found.' }, 404);
  }

  return response({ success: true, data: deleted });
}
