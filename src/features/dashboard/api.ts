import { dashboardResponseSchema } from '@/features/dashboard/schema';
import type { DashboardResponse, DateRange } from '@/features/dashboard/types';
import type { ApiResponse } from '@/types/api';

export type FetchDashboardParams = {
  range: DateRange;
  from?: string;
  to?: string;
};

export async function fetchDashboardOverview(params: FetchDashboardParams): Promise<DashboardResponse> {
  const query = new URLSearchParams();
  query.set('range', params.range);

  if (params.from) query.set('from', params.from);
  if (params.to) query.set('to', params.to);

  const response = await fetch(`/api/dashboard?${query.toString()}`);
  const payload = (await response.json()) as ApiResponse<DashboardResponse>;

  if (!payload.success || payload.data === undefined) {
    throw new Error(payload.error ?? 'Could not load dashboard data.');
  }

  return dashboardResponseSchema.parse(payload.data);
}
