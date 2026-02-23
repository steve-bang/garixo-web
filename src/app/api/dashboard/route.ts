import { NextResponse } from 'next/server';

import { dateRangeSchema } from '@/features/dashboard/schema';
import type { DashboardResponse } from '@/features/dashboard/types';
import { auth } from '@/lib/auth';
import { getRequestGarageId } from '@/lib/auth/garage-context';
import {
  getDashboardOverviewSummary,
  getRevenueSummary
} from '@/services/firebase/dashboard-summary-service';
import type { ApiResponse } from '@/types/api';

function response<T>(
  payload: ApiResponse<T>,
  status = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(payload, { status });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function GET(
  request: Request
): Promise<NextResponse<ApiResponse<DashboardResponse>>> {
  const session = await auth();
  if (!session?.user?.id) {
    return response({ success: false, error: 'Unauthorized' }, 401);
  }

  const garageId = await getRequestGarageId(session);
  if (!garageId) {
    return response({ success: false, error: 'Garage not found.' }, 404);
  }

  const url = new URL(request.url);

  const parsed = dateRangeSchema.safeParse(
    url.searchParams.get('range') ?? 'today'
  );

  if (!parsed.success) {
    return response({ success: false, error: 'Invalid date range.' }, 400);
  }

  const range = parsed.data;

  const delay = 500 + Math.floor(Math.random() * 300);
  await sleep(delay);

  const [overview, revenue] = await Promise.all([
    getDashboardOverviewSummary(garageId),
    getRevenueSummary(garageId)
  ]);

  const payload: DashboardResponse = {
    kpi: {
      todayRevenue: overview.todayRevenue,
      vehiclesToday: overview.carsInShop,
      activeOrders: overview.activeWorkOrders,
      overdueOrders: overview.stuckJobs
    },
    secondary: {
      revenueThisWeek: revenue.today.totalRevenue,
      averageTicket:
        revenue.today.paidCount > 0
          ? Number(
              (revenue.today.totalRevenue / revenue.today.paidCount).toFixed(2)
            )
          : 0,
      returningCustomersRate: 0,
      workerUtilization: 0
    },
    revenueTrend: [],
    statusDistribution: {
      draft: 0,
      inProgress: overview.carsInShop,
      completed: overview.readyForPickup,
      paid: revenue.today.paidCount
    },
    todayOrders: [],
    topWorkers: []
  };

  void range;

  return response({ success: true, data: payload });
}
