import { NextResponse } from 'next/server';

import { invoicesQuerySchema } from '@/features/invoices/schema';
import type { InvoiceListResponse } from '@/features/invoices/types';
import { auth } from '@/lib/auth';
import { getRequestGarageId } from '@/lib/auth/garage-context';
import { listGarageInvoices } from '@/services/firebase/invoices-service';
import type { ApiResponse } from '@/types/api';

function response<T>(
  payload: ApiResponse<T>,
  status = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(payload, { status });
}

/**
 * Lists invoices for the current garage.
 * Supports work-order filtering and simple full-text search for owner-friendly retrieval.
 */
export async function GET(
  request: Request
): Promise<NextResponse<ApiResponse<InvoiceListResponse>>> {
  const session = await auth();
  if (!session?.user?.id) {
    return response({ success: false, error: 'Unauthorized' }, 401);
  }

  const garageId = await getRequestGarageId(session);
  if (!garageId) {
    return response({ success: false, error: 'Garage not found.' }, 404);
  }

  const url = new URL(request.url);
  const parsed = invoicesQuerySchema.safeParse(
    Object.fromEntries(url.searchParams)
  );

  if (!parsed.success) {
    return response(
      {
        success: false,
        error: parsed.error.issues[0]?.message ?? 'Invalid query.'
      },
      400
    );
  }

  const result = await listGarageInvoices(garageId, {
    search: parsed.data.search,
    workOrderId: parsed.data.workOrderId,
    page: parsed.data.page,
    pageSize: parsed.data.pageSize
  });

  return response({
    success: true,
    data: {
      items: result.items,
      meta: {
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
        totalPages: result.totalPages
      }
    }
  });
}
