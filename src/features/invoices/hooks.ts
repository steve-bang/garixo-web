'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { invoicesQueryKey } from '@/features/invoices/api';
import {
  createInvoiceFromWorkOrder,
  getInvoiceById,
  getInvoices,
  sendInvoice,
  updateInvoice,
  type GetInvoicesParams
} from '@/features/invoices/service';
import type {
  CreateInvoiceFromWorkOrderInput,
  SendInvoiceInput,
  UpdateInvoiceInput
} from '@/features/invoices/types';

export function useInvoices(params: GetInvoicesParams) {
  return useQuery({
    queryKey: [...invoicesQueryKey, 'list', params],
    queryFn: () => getInvoices(params)
  });
}

export function useInvoice(id?: string) {
  return useQuery({
    queryKey: [...invoicesQueryKey, 'detail', id],
    queryFn: () => getInvoiceById(id as string),
    enabled: Boolean(id)
  });
}

export function useCreateInvoiceFromWorkOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateInvoiceFromWorkOrderInput) =>
      createInvoiceFromWorkOrder(input),
    onSuccess: (invoice) => {
      queryClient.setQueryData(
        [...invoicesQueryKey, 'detail', invoice.id],
        invoice
      );
      queryClient.invalidateQueries({ queryKey: invoicesQueryKey });
    }
  });
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload
    }: {
      id: string;
      payload: UpdateInvoiceInput;
    }) => updateInvoice(id, payload),
    onSuccess: (invoice) => {
      queryClient.setQueryData(
        [...invoicesQueryKey, 'detail', invoice.id],
        invoice
      );
      queryClient.invalidateQueries({ queryKey: invoicesQueryKey });
    }
  });
}

export function useSendInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload?: SendInvoiceInput }) =>
      sendInvoice(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoicesQueryKey });
    }
  });
}
