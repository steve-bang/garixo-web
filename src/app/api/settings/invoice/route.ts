import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { getRequestGarageId } from '@/lib/auth/garage-context';
import {
  invoiceSettingsSchema,
  type InvoiceSettingsFormValues
} from '@/features/settings/invoice-settings.schema';
import type { InvoiceSettings } from '@/features/settings/invoice-settings.types';
import {
  ensureGarageInvoiceSettings,
  updateGarageInvoiceSettings
} from '@/services/firebase/garage-invoice-settings-service';
import type { ApiResponse } from '@/types/api';

function response<T>(
  payload: ApiResponse<T>,
  status = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(payload, { status });
}

function toInvoiceSettingsResponse(
  data: InvoiceSettingsFormValues & {
    createdAt: string;
    updatedAt: string;
  }
): InvoiceSettings {
  return {
    tax: {
      enabled: data.tax.enabled,
      rate: data.tax.rate,
      label: data.tax.label
    },
    paymentTerm: data.paymentTerm,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt
  };
}

export async function GET(): Promise<
  NextResponse<ApiResponse<InvoiceSettings>>
> {
  const session = await auth();
  if (!session?.user?.id) {
    return response({ success: false, error: 'Unauthorized' }, 401);
  }

  const garageId = await getRequestGarageId(session);
  if (!garageId) {
    return response({ success: false, error: 'Garage not found.' }, 404);
  }

  const settings = await ensureGarageInvoiceSettings(garageId);
  const parsed = invoiceSettingsSchema.safeParse({
    tax: settings.tax,
    paymentTerm: settings.paymentTerm
  });

  if (!parsed.success) {
    return response(
      {
        success: false,
        error: 'Invoice settings are not available right now.'
      },
      500
    );
  }

  return response({
    success: true,
    data: toInvoiceSettingsResponse({
      ...parsed.data,
      createdAt: settings.createdAt,
      updatedAt: settings.updatedAt
    })
  });
}

export async function PUT(
  request: Request
): Promise<NextResponse<ApiResponse<InvoiceSettings>>> {
  const session = await auth();
  if (!session?.user?.id) {
    return response({ success: false, error: 'Unauthorized' }, 401);
  }

  const garageId = await getRequestGarageId(session);
  if (!garageId) {
    return response({ success: false, error: 'Garage not found.' }, 404);
  }

  const body = (await request.json().catch(() => null)) as unknown;
  const parsed = invoiceSettingsSchema.safeParse(body);

  if (!parsed.success) {
    return response(
      {
        success: false,
        error:
          parsed.error.issues[0]?.message ?? 'Invalid invoice settings payload.'
      },
      400
    );
  }

  const updated = await updateGarageInvoiceSettings(garageId, {
    tax: {
      enabled: parsed.data.tax.enabled,
      rate: parsed.data.tax.rate,
      label: parsed.data.tax.label.trim()
    },
    paymentTerm: parsed.data.paymentTerm
  });

  return response({
    success: true,
    data: toInvoiceSettingsResponse({
      tax: {
        enabled: updated.tax.enabled,
        rate: updated.tax.rate,
        label: updated.tax.label
      },
      paymentTerm: updated.paymentTerm,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt
    })
  });
}
