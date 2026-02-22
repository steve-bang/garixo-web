import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import type {
  CreateQuickWorkOrderInput,
  QuickWorkOrder
} from '@/features/onboarding/types';
import { getGarageByOwnerId } from '@/services/firebase/garage-service';
import {
  createGarageWorkOrder,
  listGarageWorkOrders
} from '@/services/firebase/work-orders-service';
import type { ApiResponse } from '@/types/api';

function json<T>(
  payload: ApiResponse<T>,
  status = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(payload, { status });
}

export async function GET(): Promise<
  NextResponse<ApiResponse<QuickWorkOrder[]>>
> {
  const session = await auth();
  if (!session?.user?.id) {
    return json({ success: false, error: 'Unauthorized' }, 401);
  }

  const garage = await getGarageByOwnerId(session.user.id);
  if (!garage) {
    return json({ success: true, data: [] });
  }

  const items = (await listGarageWorkOrders(garage.id)).map((order) => ({
    id: order.id,
    customerName: order.customerName,
    licensePlate: order.licensePlate,
    service: order.service,
    notes: order.notes,
    createdAt: order.createdAt
  }));
  return json({ success: true, data: items });
}

export async function POST(
  request: Request
): Promise<NextResponse<ApiResponse<QuickWorkOrder>>> {
  const session = await auth();
  if (!session?.user?.id) {
    return json({ success: false, error: 'Unauthorized' }, 401);
  }

  const body = (await request.json()) as CreateQuickWorkOrderInput;

  if (!body.customerName?.trim()) {
    return json({ success: false, error: 'Customer name is required.' }, 400);
  }

  if (!body.licensePlate?.trim()) {
    return json({ success: false, error: 'License plate is required.' }, 400);
  }

  const garage = await getGarageByOwnerId(session.user.id);
  if (!garage) {
    return json(
      { success: false, error: 'Garage setup is required first.' },
      400
    );
  }

  const order = await createGarageWorkOrder(garage.id, {
    customerName: body.customerName,
    licensePlate: body.licensePlate,
    service: body.service,
    notes: body.notes
  });

  const payload: QuickWorkOrder = {
    id: order.id,
    customerName: order.customerName,
    licensePlate: order.licensePlate,
    service: order.service,
    notes: order.notes,
    createdAt: order.createdAt
  };
  return json({ success: true, data: payload });
}
