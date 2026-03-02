import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { adminSupportTicketsQuerySchema } from '@/features/support/schema';
import type { SupportTicketListResponse } from '@/features/support/types';
import { listAllSupportTicketsForAdmin } from '@/services/firebase/support-tickets-service';
import type { ApiResponse } from '@/types/api';

function response<T>(
  payload: ApiResponse<T>,
  status = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(payload, { status });
}

/**
 * Admin support queue endpoint.
 * Query scope: collectionGroup('supportTickets') across all garages.
 */
export async function GET(
  request: Request
): Promise<NextResponse<ApiResponse<SupportTicketListResponse>>> {
  const session = await auth();

  if (!session?.user?.id) {
    return response({ success: false, error: 'Unauthorized' }, 401);
  }

  if (session.user.role !== 'admin') {
    return response({ success: false, error: 'Forbidden' }, 403);
  }

  const url = new URL(request.url);
  const parsed = adminSupportTicketsQuerySchema.safeParse({
    status: url.searchParams.get('status') ?? undefined,
    type: url.searchParams.get('type') ?? undefined,
    date: url.searchParams.get('date') ?? undefined,
    page: url.searchParams.get('page') ?? undefined,
    pageSize: url.searchParams.get('pageSize') ?? undefined
  });

  if (!parsed.success) {
    return response(
      {
        success: false,
        error: parsed.error.issues[0]?.message ?? 'Invalid query.'
      },
      400
    );
  }

  const result = await listAllSupportTicketsForAdmin(parsed.data);
  return response({ success: true, data: result });
}
