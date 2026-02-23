import { NextResponse } from 'next/server';

import {
  findGarageWorkOrderById,
  updateGarageWorkOrder
} from '@/app/api/work-orders/work-orders-db';
import {
  updateStatusSchema,
  updateWorkOrderSchema
} from '@/features/work-orders/schema';
import { WorkOrderStatusEnum } from '@/features/work-orders/types';
import type { WorkOrder } from '@/features/work-orders/types';
import {
  computeTotalAmount,
  toPlateDisplay
} from '@/features/work-orders/utils';
import { auth } from '@/lib/auth';
import { getRequestGarageId } from '@/lib/auth/garage-context';
import { applyWorkOrderStatusTransition } from '@/services/firebase/dashboard-summary-service';
import {
  incrementGarageStaffCompletedJobs,
  incrementGarageStaffCurrentJobs
} from '@/services/firebase/staff-service';
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

export async function GET(
  _request: Request,
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
  const order = await findGarageWorkOrderById(garageId, id);

  if (!order) {
    return response({ success: false, error: 'Work order not found.' }, 404);
  }

  return response({ success: true, data: order });
}

export async function PUT(
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
  const parsed = updateWorkOrderSchema.safeParse({ ...body, id });

  if (!parsed.success) {
    return response(
      {
        success: false,
        error: parsed.error.issues[0]?.message ?? 'Invalid payload.'
      },
      400
    );
  }

  const services = parsed.data.services ?? current.services;
  const parts = parsed.data.parts ?? current.parts;
  const { id: _ignoredId, ...partial } = parsed.data;

  const patch: Partial<Omit<WorkOrder, 'id'>> = {
    ...partial,
    plateNumber: parsed.data.plateNumber
      ? toPlateDisplay(parsed.data.plateNumber)
      : current.plateNumber,
    customerId: parsed.data.customerId ?? current.customerId,
    customerName: parsed.data.customerName ?? current.customerName,
    customerPhone: parsed.data.customerPhone ?? current.customerPhone,
    vehicleId: parsed.data.vehicleId ?? current.vehicleId,
    vehicleModel: parsed.data.vehicleModel ?? current.vehicleModel,
    workerId: parsed.data.workerId ?? current.workerId,
    workerName: parsed.data.workerName ?? current.workerName,
    priority: parsed.data.priority ?? current.priority,
    estimatedTimeMinutes:
      parsed.data.estimatedTimeMinutes ?? current.estimatedTimeMinutes,
    estimatedFinish: parsed.data.estimatedTimeMinutes
      ? new Date(
          Date.now() + parsed.data.estimatedTimeMinutes * 60 * 1000
        ).toISOString()
      : current.estimatedFinish,
    notes: parsed.data.notes ?? current.notes,
    totalAmount: computeTotalAmount(services, parts),
    services,
    parts
  };

  const updated = await updateGarageWorkOrder(garageId, id, patch);
  if (!updated) {
    return response({ success: false, error: 'Work order not found.' }, 404);
  }

  return response({ success: true, data: updated });
}

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

  const updated = await applyWorkOrderStatusTransition({
    garageId,
    orderId: id,
    nextStatus: parsed.data.status,
    deductInventoryOnComplete:
      parsed.data.status === WorkOrderStatusEnum.Completed
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
      if (parsed.data.status === WorkOrderStatusEnum.Completed) {
        await incrementGarageStaffCompletedJobs(garageId, current.workerId, 1);
      }
    }
  }

  return response({ success: true, data: updated });
}
