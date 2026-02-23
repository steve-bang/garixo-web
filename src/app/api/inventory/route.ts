import { NextResponse } from 'next/server';

import {
  createGarageInventory,
  hasDuplicateInventoryName,
  listGarageInventoryWithQuery
} from '@/app/api/inventory/inventory-db';
import {
  createInventorySchema,
  inventoryListQuerySchema
} from '@/features/inventory/schema';
import type {
  InventoryItem,
  InventoryListResponse
} from '@/features/inventory/types';
import { auth } from '@/lib/auth';
import { getRequestGarageId } from '@/lib/auth/garage-context';
import type { ApiResponse } from '@/types/api';

function response<T>(
  payload: ApiResponse<T>,
  status = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(payload, { status });
}

export async function GET(
  request: Request
): Promise<NextResponse<ApiResponse<InventoryListResponse>>> {
  const session = await auth();
  if (!session?.user?.id) {
    return response({ success: false, error: 'Unauthorized' }, 401);
  }

  const garageId = await getRequestGarageId(session);
  if (!garageId) {
    return response({ success: false, error: 'Garage not found.' }, 404);
  }

  const url = new URL(request.url);

  const parsed = inventoryListQuerySchema.safeParse({
    search: url.searchParams.get('search') ?? undefined,
    category: url.searchParams.get('category') ?? undefined,
    stockStatus: url.searchParams.get('stockStatus') ?? undefined,
    sort: url.searchParams.get('sort') ?? undefined,
    page: url.searchParams.get('page') ?? undefined,
    pageSize: url.searchParams.get('pageSize') ?? undefined
  });

  if (!parsed.success) {
    return response(
      {
        success: false,
        error: parsed.error.issues[0]?.message ?? 'Invalid query.'
      },
      400
    );
  }

  const { search, category, stockStatus, sort, page, pageSize } = parsed.data;
  const result = await listGarageInventoryWithQuery(garageId, {
    search,
    category,
    stockStatus,
    sort,
    page,
    pageSize
  });

  return response({
    success: true,
    data: {
      items: result.items,
      meta: result.meta
    }
  });
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
  const parsed = createInventorySchema.safeParse(body);

  if (!parsed.success) {
    return response(
      {
        success: false,
        error: parsed.error.issues[0]?.message ?? 'Invalid payload.'
      },
      400
    );
  }

  const duplicate = await hasDuplicateInventoryName(garageId, parsed.data.name);
  if (duplicate) {
    return response(
      { success: false, error: 'Item name already exists.' },
      409
    );
  }

  const created = await createGarageInventory(garageId, parsed.data);

  return response({ success: true, data: created }, 201);
}
