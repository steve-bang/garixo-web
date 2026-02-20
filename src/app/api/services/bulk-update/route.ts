import { NextResponse } from 'next/server';

import { servicesDB } from '@/app/api/services/services-db';
import { bulkUpdateSchema } from '@/features/services/schema';
import type { Service } from '@/features/services/types';
import type { ApiResponse } from '@/types/api';

function response<T>(payload: ApiResponse<T>, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json(payload, { status });
}

export async function POST(request: Request): Promise<NextResponse<ApiResponse<Service[]>>> {
  const body = await request.json().catch(() => null);
  const parsed = bulkUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return response({ success: false, error: parsed.error.issues[0]?.message ?? 'Invalid payload.' }, 400);
  }

  const percentage = parsed.data.percentage;
  const factor = 1 + percentage / 100;

  const updated = servicesDB.map((service) => {
    if (service.status !== 'ACTIVE') {
      return service;
    }

    return {
      ...service,
      price: Math.round(service.price * factor),
      updatedAt: new Date().toISOString()
    };
  });

  servicesDB.splice(0, servicesDB.length, ...updated);

  return response({ success: true, data: updated.filter((item) => item.status === 'ACTIVE') });
}
