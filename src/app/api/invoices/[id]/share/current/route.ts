import { NextResponse } from 'next/server';

import type { InvoiceShareResult } from '@/features/invoices/types';
import { env } from '@/config/env';
import { auth } from '@/lib/auth';
import { getRequestGarageId } from '@/lib/auth/garage-context';
import {
  findActiveGarageInvoicePublicShare,
  findGarageInvoiceById
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
 * Returns currently active public link for an invoice (if exists).
 */
export async function GET(
  _request: Request,
  context: RouteContext
): Promise<NextResponse<ApiResponse<InvoiceShareResult | null>>> {
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

  const currentShare = await findActiveGarageInvoicePublicShare(garageId, id);
  if (!currentShare) {
    return response({ success: true, data: null });
  }

  if (!currentShare.publicToken) {
    // Legacy share rows without retrievable token cannot be reconstructed in UI.
    return response({ success: true, data: null });
  }

  return response({
    success: true,
    data: {
      publicUrl: `${env.NEXTAUTH_URL}/invoice/${currentShare.publicToken}`,
      expiresAt: currentShare.expiresAt
    }
  });
}
