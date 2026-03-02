'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { vehiclesQueryKey } from '@/features/vehicles/api';
import {
  createVehicle,
  deleteVehicleImage,
  deleteVehicle,
  getVehicleById,
  getVehicles,
  getVehicleServices,
  getVehicleWorkOrderHistory,
  uploadVehicleImage,
  updateVehicle,
  type GetVehiclesParams
} from '@/features/vehicles/service';
import type {
  CreateVehicleInput,
  UpdateVehicleInput
} from '@/features/vehicles/schema';
import type { Vehicle } from '@/features/vehicles/types';
import { toVehicleKpis } from '@/features/vehicles/utils';

export function useVehicles(params: GetVehiclesParams) {
  return useQuery({
    queryKey: [...vehiclesQueryKey, 'list', params],
    queryFn: () => getVehicles(params)
  });
}

export function useVehicleDetail(id?: string) {
  return useQuery({
    queryKey: [...vehiclesQueryKey, 'detail', id],
    queryFn: () => getVehicleById(id as string),
    enabled: Boolean(id)
  });
}

export function useVehicleServices(id?: string) {
  return useQuery({
    queryKey: [...vehiclesQueryKey, 'services', id],
    queryFn: () => getVehicleServices(id as string),
    enabled: Boolean(id)
  });
}

export function useVehicleWorkOrderHistory(id?: string) {
  return useQuery({
    queryKey: [...vehiclesQueryKey, 'work-order-history', id],
    queryFn: () => getVehicleWorkOrderHistory(id as string),
    enabled: Boolean(id)
  });
}

export function useVehicleKpis(items: Vehicle[]) {
  return toVehicleKpis(items);
}

export function useCreateVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateVehicleInput) => createVehicle(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vehiclesQueryKey });
    }
  });
}

export function useUpdateVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload
    }: {
      id: string;
      payload: Omit<UpdateVehicleInput, 'id'>;
    }) => updateVehicle(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vehiclesQueryKey });
    }
  });
}

export function useDeleteVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteVehicle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vehiclesQueryKey });
    }
  });
}

export function useUploadVehicleImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ vehicleId, file }: { vehicleId: string; file: File }) =>
      uploadVehicleImage(vehicleId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vehiclesQueryKey });
    }
  });
}

export function useDeleteVehicleImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      vehicleId,
      imageId
    }: {
      vehicleId: string;
      imageId: string;
    }) => deleteVehicleImage(vehicleId, imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vehiclesQueryKey });
    }
  });
}
