import { NextResponse } from 'next/server';

import { inventoryDB } from '@/app/api/inventory/inventory-db';
import { updateInventorySchema } from '@/features/inventory/schema';
import type { InventoryItem } from '@/features/inventory/types';
import type { ApiResponse } from '@/types/api';

function response<T>(payload: ApiResponse<T>, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json(payload, { status });
}

type RouteContext = {
  params: Promise<{ id: string }>;
};

function findById(id: string): InventoryItem | undefined {
  return inventoryDB.find((item) => item.id === id);
}

export async function PUT(request: Request, context: RouteContext): Promise<NextResponse<ApiResponse<InventoryItem>>> {
  const { id } = await context.params;
  const current = findById(id);

  if (!current) {
    return response({ success: false, error: 'Item not found.' }, 404);
  }

  const body = await request.json().catch(() => null);
  const parsed = updateInventorySchema.safeParse({ ...body, id });

  if (!parsed.success) {
    return response({ success: false, error: parsed.error.issues[0]?.message ?? 'Invalid payload.' }, 400);
  }

  if (parsed.data.quantity !== undefined && parsed.data.quantity < 0) {
    return response({ success: false, error: 'Quantity cannot be negative.' }, 400);
  }

  const updated: InventoryItem = {
    ...current,
    ...parsed.data,
    id,
    updatedAt: new Date().toISOString()
  };

  const index = inventoryDB.findIndex((item) => item.id === id);
  inventoryDB[index] = updated;

  return response({ success: true, data: updated });
}

export async function DELETE(_request: Request, context: RouteContext): Promise<NextResponse<ApiResponse<InventoryItem>>> {
  const { id } = await context.params;
  const current = findById(id);

  if (!current) {
    return response({ success: false, error: 'Item not found.' }, 404);
  }

  const index = inventoryDB.findIndex((item) => item.id === id);
  inventoryDB.splice(index, 1);

  return response({ success: true, data: current });
}
