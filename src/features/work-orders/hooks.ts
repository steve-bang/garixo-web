'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { workOrdersQueryKey } from '@/features/work-orders/api';
import {
  cancelWorkOrder,
  createWorkOrder,
  getWorkOrderById,
  getWorkOrders,
  payWorkOrder,
  updateWorkOrder,
  updateWorkOrderStatus,
  type GetWorkOrdersParams
} from '@/features/work-orders/service';
import type {
  CancelInput,
  CreateWorkOrderInput,
  PaymentInput,
  UpdateStatusInput,
  UpdateWorkOrderInput
} from '@/features/work-orders/schema';
import type { WorkOrder, Worker } from '@/features/work-orders/types';
import { toSummary } from '@/features/work-orders/utils';

export function useWorkOrders(params: GetWorkOrdersParams) {
  return useQuery({
    queryKey: [...workOrdersQueryKey, 'list', params],
    queryFn: () => getWorkOrders(params)
  });
}

export function useWorkOrder(id?: string) {
  return useQuery({
    queryKey: [...workOrdersQueryKey, 'detail', id],
    queryFn: () => getWorkOrderById(id as string),
    enabled: Boolean(id)
  });
}

export function useWorkOrdersSummary(items: WorkOrder[], workers: Worker[]) {
  return toSummary(items, workers);
}

export function useCreateWorkOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateWorkOrderInput) => createWorkOrder(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workOrdersQueryKey });
    }
  });
}

export function useUpdateWorkOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Omit<UpdateWorkOrderInput, 'id'> }) => updateWorkOrder(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workOrdersQueryKey });
    }
  });
}

export function useUpdateWorkOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateStatusInput }) => updateWorkOrderStatus(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workOrdersQueryKey });
    }
  });
}

export function usePayWorkOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: PaymentInput }) => payWorkOrder(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workOrdersQueryKey });
    }
  });
}

export function useCancelWorkOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CancelInput }) => cancelWorkOrder(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workOrdersQueryKey });
    }
  });
}
