'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createStaff, disableStaff, getStaff, staffQueryKey, updateStaff } from '@/features/staff/api';
import type { CreateStaffInput, DeleteStaffInput, UpdateStaffInput } from '@/features/staff/schema';
import type { Staff, StaffKpis } from '@/features/staff/types';

function toKpis(staff: Staff[]): StaffKpis {
  return {
    totalStaff: staff.length,
    activeToday: staff.filter((item) => item.status === 'ACTIVE').length,
    freeStaff: staff.filter((item) => item.currentJobs === 0).length,
    overloadedStaff: staff.filter((item) => item.currentJobs >= 3).length
  };
}

export function useStaff() {
  return useQuery({
    queryKey: staffQueryKey,
    queryFn: getStaff
  });
}

export function useStaffKpis(staff: Staff[]): StaffKpis {
  return toKpis(staff);
}

export function useCreateStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateStaffInput) => createStaff(input),
    onSuccess: (created) => {
      queryClient.setQueryData<Staff[]>(staffQueryKey, (prev) => (prev ? [created, ...prev] : [created]));
    }
  });
}

export function useUpdateStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateStaffInput) => updateStaff(input),
    onMutate: async (input) => {
      const previous = queryClient.getQueryData<Staff[]>(staffQueryKey);

      queryClient.setQueryData<Staff[]>(staffQueryKey, (prev) =>
        prev
          ? prev.map((item) =>
              item.id === input.id
                ? {
                    ...item,
                    ...input,
                    updatedAt: new Date().toISOString()
                  }
                : item
            )
          : prev
      );

      return { previous };
    },
    onError: (_error, _input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(staffQueryKey, context.previous);
      }
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<Staff[]>(staffQueryKey, (prev) =>
        prev ? prev.map((item) => (item.id === updated.id ? updated : item)) : [updated]
      );
    }
  });
}

export function useDisableStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: DeleteStaffInput) => disableStaff(input),
    onSuccess: (updated) => {
      queryClient.setQueryData<Staff[]>(staffQueryKey, (prev) =>
        prev ? prev.map((item) => (item.id === updated.id ? updated : item)) : [updated]
      );
    }
  });
}
