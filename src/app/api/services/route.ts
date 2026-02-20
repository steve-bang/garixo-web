import { NextResponse } from 'next/server';

import { servicesDB } from '@/app/api/services/services-db';
import { createServiceSchema, serviceListQuerySchema } from '@/features/services/schema';
import type { Service, ServiceListResponse } from '@/features/services/types';
import type { ApiResponse } from '@/types/api';

function response<T>(payload: ApiResponse<T>, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json(payload, { status });
}

function defaultSort(a: Service, b: Service): number {
  if (a.status !== b.status) {
    return a.status === 'ACTIVE' ? -1 : 1;
  }

  if (a.category !== b.category) {
    return a.category.localeCompare(b.category);
  }

  return a.name.localeCompare(b.name);
}

function applySort(items: Service[], sort: 'default' | 'name_asc' | 'name_desc' | 'price_asc' | 'price_desc'): Service[] {
  const copy = [...items];

  switch (sort) {
    case 'name_asc':
      return copy.sort((a, b) => a.name.localeCompare(b.name));
    case 'name_desc':
      return copy.sort((a, b) => b.name.localeCompare(a.name));
    case 'price_asc':
      return copy.sort((a, b) => a.price - b.price);
    case 'price_desc':
      return copy.sort((a, b) => b.price - a.price);
    default:
      return copy.sort(defaultSort);
  }
}

export async function GET(request: Request): Promise<NextResponse<ApiResponse<ServiceListResponse>>> {
  const url = new URL(request.url);

  const parsedQuery = serviceListQuerySchema.safeParse({
    search: url.searchParams.get('search') ?? undefined,
    category: url.searchParams.get('category') ?? undefined,
    status: url.searchParams.get('status') ?? undefined,
    page: url.searchParams.get('page') ?? undefined,
    pageSize: url.searchParams.get('pageSize') ?? undefined,
    sort: url.searchParams.get('sort') ?? undefined
  });

  if (!parsedQuery.success) {
    return response({ success: false, error: parsedQuery.error.issues[0]?.message ?? 'Invalid query.' }, 400);
  }

  const { search, category, status, page, pageSize, sort } = parsedQuery.data;

  let filtered = [...servicesDB];

  if (search) {
    const needle = search.trim().toLowerCase();
    filtered = filtered.filter((item) => item.name.toLowerCase().includes(needle));
  }

  if (category) {
    filtered = filtered.filter((item) => item.category === category);
  }

  if (status) {
    filtered = filtered.filter((item) => item.status === status);
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

export async function POST(request: Request): Promise<NextResponse<ApiResponse<Service>>> {
  const body = await request.json().catch(() => null);
  const parsed = createServiceSchema.safeParse(body);

  if (!parsed.success) {
    return response({ success: false, error: parsed.error.issues[0]?.message ?? 'Invalid payload.' }, 400);
  }

  const duplicate = servicesDB.find((item) => item.name.toLowerCase() === parsed.data.name.toLowerCase());

  if (duplicate) {
    return response({ success: false, error: 'Service name already exists.' }, 409);
  }

  const now = new Date().toISOString();
  const created: Service = {
    id: crypto.randomUUID(),
    name: parsed.data.name,
    category: parsed.data.category,
    price: parsed.data.price,
    estimatedTime: parsed.data.estimatedTime,
    description: parsed.data.description,
    status: parsed.data.status,
    usedInWorkOrder: false,
    createdAt: now,
    updatedAt: now
  };

  servicesDB.unshift(created);

  return response({ success: true, data: created }, 201);
}
