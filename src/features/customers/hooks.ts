'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { customersQueryKey } from '@/features/customers/api';
import {
  createCustomer,
  deleteCustomer,
  getCustomerById,
  getCustomers,
  updateCustomer,
  type GetCustomersParams
} from '@/features/customers/service';
import type { CreateCustomerInput, UpdateCustomerInput } from '@/features/customers/schema';
import type { Customer, CustomerKpis } from '@/features/customers/types';

export function useCustomers(params: GetCustomersParams) {
  return useQuery({
    queryKey: [...customersQueryKey, 'list', params],
    queryFn: () => getCustomers(params)
  });
}

export function useCustomerDetail(id?: string) {
  return useQuery({
    queryKey: [...customersQueryKey, 'detail', id],
    queryFn: () => getCustomerById(id as string),
    enabled: Boolean(id)
  });
}

export function toCustomerKpis(items: Customer[]): CustomerKpis {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

  const activeThisMonth = items.filter((item) => {
    if (!item.lastVisit) {
      return false;
    }

    const date = new Date(item.lastVisit);
    return date.getMonth() === month && date.getFullYear() === year;
  }).length;

  const returningCount = items.filter((item) => item.totalVisits > 1).length;
  const topSpender = items.reduce((max, item) => Math.max(max, item.totalSpent), 0);

  return {
    totalCustomers: items.length,
    activeThisMonth,
    returningRate: items.length > 0 ? Math.round((returningCount / items.length) * 100) : 0,
    topSpender
  };
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCustomerInput) => createCustomer(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customersQueryKey });
    }
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Omit<UpdateCustomerInput, 'id'> }) => updateCustomer(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customersQueryKey });
    }
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customersQueryKey });
    }
  });
}
