import { NextResponse } from 'next/server';

import { refreshWorkers, workOrdersDB } from '@/app/api/work-orders/work-orders-db';
import { paymentSchema } from '@/features/work-orders/schema';
import type { WorkOrder } from '@/features/work-orders/types';
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

  if (current.status !== 'READY_FOR_PAYMENT') {
    return response({ success: false, error: 'Order must be Ready for Payment.' }, 400);
  }

  if (current.totalAmount <= 0) {
    return response({ success: false, error: 'Total amount must be greater than 0.' }, 400);
  }

  const body = await request.json().catch(() => null);
  const parsed = paymentSchema.safeParse(body);

  if (!parsed.success) {
    return response({ success: false, error: parsed.error.issues[0]?.message ?? 'Invalid payload.' }, 400);
  }

  const now = new Date().toISOString();
  const updated: WorkOrder = {
    ...current,
    paymentMethod: parsed.data.method,
    status: 'COMPLETED',
    timeline: [...current.timeline, { status: 'COMPLETED', timestamp: now }],
    updatedAt: now,
    isOverdue: false
  };

  const index = workOrdersDB.findIndex((item) => item.id === id);
  workOrdersDB[index] = updated;
  refreshWorkers();

  return response({ success: true, data: updated });
}
