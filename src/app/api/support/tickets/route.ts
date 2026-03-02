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
import { firebaseAdmin } from '@/lib/firebase-admin';
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

const SUPPORT_TICKET_USER_LIMIT = 5;
const SUPPORT_TICKET_USER_WINDOW_MS = 10 * 60 * 1000;
const SUPPORT_TICKET_GARAGE_LIMIT = 20;
const SUPPORT_TICKET_GARAGE_WINDOW_MS = 60 * 60 * 1000;

type SupportTicketRateLimitDoc = {
  windowStartAt: string;
  count: number;
  updatedAt: string;
  expiresAt: string;
};

function supportTicketRateLimitRef(garageId: string, key: string) {
  return firebaseAdmin.db
    .collection('garages')
    .doc(garageId)
    .collection('rate-limits')
    .doc(`support-ticket:${key}`);
}

function evaluateRateLimitBucket(params: {
  current: Partial<SupportTicketRateLimitDoc> | null;
  now: number;
  nowIso: string;
  windowMs: number;
  limit: number;
}): {
  allowed: boolean;
  retryAfterSeconds: number;
  next: SupportTicketRateLimitDoc | null;
} {
  const { current, now, nowIso, windowMs, limit } = params;
  const windowStartMs = new Date(current?.windowStartAt ?? nowIso).getTime();
  const elapsed = now - windowStartMs;
  const isWindowExpired =
    !Number.isFinite(windowStartMs) || elapsed >= windowMs;

  if (isWindowExpired) {
    return {
      allowed: true,
      retryAfterSeconds: 0,
      next: {
        windowStartAt: nowIso,
        count: 1,
        updatedAt: nowIso,
        expiresAt: new Date(now + windowMs + 5 * 60 * 1000).toISOString()
      }
    };
  }

  const count = Math.max(0, Number(current?.count) || 0);
  if (count >= limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((windowMs - elapsed) / 1000)),
      next: null
    };
  }

  return {
    allowed: true,
    retryAfterSeconds: 0,
    next: {
      windowStartAt: current?.windowStartAt ?? nowIso,
      count: count + 1,
      updatedAt: nowIso,
      expiresAt: new Date(now + windowMs + 5 * 60 * 1000).toISOString()
    }
  };
}

/**
 * Consumes support-ticket request quota from two buckets:
 * - per-user (short window)
 * - per-garage (hourly window)
 * Transaction keeps concurrent submissions safe.
 */
async function consumeSupportTicketRateLimit(params: {
  garageId: string;
  userId: string;
}): Promise<{ allowed: boolean; retryAfterSeconds: number }> {
  const { garageId, userId } = params;
  const userRef = supportTicketRateLimitRef(garageId, `user:${userId}`);
  const garageRef = supportTicketRateLimitRef(garageId, 'garage');
  const now = Date.now();
  const nowIso = new Date(now).toISOString();

  return firebaseAdmin.db.runTransaction(async (tx: any) => {
    const [userSnap, garageSnap] = await Promise.all([
      tx.get(userRef),
      tx.get(garageRef)
    ]);

    const userResult = evaluateRateLimitBucket({
      current: userSnap.exists
        ? (userSnap.data() as Partial<SupportTicketRateLimitDoc>)
        : null,
      now,
      nowIso,
      windowMs: SUPPORT_TICKET_USER_WINDOW_MS,
      limit: SUPPORT_TICKET_USER_LIMIT
    });

    const garageResult = evaluateRateLimitBucket({
      current: garageSnap.exists
        ? (garageSnap.data() as Partial<SupportTicketRateLimitDoc>)
        : null,
      now,
      nowIso,
      windowMs: SUPPORT_TICKET_GARAGE_WINDOW_MS,
      limit: SUPPORT_TICKET_GARAGE_LIMIT
    });

    if (!userResult.allowed || !garageResult.allowed) {
      return {
        allowed: false,
        retryAfterSeconds: Math.max(
          userResult.retryAfterSeconds,
          garageResult.retryAfterSeconds
        )
      };
    }

    if (userResult.next) {
      tx.set(userRef, userResult.next, { merge: true });
    }
    if (garageResult.next) {
      tx.set(garageRef, garageResult.next, { merge: true });
    }

    return { allowed: true, retryAfterSeconds: 0 };
  });
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

  const quota = await consumeSupportTicketRateLimit({
    garageId,
    userId: session.user.id
  });
  if (!quota.allowed) {
    return NextResponse.json(
      {
        success: false,
        error:
          'You have sent several requests in a short time. Please wait a few minutes and try again.'
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(quota.retryAfterSeconds)
        }
      }
    );
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
