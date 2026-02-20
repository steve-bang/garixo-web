import { NextResponse } from 'next/server';

import { refreshWorkers, workOrdersDB } from '@/app/api/work-orders/work-orders-db';
import { updateWorkOrderSchema } from '@/features/work-orders/schema';
import type { WorkOrder } from '@/features/work-orders/types';
import { computeTotalAmount, toPlateDisplay } from '@/features/work-orders/utils';
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

export async function GET(_request: Request, context: RouteContext): Promise<NextResponse<ApiResponse<WorkOrder>>> {
  const { id } = await context.params;
  const order = findById(id);

  if (!order) {
    return response({ success: false, error: 'Work order not found.' }, 404);
  }

  return response({ success: true, data: order });
}

export async function PUT(request: Request, context: RouteContext): Promise<NextResponse<ApiResponse<WorkOrder>>> {
  const { id } = await context.params;
  const current = findById(id);

  if (!current) {
    return response({ success: false, error: 'Work order not found.' }, 404);
  }

  const body = await request.json().catch(() => null);
  const parsed = updateWorkOrderSchema.safeParse({ ...body, id });

  if (!parsed.success) {
    return response({ success: false, error: parsed.error.issues[0]?.message ?? 'Invalid payload.' }, 400);
  }

  const services = parsed.data.services ?? current.services;
  const parts = parsed.data.parts ?? current.parts;

  const updated: WorkOrder = {
    ...current,
    ...parsed.data,
    id,
    plateNumber: parsed.data.plateNumber ? toPlateDisplay(parsed.data.plateNumber) : current.plateNumber,
    totalAmount: computeTotalAmount(services, parts),
    updatedAt: new Date().toISOString()
  };

  const index = workOrdersDB.findIndex((item) => item.id === id);
  workOrdersDB[index] = updated;
  refreshWorkers();

  return response({ success: true, data: updated });
}
