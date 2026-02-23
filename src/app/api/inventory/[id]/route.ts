import { NextResponse } from 'next/server';

import {
  deleteGarageInventory,
  findGarageInventoryById,
  hasDuplicateInventoryName,
  updateGarageInventory
} from '@/app/api/inventory/inventory-db';
import { updateInventorySchema } from '@/features/inventory/schema';
import type { InventoryItem } from '@/features/inventory/types';
import { auth } from '@/lib/auth';
import { getRequestGarageId } from '@/lib/auth/garage-context';
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
): Promise<NextResponse<ApiResponse<InventoryItem>>> {
  const session = await auth();
  if (!session?.user?.id) {
    return response({ success: false, error: 'Unauthorized' }, 401);
  }

  const garageId = await getRequestGarageId(session);
  if (!garageId) {
    return response({ success: false, error: 'Garage not found.' }, 404);
  }

  const { id } = await context.params;
  const current = await findGarageInventoryById(garageId, id);

  if (!current) {
    return response({ success: false, error: 'Item not found.' }, 404);
  }

  const body = await request.json().catch(() => null);
  const parsed = updateInventorySchema.safeParse({ ...body, id });

  if (!parsed.success) {
    return response(
      {
        success: false,
        error: parsed.error.issues[0]?.message ?? 'Invalid payload.'
      },
      400
    );
  }

  if (parsed.data.quantity !== undefined && parsed.data.quantity < 0) {
    return response(
      { success: false, error: 'Quantity cannot be negative.' },
      400
    );
  }

  if (
    parsed.data.name &&
    (await hasDuplicateInventoryName(garageId, parsed.data.name, id))
  ) {
    return response(
      { success: false, error: 'Item name already exists.' },
      409
    );
  }

  const updated = await updateGarageInventory(garageId, id, parsed.data);
  if (!updated) {
    return response({ success: false, error: 'Item not found.' }, 404);
  }

  return response({ success: true, data: updated });
}

export async function DELETE(
  _request: Request,
  context: RouteContext
): Promise<NextResponse<ApiResponse<InventoryItem>>> {
  const session = await auth();
  if (!session?.user?.id) {
    return response({ success: false, error: 'Unauthorized' }, 401);
  }

  const garageId = await getRequestGarageId(session);
  if (!garageId) {
    return response({ success: false, error: 'Garage not found.' }, 404);
  }

  const { id } = await context.params;
  const current = await deleteGarageInventory(garageId, id);
  if (!current) {
    return response({ success: false, error: 'Item not found.' }, 404);
  }

  return response({ success: true, data: current });
}
