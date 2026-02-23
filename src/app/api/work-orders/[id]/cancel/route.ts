import { NextResponse } from 'next/server';

import { findGarageWorkOrderById } from '@/app/api/work-orders/work-orders-db';
import { cancelSchema } from '@/features/work-orders/schema';
import { WorkOrderStatusEnum } from '@/features/work-orders/types';
import type { WorkOrder } from '@/features/work-orders/types';
import { auth } from '@/lib/auth';
import { getRequestGarageId } from '@/lib/auth/garage-context';
import { applyWorkOrderStatusTransition } from '@/services/firebase/dashboard-summary-service';
import { incrementGarageStaffCurrentJobs } from '@/services/firebase/staff-service';
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

  const garageId = await getRequestGarageId(session);
  if (!garageId) {
    return response({ success: false, error: 'Garage not found.' }, 404);
  }

  const { id } = await context.params;
  const current = await findGarageWorkOrderById(garageId, id);

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

  const updated = await applyWorkOrderStatusTransition({
    garageId,
    orderId: id,
    nextStatus: WorkOrderStatusEnum.Cancelled,
    cancellationReason: parsed.data.reason
  });
  if (!updated) {
    return response({ success: false, error: 'Work order not found.' }, 404);
  }

  if (current.workerId) {
    const wasAlreadyFinal =
      current.status === WorkOrderStatusEnum.Completed ||
      current.status === WorkOrderStatusEnum.Paid ||
      current.status === WorkOrderStatusEnum.Cancelled;

    if (!wasAlreadyFinal) {
      await incrementGarageStaffCurrentJobs(garageId, current.workerId, -1);
    }
  }

  return response({ success: true, data: updated });
}
