import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import {
  getGarageSupportTicketById,
  updateGarageSupportTicketStatus
} from '@/services/firebase/support-tickets-service';
import type { SupportTicket } from '@/features/support/types';
import type { ApiResponse } from '@/types/api';
import { adminUpdateSupportTicketStatusSchema } from '@/features/support/schema';

type Params = {
  params: Promise<{
    garageId: string;
    ticketId: string;
  }>;
};

function response<T>(
  payload: ApiResponse<T>,
  status = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(payload, { status });
}

/**
 * Admin support ticket detail endpoint.
 * Returns one ticket by garageId + ticketId path for explicit multi-tenant scope.
 */
export async function GET(
  _request: Request,
  { params }: Params
): Promise<NextResponse<ApiResponse<SupportTicket>>> {
  const session = await auth();

  if (!session?.user?.id) {
    return response({ success: false, error: 'Unauthorized' }, 401);
  }

  if (session.user.role !== 'admin') {
    return response({ success: false, error: 'Forbidden' }, 403);
  }

  const { garageId, ticketId } = await params;
  if (!garageId || !ticketId) {
    return response(
      { success: false, error: 'Invalid ticket identifier.' },
      400
    );
  }

  const ticket = await getGarageSupportTicketById(garageId, ticketId);
  if (!ticket) {
    return response(
      { success: false, error: 'Support ticket not found.' },
      404
    );
  }

  return response({ success: true, data: ticket });
}

/**
 * Admin-only status update for one support ticket.
 */
export async function PATCH(
  request: Request,
  { params }: Params
): Promise<NextResponse<ApiResponse<SupportTicket>>> {
  const session = await auth();

  if (!session?.user?.id) {
    return response({ success: false, error: 'Unauthorized' }, 401);
  }

  if (session.user.role !== 'admin') {
    return response({ success: false, error: 'Forbidden' }, 403);
  }

  const { garageId, ticketId } = await params;
  if (!garageId || !ticketId) {
    return response(
      { success: false, error: 'Invalid ticket identifier.' },
      400
    );
  }

  const parsed = adminUpdateSupportTicketStatusSchema.safeParse(
    await request.json()
  );

  if (!parsed.success) {
    return response(
      {
        success: false,
        error: parsed.error.issues[0]?.message ?? 'Invalid request body.'
      },
      400
    );
  }

  const updated = await updateGarageSupportTicketStatus(
    garageId,
    ticketId,
    parsed.data.status
  );

  if (!updated) {
    return response(
      { success: false, error: 'Support ticket not found.' },
      404
    );
  }

  return response({ success: true, data: updated });
}
