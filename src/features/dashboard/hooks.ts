'use client';

import { useQuery } from '@tanstack/react-query';

import { fetchDashboardOverview, type FetchDashboardParams } from '@/features/dashboard/api';

export function useDashboardOverview(params: FetchDashboardParams) {
  return useQuery({
    queryKey: ['dashboard', 'overview', params],
    queryFn: () => fetchDashboardOverview(params)
  });
}
