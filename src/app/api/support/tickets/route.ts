import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { getRequestGarageId } from '@/lib/auth/garage-context';
import {
  CdnValidationError,
  uploadGarageSupportTicketScreenshotToCdn
} from '@/services/cdn/firebase-cdn-service';
import { createSupportTicketSchema } from '@/features/support/schema';
import type { SupportTicket } from '@/features/support/types';
import {
  createGarageSupportTicket,
  listGarageSupportTickets
} from '@/services/firebase/support-tickets-service';
import type { ApiResponse } from '@/types/api';

function response<T>(
  payload: ApiResponse<T>,
  status = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(payload, { status });
}

export async function GET(
  request: Request
): Promise<NextResponse<ApiResponse<SupportTicket[]>>> {
  const session = await auth();
  if (!session?.user?.id) {
    return response({ success: false, error: 'Unauthorized' }, 401);
  }

  const garageId = await getRequestGarageId(session);
  if (!garageId) {
    return response({ success: false, error: 'Garage not found.' }, 404);
  }

  const url = new URL(request.url);
  const parsedLimit = Number(url.searchParams.get('limit') ?? '10');
  const limit = Number.isFinite(parsedLimit) ? parsedLimit : 10;

  const tickets = await listGarageSupportTickets(garageId, limit);
  return response({ success: true, data: tickets });
}

/**
 * Creates a support ticket from dashboard owners/staff.
 * Payload is multipart to allow optional screenshot upload.
 */
export async function POST(
  request: Request
): Promise<NextResponse<ApiResponse<SupportTicket>>> {
  const session = await auth();
  if (!session?.user?.id) {
    return response({ success: false, error: 'Unauthorized' }, 401);
  }

  const garageId = await getRequestGarageId(session);
  if (!garageId) {
    return response({ success: false, error: 'Garage not found.' }, 404);
  }

  const contentType = request.headers.get('content-type') ?? '';
  if (!contentType.includes('multipart/form-data')) {
    return response({ success: false, error: 'Invalid payload format.' }, 400);
  }

  const formData = await request.formData();
  const parsed = createSupportTicketSchema.safeParse({
    shortDescription: String(formData.get('shortDescription') ?? ''),
    message: String(formData.get('message') ?? ''),
    type: String(formData.get('type') ?? '') || undefined
  });

  if (!parsed.success) {
    return response(
      {
        success: false,
        error: parsed.error.issues[0]?.message ?? 'Invalid ticket payload.'
      },
      400
    );
  }

  const screenshotFile = formData.get('screenshot');
  const ticketId = randomUUID();
  let screenshot: SupportTicket['screenshot'] = null;

  if (screenshotFile instanceof File && screenshotFile.size > 0) {
    try {
      const uploaded = await uploadGarageSupportTicketScreenshotToCdn({
        garageId,
        ticketId,
        file: screenshotFile
      });

      screenshot = {
        url: uploaded.url,
        path: uploaded.path,
        name: uploaded.name,
        contentType: uploaded.contentType,
        size: uploaded.size
      };
    } catch (error) {
      if (error instanceof CdnValidationError) {
        return response({ success: false, error: error.message }, 400);
      }
      return response(
        { success: false, error: 'Could not upload screenshot right now.' },
        500
      );
    }
  }

  const now = new Date().toISOString();
  const created = await createGarageSupportTicket(garageId, {
    garageId,
    createdByUserId: session.user.id,
    createdByName: session.user.name ?? 'Garage Owner',
    createdByEmail: session.user.email ?? '',
    type: parsed.data.type ?? 'problem',
    shortDescription: parsed.data.shortDescription,
    message: parsed.data.message,
    screenshot,
    status: 'open',
    source: 'dashboard',
    createdAt: now,
    updatedAt: now
  });

  return response({ success: true, data: created }, 201);
}
