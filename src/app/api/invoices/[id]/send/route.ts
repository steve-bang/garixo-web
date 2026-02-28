import { createHash, randomBytes } from 'node:crypto';
import { NextResponse } from 'next/server';

import { sendInvoiceSchema } from '@/features/invoices/schema';
import { auth } from '@/lib/auth';
import {
  getRequestGarage,
  getRequestGarageId
} from '@/lib/auth/garage-context';
import { env } from '@/config/env';
import { sendInvoiceEmail } from '@/services/email.service';
import { firebaseAdmin } from '@/lib/firebase-admin';
import {
  findGarageCustomerById,
  updateGarageCustomer
} from '@/services/firebase/customers-service';
import {
  createGarageInvoicePublicShare,
  findGarageInvoiceById,
  markGarageInvoiceSent,
  updateGarageInvoiceCustomerEmail
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

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

const INVOICE_EMAIL_LIMIT_PER_HOUR = 20;
const INVOICE_EMAIL_WINDOW_MS = 60 * 60 * 1000;

type InvoiceEmailRateLimitDoc = {
  windowStartAt: string;
  count: number;
  updatedAt: string;
};

function invoiceEmailRateLimitRef(garageId: string) {
  return firebaseAdmin.db
    .collection('garages')
    .doc(garageId)
    .collection('rate-limits')
    .doc('invoice-email');
}

/**
 * Consumes one invoice-email send slot from the per-garage hourly bucket.
 * Transaction ensures safe increments under concurrent requests.
 */
async function consumeGarageInvoiceEmailRateLimit(
  garageId: string
): Promise<{ allowed: boolean; retryAfterSeconds: number }> {
  const ref = invoiceEmailRateLimitRef(garageId);
  const now = Date.now();
  const nowIso = new Date(now).toISOString();

  return firebaseAdmin.db.runTransaction(async (tx: any) => {
    const snap = await tx.get(ref);

    if (!snap.exists) {
      const initial: InvoiceEmailRateLimitDoc = {
        windowStartAt: nowIso,
        count: 1,
        updatedAt: nowIso
      };
      tx.set(ref, initial);
      return { allowed: true, retryAfterSeconds: 0 };
    }

    const current = snap.data() as Partial<InvoiceEmailRateLimitDoc>;
    const windowStartAtMs = new Date(current.windowStartAt ?? nowIso).getTime();
    const elapsed = now - windowStartAtMs;
    const isWindowExpired =
      !Number.isFinite(windowStartAtMs) || elapsed >= INVOICE_EMAIL_WINDOW_MS;

    if (isWindowExpired) {
      tx.set(
        ref,
        {
          windowStartAt: nowIso,
          count: 1,
          updatedAt: nowIso
        },
        { merge: true }
      );
      return { allowed: true, retryAfterSeconds: 0 };
    }

    const currentCount = Math.max(0, Number(current.count) || 0);
    if (currentCount >= INVOICE_EMAIL_LIMIT_PER_HOUR) {
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((INVOICE_EMAIL_WINDOW_MS - elapsed) / 1000)
      );
      return { allowed: false, retryAfterSeconds };
    }

    tx.set(
      ref,
      {
        count: currentCount + 1,
        updatedAt: nowIso
      },
      { merge: true }
    );
    return { allowed: true, retryAfterSeconds: 0 };
  });
}

/**
 * Sends invoice email and updates send tracking fields.
 * Endpoint keeps error messages user-friendly for non-technical operators.
 */
export async function POST(
  request: Request,
  context: RouteContext
): Promise<NextResponse<ApiResponse<{ sentAt: string; sentCount: number }>>> {
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

  const { id } = await context.params;
  const invoice = await findGarageInvoiceById(garageId, id);

  if (!invoice) {
    return response({ success: false, error: 'Invoice not found.' }, 404);
  }

  const body = await request.json().catch(() => ({}));
  const parsed = sendInvoiceSchema.safeParse(body);

  if (!parsed.success) {
    return response(
      {
        success: false,
        error: parsed.error.issues[0]?.message ?? 'Invalid payload.'
      },
      400
    );
  }

  const customer = invoice.customerId
    ? await findGarageCustomerById(garageId, invoice.customerId)
    : null;

  const recipientEmail =
    parsed.data.recipientEmail?.trim() ||
    invoice.customerEmail?.trim() ||
    customer?.email?.trim() ||
    '';

  if (!recipientEmail) {
    return response(
      {
        success: false,
        error: 'Customer email is required before sending invoice.'
      },
      400
    );
  }

  const quota = await consumeGarageInvoiceEmailRateLimit(garageId);
  if (!quota.allowed) {
    return NextResponse.json(
      {
        success: false,
        error:
          'To prevent accidental duplicate emails and protect your account, invoice emails can only be sent a few times within a short period.'
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(quota.retryAfterSeconds)
        }
      }
    );
  }

  const shareToken = randomBytes(32).toString('hex');
  const shareTokenHash = sha256(shareToken);
  await createGarageInvoicePublicShare({
    garageId,
    invoiceId: invoice.id,
    tokenHash: shareTokenHash,
    publicToken: shareToken,
    createdByUserId: session.user.id,
    expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
  });

  const publicInvoiceLink = `${env.NEXTAUTH_URL}/invoice/${shareToken}`;
  const sent = await sendInvoiceEmail({
    recipientEmail,
    garageName: garage.name,
    customerName: invoice.customerName,
    invoiceNumber: invoice.invoiceNumber,
    orderCode: invoice.orderCode,
    paymentTerm: invoice.paymentTerm,
    issuedAt: new Date(invoice.issuedAt),
    total: invoice.total,
    subtotal: invoice.subtotal,
    taxLabel: invoice.tax.label,
    taxRate: invoice.tax.rate,
    taxAmount: invoice.tax.amount,
    dueDate: new Date(invoice.dueDate),
    lineItems: invoice.lineItems.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      amount: item.amount
    })),
    invoiceLink: publicInvoiceLink,
    supportEmail: env.NEXT_PUBLIC_APP_SUPPORT_EMAIL
  });

  if (!sent) {
    return response(
      {
        success: false,
        error:
          'Could not send invoice right now. Please check email setup and try again.'
      },
      400
    );
  }

  const updated = await markGarageInvoiceSent(garageId, invoice.id);
  if (!updated) {
    return response({ success: false, error: 'Invoice not found.' }, 404);
  }

  // Keep invoice snapshot/customer contact in sync after successful send.
  await updateGarageInvoiceCustomerEmail(garageId, invoice.id, recipientEmail);
  if (invoice.customerId && customer?.email?.trim() !== recipientEmail) {
    await updateGarageCustomer(garageId, invoice.customerId, {
      email: recipientEmail
    });
  }

  return response({ success: true, data: updated });
}
