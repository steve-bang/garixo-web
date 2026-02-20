import { NextResponse } from 'next/server';

import { inventoryDB } from '@/app/api/inventory/inventory-db';
import { adjustInventorySchema } from '@/features/inventory/schema';
import type { InventoryItem } from '@/features/inventory/types';
import type { ApiResponse } from '@/types/api';

function response<T>(payload: ApiResponse<T>, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json(payload, { status });
}

export async function POST(request: Request): Promise<NextResponse<ApiResponse<InventoryItem>>> {
  const body = await request.json().catch(() => null);
  const parsed = adjustInventorySchema.safeParse(body);

  if (!parsed.success) {
    return response({ success: false, error: parsed.error.issues[0]?.message ?? 'Invalid payload.' }, 400);
  }

  const existing = inventoryDB.find((item) => item.id === parsed.data.id);

  if (!existing) {
    return response({ success: false, error: 'Item not found.' }, 404);
  }

  if (parsed.data.type === 'REDUCE' && parsed.data.amount > existing.quantity) {
    return response({ success: false, error: 'Not enough quantity in stock.' }, 400);
  }

  const quantity = parsed.data.type === 'ADD' ? existing.quantity + parsed.data.amount : existing.quantity - parsed.data.amount;

  if (quantity < 0) {
    return response({ success: false, error: 'Quantity cannot be negative.' }, 400);
  }

  const updated: InventoryItem = {
    ...existing,
    quantity,
    updatedAt: new Date().toISOString()
  };

  const index = inventoryDB.findIndex((item) => item.id === existing.id);
  inventoryDB[index] = updated;

  return response({ success: true, data: updated });
}
