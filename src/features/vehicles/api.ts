export {
  createVehicle,
  deleteVehicle,
  getVehicleById,
  getVehicleServices,
  getVehicleWorkOrderHistory,
  getVehicles,
  updateVehicle
} from '@/features/vehicles/service';

export const vehiclesQueryKey = ['vehicles'] as const;
