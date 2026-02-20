'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { servicesQueryKey } from '@/features/services/api';
import {
  bulkUpdateServices,
  createService,
  deleteService,
  getServices,
  updateService,
  type GetServicesParams
} from '@/features/services/service';
import type { BulkUpdateInput, CreateServiceInput, UpdateServiceInput } from '@/features/services/schema';
import type { Service, ServiceKpis } from '@/features/services/types';

export function useServices(params: GetServicesParams) {
  return useQuery({
    queryKey: [...servicesQueryKey, params],
    queryFn: () => getServices(params)
  });
}

export function toServiceKpis(items: Service[]): ServiceKpis {
  const totalServices = items.length;
  const activeServices = items.filter((item) => item.status === 'ACTIVE').length;
  const inactiveServices = items.filter((item) => item.status === 'INACTIVE').length;
  const averagePrice = totalServices === 0 ? 0 : Math.round(items.reduce((sum, item) => sum + item.price, 0) / totalServices);

  return {
    totalServices,
    activeServices,
    inactiveServices,
    averagePrice
  };
}

export function useCreateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateServiceInput) => createService(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: servicesQueryKey });
    }
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Omit<UpdateServiceInput, 'id'> }) => updateService(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: servicesQueryKey });
    }
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: servicesQueryKey });
    }
  });
}

export function useBulkUpdateServices() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: BulkUpdateInput) => bulkUpdateServices(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: servicesQueryKey });
    }
  });
}
