import { NextResponse } from 'next/server';

import { dateRangeSchema } from '@/features/dashboard/schema';
import type { DashboardResponse } from '@/features/dashboard/types';
import { createDashboardMock } from '@/mocks/dashboard.mock';
import type { ApiResponse } from '@/types/api';

function response<T>(payload: ApiResponse<T>, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json(payload, { status });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function GET(request: Request): Promise<NextResponse<ApiResponse<DashboardResponse>>> {
  const url = new URL(request.url);

  const parsed = dateRangeSchema.safeParse(url.searchParams.get('range') ?? 'today');

  if (!parsed.success) {
    return response({ success: false, error: 'Invalid date range.' }, 400);
  }

  const range = parsed.data;
  const from = url.searchParams.get('from') ?? undefined;
  const to = url.searchParams.get('to') ?? undefined;

  const delay = 500 + Math.floor(Math.random() * 300);
  await sleep(delay);

  return response({ success: true, data: createDashboardMock(range, from, to) });
}
