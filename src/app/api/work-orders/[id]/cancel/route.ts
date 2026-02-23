import { NextResponse } from 'next/server';

import {
  findGarageWorkOrderById,
  updateGarageWorkOrder
} from '@/app/api/work-orders/work-orders-db';
import { cancelSchema } from '@/features/work-orders/schema';
import { WorkOrderStatusEnum } from '@/features/work-orders/types';
import type { WorkOrder } from '@/features/work-orders/types';
import { auth } from '@/lib/auth';
import { getGarageByOwnerId } from '@/services/firebase/garage-service';
import type { ApiResponse } from '@/types/api';

function response<T>(
  payload: ApiResponse<T>,
  status = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(payload, { status });
}

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(
  request: Request,
  context: RouteContext
): Promise<NextResponse<ApiResponse<WorkOrder>>> {
  const session = await auth();
  if (!session?.user?.id) {
    return response({ success: false, error: 'Unauthorized' }, 401);
  }

  const garage = await getGarageByOwnerId(session.user.id);
  if (!garage) {
    return response({ success: false, error: 'Garage not found.' }, 404);
  }

  const { id } = await context.params;
  const current = await findGarageWorkOrderById(garage.id, id);

  if (!current) {
    return response({ success: false, error: 'Work order not found.' }, 404);
  }

  const body = await request.json().catch(() => null);
  const parsed = cancelSchema.safeParse(body);

  if (!parsed.success) {
    return response(
      {
        success: false,
        error: parsed.error.issues[0]?.message ?? 'Invalid payload.'
      },
      400
    );
  }

  const now = new Date().toISOString();
  const updated = await updateGarageWorkOrder(garage.id, id, {
    status: WorkOrderStatusEnum.Cancelled,
    cancellationReason: parsed.data.reason,
    timeline: [
      ...current.timeline,
      { status: WorkOrderStatusEnum.Cancelled, timestamp: now }
    ],
    isOverdue: false
  });
  if (!updated) {
    return response({ success: false, error: 'Work order not found.' }, 404);
  }

  return response({ success: true, data: updated });
}
