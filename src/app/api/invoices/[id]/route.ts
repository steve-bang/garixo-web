import { NextResponse } from 'next/server';

import { findGarageWorkOrderById } from '@/app/api/work-orders/work-orders-db';
import { updateInvoiceSchema } from '@/features/invoices/schema';
import type { Invoice } from '@/features/invoices/types';
import { WorkOrderStatusEnum } from '@/features/work-orders/types';
import { auth } from '@/lib/auth';
import { getRequestGarageId } from '@/lib/auth/garage-context';
import {
  findGarageInvoiceById,
  updateGarageInvoice
} from '@/services/firebase/invoices-service';
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
): Promise<NextResponse<ApiResponse<Invoice>>> {
  const session = await auth();
  if (!session?.user?.id) {
    return response({ success: false, error: 'Unauthorized' }, 401);
  }

  const garageId = await getRequestGarageId(session);
  if (!garageId) {
    return response({ success: false, error: 'Garage not found.' }, 404);
  }

  const { id } = await context.params;
  const invoice = await findGarageInvoiceById(garageId, id);

  if (!invoice) {
    return response({ success: false, error: 'Invoice not found.' }, 404);
  }

  return response({ success: true, data: invoice });
}

/**
 * Updates editable invoice data. If linked work order is already paid,
 * financial edits are blocked to keep records consistent.
 */
export async function PUT(
  request: Request,
  context: RouteContext
): Promise<NextResponse<ApiResponse<Invoice>>> {
  const session = await auth();
  if (!session?.user?.id) {
    return response({ success: false, error: 'Unauthorized' }, 401);
  }

  const garageId = await getRequestGarageId(session);
  if (!garageId) {
    return response({ success: false, error: 'Garage not found.' }, 404);
  }

  const { id } = await context.params;
  const existing = await findGarageInvoiceById(garageId, id);

  if (!existing) {
    return response({ success: false, error: 'Invoice not found.' }, 404);
  }

  const body = await request.json().catch(() => null);
  const parsed = updateInvoiceSchema.safeParse(body);

  if (!parsed.success) {
    return response(
      {
        success: false,
        error: parsed.error.issues[0]?.message ?? 'Invalid payload.'
      },
      400
    );
  }

  const order = await findGarageWorkOrderById(garageId, existing.workOrderId);
  if (!order) {
    return response(
      { success: false, error: 'Linked work order was not found.' },
      400
    );
  }

  if (order.status === WorkOrderStatusEnum.Paid) {
    return response(
      {
        success: false,
        error: 'This invoice is locked because the work order is already paid.'
      },
      400
    );
  }

  const updated = await updateGarageInvoice(
    garageId,
    id,
    {
      dueDate: parsed.data.dueDate,
      paymentTerm: parsed.data.paymentTerm,
      notes: parsed.data.notes,
      tax: parsed.data.tax,
      lineItems: parsed.data.lineItems
    },
    session.user.id
  );

  if (!updated) {
    return response({ success: false, error: 'Invoice not found.' }, 404);
  }

  return response({ success: true, data: updated });
}
