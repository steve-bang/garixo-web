import { NextResponse } from 'next/server';

import { adjustGarageInventory } from '@/app/api/inventory/inventory-db';
import { adjustInventorySchema } from '@/features/inventory/schema';
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

export async function POST(
  request: Request
): Promise<NextResponse<ApiResponse<InventoryItem>>> {
  const session = await auth();
  if (!session?.user?.id) {
    return response({ success: false, error: 'Unauthorized' }, 401);
  }

  const garageId = await getRequestGarageId(session);
  if (!garageId) {
    return response({ success: false, error: 'Garage not found.' }, 404);
  }

  const body = await request.json().catch(() => null);
  const parsed = adjustInventorySchema.safeParse(body);

  if (!parsed.success) {
    return response(
      {
        success: false,
        error: parsed.error.issues[0]?.message ?? 'Invalid payload.'
      },
      400
    );
  }

  let updated: InventoryItem | null = null;
  try {
    updated = await adjustGarageInventory(
      garageId,
      parsed.data.id,
      parsed.data.type,
      parsed.data.amount
    );
  } catch (error) {
    return response(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Could not update inventory quantity.'
      },
      400
    );
  }

  if (!updated) {
    return response({ success: false, error: 'Item not found.' }, 404);
  }

  return response({ success: true, data: updated });
}
