'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { inventoryQueryKey } from '@/features/inventory/api';
import {
  adjustInventory,
  createInventoryItem,
  deleteInventoryItem,
  getInventory,
  updateInventoryItem,
  type GetInventoryParams
} from '@/features/inventory/service';
import type { AdjustInventoryInput, CreateInventoryInput, UpdateInventoryInput } from '@/features/inventory/schema';
import type { InventoryItem, InventoryKpis, InventoryListResponse } from '@/features/inventory/types';
import { getStockStatus } from '@/features/inventory/utils';

export function useInventory(params: GetInventoryParams) {
  return useQuery({
    queryKey: [...inventoryQueryKey, params],
    queryFn: () => getInventory(params)
  });
}

export function toInventoryKpis(items: InventoryItem[]): InventoryKpis {
  return {
    totalItems: items.length,
    inStock: items.filter((item) => getStockStatus(item) === 'IN_STOCK').length,
    lowStock: items.filter((item) => getStockStatus(item) === 'LOW_STOCK').length,
    outOfStock: items.filter((item) => getStockStatus(item) === 'OUT_OF_STOCK').length
  };
}

export function useCreateInventoryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateInventoryInput) => createInventoryItem(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryQueryKey });
    }
  });
}

export function useUpdateInventoryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Omit<UpdateInventoryInput, 'id'> }) => updateInventoryItem(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryQueryKey });
    }
  });
}

export function useDeleteInventoryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteInventoryItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryQueryKey });
    }
  });
}

export function useAdjustInventory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AdjustInventoryInput) => adjustInventory(input),
    onMutate: async (input) => {
      const snapshot = queryClient.getQueriesData({ queryKey: inventoryQueryKey });

      queryClient.setQueriesData({ queryKey: inventoryQueryKey }, (old: unknown) => {
        const typed = old as InventoryListResponse | undefined;

        if (!typed?.items) {
          return old;
        }

        return {
          ...typed,
          items: typed.items.map((item) => {
            if (item.id !== input.id) {
              return item;
            }

            const quantity = input.type === 'ADD' ? item.quantity + input.amount : item.quantity - input.amount;

            return {
              ...item,
              quantity: Math.max(0, quantity),
              updatedAt: new Date().toISOString()
            };
          })
        };
      });

      return { snapshot };
    },
    onError: (_error, _input, context) => {
      context?.snapshot.forEach(([key, value]) => {
        queryClient.setQueryData(key, value);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryQueryKey });
    }
  });
}
