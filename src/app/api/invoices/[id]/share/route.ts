import { createHash, randomBytes } from 'node:crypto';
import { NextResponse } from 'next/server';

import { createInvoiceShareSchema } from '@/features/invoices/schema';
import type { InvoiceShareResult } from '@/features/invoices/types';
import { env } from '@/config/env';
import { auth } from '@/lib/auth';
import { getRequestGarageId } from '@/lib/auth/garage-context';
import {
  createGarageInvoicePublicShare,
  findGarageInvoiceById
} from '@/services/firebase/invoices-service';
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

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * Creates a revocable public invoice link.
 * Raw token is stored for owner-side retrieval; hash is used for secure lookup.
 */
export async function POST(
  request: Request,
  context: RouteContext
): Promise<NextResponse<ApiResponse<InvoiceShareResult>>> {
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

  const body = await request.json().catch(() => ({}));
  const parsed = createInvoiceShareSchema.safeParse(body);
  if (!parsed.success) {
    return response(
      {
        success: false,
        error: parsed.error.issues[0]?.message ?? 'Invalid payload.'
      },
      400
    );
  }

  const expiresAt = parsed.data.expiresInDays
    ? new Date(
        Date.now() + parsed.data.expiresInDays * 24 * 60 * 60 * 1000
      ).toISOString()
    : null;

  const token = randomBytes(32).toString('hex');
  const tokenHash = sha256(token);

  const share = await createGarageInvoicePublicShare({
    garageId,
    invoiceId: id,
    tokenHash,
    publicToken: token,
    createdByUserId: session.user.id,
    expiresAt
  });

  const publicUrl = `${env.NEXTAUTH_URL}/invoice/${token}`;

  return response({
    success: true,
    data: {
      publicUrl,
      expiresAt: share.expiresAt
    }
  });
}
