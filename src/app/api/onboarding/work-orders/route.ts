import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { createQuickWorkOrder, listQuickWorkOrders } from '@/mocks/onboarding.mock';
import type { CreateQuickWorkOrderInput, QuickWorkOrder } from '@/features/onboarding/types';
import type { ApiResponse } from '@/types/api';

function json<T>(payload: ApiResponse<T>, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json(payload, { status });
}

export async function GET(): Promise<NextResponse<ApiResponse<QuickWorkOrder[]>>> {
  const session = await auth();
  if (!session?.user?.id) {
    return json({ success: false, error: 'Unauthorized' }, 401);
  }

  const items = await listQuickWorkOrders(session.user.id);
  return json({ success: true, data: items });
}

export async function POST(request: Request): Promise<NextResponse<ApiResponse<QuickWorkOrder>>> {
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

  const order = await createQuickWorkOrder(session.user.id, body);
  return json({ success: true, data: order });
}
