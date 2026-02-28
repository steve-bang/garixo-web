import { NextResponse } from 'next/server';

import { findGarageWorkOrderById } from '@/app/api/work-orders/work-orders-db';
import { createInvoiceFromWorkOrderSchema } from '@/features/invoices/schema';
import type { Invoice } from '@/features/invoices/types';
import { auth } from '@/lib/auth';
import {
  getRequestGarage,
  getRequestGarageId
} from '@/lib/auth/garage-context';
import { ensureGarageInvoiceSettings } from '@/services/firebase/garage-invoice-settings-service';
import { findGarageCustomerById } from '@/services/firebase/customers-service';
import { createGarageInvoiceFromWorkOrder } from '@/services/firebase/invoices-service';
import type { ApiResponse } from '@/types/api';

function response<T>(
  payload: ApiResponse<T>,
  status = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(payload, { status });
}

/**
 * Creates a basic invoice from an existing work order.
 * This endpoint is idempotent by workOrderId and returns the existing invoice if already created.
 */
export async function POST(
  request: Request
): Promise<NextResponse<ApiResponse<Invoice>>> {
  const session = await auth();
  if (!session?.user?.id) {
    return response({ success: false, error: 'Unauthorized' }, 401);
  }

  const [garageId, garage] = await Promise.all([
    getRequestGarageId(session),
    getRequestGarage(session)
  ]);

  if (!garageId || !garage) {
    return response({ success: false, error: 'Garage not found.' }, 404);
  }

  const body = await request.json().catch(() => null);
  const parsed = createInvoiceFromWorkOrderSchema.safeParse(body);

  if (!parsed.success) {
    return response(
      {
        success: false,
        error: parsed.error.issues[0]?.message ?? 'Invalid payload.'
      },
      400
    );
  }

  const order = await findGarageWorkOrderById(
    garageId,
    parsed.data.workOrderId
  );
  if (!order) {
    return response({ success: false, error: 'Work order not found.' }, 404);
  }

  const [invoiceSettings, customer] = await Promise.all([
    ensureGarageInvoiceSettings(garageId),
    order.customerId
      ? findGarageCustomerById(garageId, order.customerId)
      : Promise.resolve(null)
  ]);

  try {
    const invoice = await createGarageInvoiceFromWorkOrder(garageId, {
      order,
      customerEmail: customer?.email?.trim() || null,
      invoiceSettings,
      userId: session.user.id
    });

    return response({ success: true, data: invoice });
  } catch (error) {
    return response(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Could not create invoice from work order.'
      },
      400
    );
  }
}
