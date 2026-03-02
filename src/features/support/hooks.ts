'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  adminSupportTicketsQueryKey,
  supportTicketsQueryKey
} from '@/features/support/api';
import {
  createSupportTicket,
  getAdminSupportTicket,
  getAdminSupportTickets,
  getSupportTickets,
  updateAdminSupportTicketStatus
} from '@/features/support/service';
import type { CreateSupportTicketInput } from '@/features/support/schema';
import type { AdminSupportTicketsQuery } from '@/features/support/types';

export function useSupportTickets(limit = 10) {
  return useQuery({
    queryKey: [...supportTicketsQueryKey, 'list', limit],
    queryFn: () => getSupportTickets(limit)
  });
}

export function useCreateSupportTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      input: CreateSupportTicketInput & { screenshotFile?: File | null }
    ) => createSupportTicket(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supportTicketsQueryKey });
    }
  });
}

export function useAdminSupportTickets(params: AdminSupportTicketsQuery) {
  return useQuery({
    queryKey: [...adminSupportTicketsQueryKey, 'list', params],
    queryFn: () => getAdminSupportTickets(params)
  });
}

export function useAdminSupportTicket(garageId: string, ticketId: string) {
  return useQuery({
    queryKey: [...adminSupportTicketsQueryKey, 'detail', garageId, ticketId],
    queryFn: () => getAdminSupportTicket(garageId, ticketId),
    enabled: Boolean(garageId && ticketId)
  });
}

export function useUpdateAdminSupportTicketStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      garageId,
      ticketId,
      status
    }: {
      garageId: string;
      ticketId: string;
      status: 'open' | 'resolved';
    }) => updateAdminSupportTicketStatus(garageId, ticketId, status),
    onSuccess: (updated) => {
      queryClient.setQueryData(
        [
          ...adminSupportTicketsQueryKey,
          'detail',
          updated.garageId,
          updated.id
        ],
        updated
      );
      queryClient.invalidateQueries({ queryKey: adminSupportTicketsQueryKey });
    }
  });
}
