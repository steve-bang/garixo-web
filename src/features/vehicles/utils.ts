import type {
  VehicleServiceRecord,
  Vehicle,
  VehicleKpis
} from '@/features/vehicles/types';

export function normalizePlate(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export function toPlateDisplay(value: string): string {
  return value.trim().toUpperCase();
}

export function formatVehicleLabel(vehicle: Vehicle): string {
  const parts = [
    vehicle.brand,
    vehicle.model,
    vehicle.year ? String(vehicle.year) : undefined
  ].filter(Boolean);
  return parts.length ? parts.join(' ') : '-';
}

export function toVehicleKpis(items: Vehicle[]): VehicleKpis {
  return {
    totalVehicles: items.length,
    inService: items.filter((item) => item.status === 'IN_SERVICE').length,
    overdue: items.filter((item) => item.status === 'OVERDUE').length,
    totalRevenue: items.reduce((sum, item) => sum + item.totalSpent, 0)
  };
}

export function averageTicket(vehicle: Vehicle): number {
  if (vehicle.totalVisits <= 0) {
    return 0;
  }

  return Math.round(vehicle.totalSpent / vehicle.totalVisits);
}

export function latestService(
  records: VehicleServiceRecord[]
): VehicleServiceRecord[] {
  return [...records]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);
}
