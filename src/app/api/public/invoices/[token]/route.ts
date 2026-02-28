import { createHash } from 'node:crypto';
import { NextResponse } from 'next/server';

import type { PublicInvoiceView } from '@/features/invoices/types';
import {
  findGarageInvoiceById,
  findInvoicePublicShareByTokenHash,
  toPublicInvoiceView,
  touchInvoicePublicShareViewedAt
} from '@/services/firebase/invoices-service';
import { getGarageById } from '@/services/firebase/garage-service';
import type { ApiResponse } from '@/types/api';

function response<T>(
  payload: ApiResponse<T>,
  status = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(payload, { status });
}

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

function isExpired(expiresAt: string | null): boolean {
  if (!expiresAt) {
    return false;
  }

  const expiresAtMs = new Date(expiresAt).getTime();
  if (!Number.isFinite(expiresAtMs)) {
    return true;
  }

  return Date.now() > expiresAtMs;
}

type RouteContext = {
  params: Promise<{ token: string }>;
};

/**
 * Public invoice read endpoint using tokenized share links.
 * Returns only sanitized fields for customer-facing display.
 */
export async function GET(
  _request: Request,
  context: RouteContext
): Promise<NextResponse<ApiResponse<PublicInvoiceView>>> {
  const { token } = await context.params;
  if (!token || token.length < 32) {
    return response(
      { success: false, error: 'This invoice link is not available.' },
      404
    );
  }

  const tokenHash = sha256(token);
  const share = await findInvoicePublicShareByTokenHash(tokenHash);

  if (!share || !share.isActive) {
    return response(
      { success: false, error: 'This invoice link is not available.' },
      404
    );
  }

  if (isExpired(share.expiresAt)) {
    return response(
      { success: false, error: 'This invoice link has expired.' },
      410
    );
  }

  const [invoice, garage] = await Promise.all([
    findGarageInvoiceById(share.garageId, share.invoiceId),
    getGarageById(share.garageId)
  ]);

  if (!invoice || !garage) {
    return response(
      { success: false, error: 'This invoice link is not available.' },
      404
    );
  }

  void touchInvoicePublicShareViewedAt(share.id);

  return response({
    success: true,
    data: toPublicInvoiceView(invoice, garage.name)
  });
}
