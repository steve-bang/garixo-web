import { NextResponse } from 'next/server';

import { refreshWorkers, workOrdersDB } from '@/app/api/work-orders/work-orders-db';
import { updateStatusSchema } from '@/features/work-orders/schema';
import type { WorkOrder } from '@/features/work-orders/types';
import { canTransitionTo } from '@/features/work-orders/utils';
import type { ApiResponse } from '@/types/api';

function response<T>(payload: ApiResponse<T>, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json(payload, { status });
}

type RouteContext = {
  params: Promise<{ id: string }>;
};

function findById(id: string): WorkOrder | undefined {
  return workOrdersDB.find((item) => item.id === id);
}

export async function PATCH(request: Request, context: RouteContext): Promise<NextResponse<ApiResponse<WorkOrder>>> {
  const { id } = await context.params;
  const current = findById(id);

  if (!current) {
    return response({ success: false, error: 'Work order not found.' }, 404);
  }

  const body = await request.json().catch(() => null);
  const parsed = updateStatusSchema.safeParse(body);

  if (!parsed.success) {
    return response({ success: false, error: parsed.error.issues[0]?.message ?? 'Invalid payload.' }, 400);
  }

  const check = canTransitionTo(current.status, parsed.data.status, current.totalAmount);

  if (!check.ok) {
    return response({ success: false, error: check.error ?? 'Invalid status transition.' }, 400);
  }

  const updated: WorkOrder = {
    ...current,
    status: parsed.data.status,
    timeline: [...current.timeline, { status: parsed.data.status, timestamp: new Date().toISOString() }],
    updatedAt: new Date().toISOString()
  };

  const index = workOrdersDB.findIndex((item) => item.id === id);
  workOrdersDB[index] = updated;
  refreshWorkers();

  return response({ success: true, data: updated });
}
