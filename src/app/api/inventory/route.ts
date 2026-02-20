import { NextResponse } from 'next/server';

import { inventoryDB } from '@/app/api/inventory/inventory-db';
import { createInventorySchema, inventoryListQuerySchema } from '@/features/inventory/schema';
import type { InventoryItem, InventoryListResponse } from '@/features/inventory/types';
import { getStockStatus } from '@/features/inventory/utils';
import type { ApiResponse } from '@/types/api';

function response<T>(payload: ApiResponse<T>, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json(payload, { status });
}

function applySort(items: InventoryItem[], sort: 'default' | 'name_asc' | 'name_desc' | 'quantity_asc' | 'quantity_desc'): InventoryItem[] {
  const copy = [...items];

  switch (sort) {
    case 'name_asc':
      return copy.sort((a, b) => a.name.localeCompare(b.name));
    case 'name_desc':
      return copy.sort((a, b) => b.name.localeCompare(a.name));
    case 'quantity_asc':
      return copy.sort((a, b) => a.quantity - b.quantity);
    case 'quantity_desc':
      return copy.sort((a, b) => b.quantity - a.quantity);
    default:
      return copy.sort((a, b) => a.name.localeCompare(b.name));
  }
}

export async function GET(request: Request): Promise<NextResponse<ApiResponse<InventoryListResponse>>> {
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
    return response({ success: false, error: parsed.error.issues[0]?.message ?? 'Invalid query.' }, 400);
  }

  const { search, category, stockStatus, sort, page, pageSize } = parsed.data;

  let filtered = [...inventoryDB];

  if (search) {
    const needle = search.trim().toLowerCase();
    filtered = filtered.filter((item) => item.name.toLowerCase().includes(needle) || (item.sku ?? '').toLowerCase().includes(needle));
  }

  if (category) {
    filtered = filtered.filter((item) => item.category === category);
  }

  if (stockStatus) {
    filtered = filtered.filter((item) => getStockStatus(item) === stockStatus);
  }

  const sorted = applySort(filtered, sort);

  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const items = sorted.slice(start, start + pageSize);

  return response({
    success: true,
    data: {
      items,
      meta: {
        page: safePage,
        pageSize,
        total,
        totalPages
      }
    }
  });
}

export async function POST(request: Request): Promise<NextResponse<ApiResponse<InventoryItem>>> {
  const body = await request.json().catch(() => null);
  const parsed = createInventorySchema.safeParse(body);

  if (!parsed.success) {
    return response({ success: false, error: parsed.error.issues[0]?.message ?? 'Invalid payload.' }, 400);
  }

  const duplicate = inventoryDB.find((item) => item.name.toLowerCase() === parsed.data.name.toLowerCase());
  if (duplicate) {
    return response({ success: false, error: 'Item name already exists.' }, 409);
  }

  const now = new Date().toISOString();
  const created: InventoryItem = {
    id: crypto.randomUUID(),
    ...parsed.data,
    createdAt: now,
    updatedAt: now
  };

  inventoryDB.unshift(created);

  return response({ success: true, data: created }, 201);
}
