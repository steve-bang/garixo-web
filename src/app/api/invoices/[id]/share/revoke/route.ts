import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { getRequestGarageId } from '@/lib/auth/garage-context';
import {
  findGarageInvoiceById,
  revokeGarageInvoicePublicShares
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

/**
 * Revokes active public invoice links for the selected invoice.
 */
export async function POST(
  _request: Request,
  context: RouteContext
): Promise<NextResponse<ApiResponse<{ revoked: number }>>> {
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

  const revoked = await revokeGarageInvoicePublicShares(garageId, id);

  return response({
    success: true,
    data: {
      revoked
    }
  });
}
