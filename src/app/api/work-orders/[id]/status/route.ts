import { NextResponse } from 'next/server';

import {
  findGarageWorkOrderById,
  updateGarageWorkOrder
} from '@/app/api/work-orders/work-orders-db';
import { updateStatusSchema } from '@/features/work-orders/schema';
import { WorkOrderStatusEnum } from '@/features/work-orders/types';
import type { WorkOrder } from '@/features/work-orders/types';
import { canTransitionTo } from '@/features/work-orders/utils';
import { auth } from '@/lib/auth';
import { firebaseAdmin } from '@/lib/firebase-admin';
import { getRequestGarageId } from '@/lib/auth/garage-context';
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
  const parsed = updateStatusSchema.safeParse(body);

  if (!parsed.success) {
    return response(
      {
        success: false,
        error: parsed.error.issues[0]?.message ?? 'Invalid payload.'
      },
      400
    );
  }

  const check = canTransitionTo(current.status, parsed.data.status);

  if (!check.ok) {
    return response(
      { success: false, error: check.error ?? 'Invalid status transition.' },
      400
    );
  }

  if (
    parsed.data.status === WorkOrderStatusEnum.Completed &&
    current.parts.length > 0
  ) {
    try {
      const db = firebaseAdmin.db as any;
      await db.runTransaction(async (transaction: any) => {
        for (const part of current.parts) {
          const ref = db
            .collection('garages')
            .doc(garageId)
            .collection('inventory')
            .doc(part.id);

          const snapshot = await transaction.get(ref);
          if (!snapshot.exists) {
            continue;
          }

          const data = snapshot.data() as { quantity?: number };
          const currentQuantity = data.quantity ?? 0;

          if (currentQuantity < part.quantity) {
            throw new Error(`Not enough quantity for ${part.partName}.`);
          }

          transaction.set(
            ref,
            {
              quantity: currentQuantity - part.quantity,
              updatedAt: new Date().toISOString()
            },
            { merge: true }
          );
        }
      });
    } catch (error) {
      return response(
        {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : 'Could not complete order because stock is insufficient.'
        },
        400
      );
    }
  }

  const updated = await updateGarageWorkOrder(garageId, id, {
    status: parsed.data.status,
    timeline: [
      ...current.timeline,
      { status: parsed.data.status, timestamp: new Date().toISOString() }
    ],
    isOverdue:
      parsed.data.status === WorkOrderStatusEnum.Completed ||
      parsed.data.status === WorkOrderStatusEnum.Paid ||
      parsed.data.status === WorkOrderStatusEnum.Cancelled
        ? false
        : current.isOverdue
  });
  if (!updated) {
    return response({ success: false, error: 'Work order not found.' }, 404);
  }

  if (
    current.workerId &&
    (parsed.data.status === WorkOrderStatusEnum.Completed ||
      parsed.data.status === WorkOrderStatusEnum.Cancelled)
  ) {
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
