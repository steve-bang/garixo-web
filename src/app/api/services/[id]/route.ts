import { NextResponse } from 'next/server';

import { servicesDB } from '@/app/api/services/services-db';
import { updateServiceSchema } from '@/features/services/schema';
import type { Service } from '@/features/services/types';
import type { ApiResponse } from '@/types/api';

function response<T>(payload: ApiResponse<T>, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json(payload, { status });
}

function findById(id: string): Service | undefined {
  return servicesDB.find((item) => item.id === id);
}

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, context: RouteContext): Promise<NextResponse<ApiResponse<Service>>> {
  const { id } = await context.params;
  const existing = findById(id);

  if (!existing) {
    return response({ success: false, error: 'Service not found.' }, 404);
  }

  const body = await request.json().catch(() => null);
  const parsed = updateServiceSchema.safeParse({ ...body, id });

  if (!parsed.success) {
    return response({ success: false, error: parsed.error.issues[0]?.message ?? 'Invalid payload.' }, 400);
  }

  const duplicate =
    parsed.data.name &&
    servicesDB.find((item) => item.id !== id && item.name.toLowerCase() === parsed.data.name?.toLowerCase());

  if (duplicate) {
    return response({ success: false, error: 'Service name already exists.' }, 409);
  }

  const updated: Service = {
    ...existing,
    ...parsed.data,
    id,
    updatedAt: new Date().toISOString()
  };

  const index = servicesDB.findIndex((item) => item.id === id);
  servicesDB[index] = updated;

  return response({ success: true, data: updated });
}

export async function DELETE(_request: Request, context: RouteContext): Promise<NextResponse<ApiResponse<Service>>> {
  const { id } = await context.params;
  const existing = findById(id);

  if (!existing) {
    return response({ success: false, error: 'Service not found.' }, 404);
  }

  if (existing.usedInWorkOrder) {
    return response({ success: false, error: 'This service is used in a work order and cannot be deleted.' }, 400);
  }

  const index = servicesDB.findIndex((item) => item.id === id);
  servicesDB.splice(index, 1);

  return response({ success: true, data: existing });
}
