import type { ServiceRecord, Vehicle, VehicleStatus } from '@/features/vehicles/types';
import { normalizePlate } from '@/features/vehicles/utils';

const firstNames = ['Nguyen', 'Tran', 'Le', 'Pham', 'Hoang', 'Vo', 'Do', 'Bui', 'Dang', 'Phan'];
const middleNames = ['Van', 'Thi', 'Gia', 'Quoc', 'Thanh', 'Minh', 'Anh', 'Bao'];
const lastNames = ['Minh', 'Lan', 'Hung', 'Tuan', 'Anh', 'Huong', 'Duc', 'Nam', 'Mai', 'Huy'];
const brands = ['Toyota', 'Honda', 'Hyundai', 'Ford', 'Kia', 'Mazda', 'Mitsubishi'];
const modelsByBrand: Record<string, string[]> = {
  Toyota: ['Vios', 'Corolla Cross', 'Fortuner', 'Innova'],
  Honda: ['City', 'Civic', 'CR-V', 'Brio'],
  Hyundai: ['Accent', 'Elantra', 'Tucson', 'Santa Fe'],
  Ford: ['Ranger', 'Everest', 'Territory'],
  Kia: ['K3', 'Seltos', 'Sportage'],
  Mazda: ['Mazda2', 'Mazda3', 'CX-5'],
  Mitsubishi: ['Xpander', 'Attrage', 'Outlander']
};
const colors = ['White', 'Black', 'Silver', 'Gray', 'Blue', 'Red'];
const serviceNames = ['Oil Change', 'Brake Service', 'Engine Check', 'Battery Replacement', 'Tire Rotation', 'AC Service'];

function toIsoDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

function buildName(index: number): string {
  return `${firstNames[index % firstNames.length]} ${middleNames[(index * 2) % middleNames.length]} ${lastNames[(index * 3) % lastNames.length]}`;
}

function buildPhone(index: number): string {
  return `09${String(10000000 + index * 137).slice(0, 8)}`;
}

function buildPlate(index: number): string {
  const prefixes = ['29A', '30F', '51H', '43B', '60K', '88A'];
  const prefix = prefixes[index % prefixes.length];
  const tail = String(10000 + index * 73).slice(-5);
  return `${prefix}-${tail}`;
}

function buildStatus(index: number): VehicleStatus {
  if (index % 7 === 0) return 'IN_SERVICE';
  if (index % 9 === 0) return 'OVERDUE';
  if (index % 5 === 0) return 'COMPLETED';
  if (index % 13 === 0) return 'INACTIVE';
  return 'ACTIVE';
}

function buildServices(vehicleId: string, index: number): ServiceRecord[] {
  const count = index % 6 === 0 ? 0 : (index % 21);

  return Array.from({ length: count }).map((_, serviceIndex) => {
    const amount = 900_000 + ((index + serviceIndex * 5) % 18) * 650_000;

    return {
      id: `vs-${vehicleId}-${serviceIndex}`,
      vehicleId,
      date: toIsoDaysAgo(index * 2 + serviceIndex * 11 + 1),
      serviceName: serviceNames[(index + serviceIndex) % serviceNames.length],
      amount,
      status: serviceIndex % 4 === 0 ? 'OPEN' : 'DONE'
    };
  });
}

const generated = Array.from({ length: 64 }).map((_, index) => {
  const id = `veh-${index + 1}`;
  const brand = brands[index % brands.length];
  const model = modelsByBrand[brand][index % modelsByBrand[brand].length];
  const serviceHistory = buildServices(id, index + 1);
  const totalVisits = serviceHistory.length;
  const totalSpent = serviceHistory.reduce((sum, item) => sum + item.amount, 0);
  const sortedHistory = [...serviceHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const vehicle: Vehicle = {
    id,
    plateNumber: buildPlate(index + 1),
    brand,
    model,
    year: 2015 + (index % 11),
    color: colors[index % colors.length],
    vin: index % 4 === 0 ? undefined : `VIN${String(100000 + index * 99)}`,
    customerId: `cus-${index + 1}`,
    customerName: buildName(index + 1),
    customerPhone: buildPhone(index + 1),
    status: buildStatus(index + 1),
    totalVisits,
    totalSpent,
    lastServiceDate: sortedHistory[0]?.date,
    notes: index % 8 === 0 ? 'Owner prefers morning slots.' : undefined,
    createdAt: toIsoDaysAgo(220 + index),
    updatedAt: toIsoDaysAgo(index % 14)
  };

  return { vehicle, serviceHistory };
});

export let vehiclesDB: Vehicle[] = generated.map((item) => item.vehicle);

export let vehicleServicesDB: Record<string, ServiceRecord[]> = Object.fromEntries(
  generated.map((item) => [item.vehicle.id, item.serviceHistory])
);

export function findVehicleByNormalizedPlate(plateNumber: string): Vehicle | undefined {
  const normalizedPlate = normalizePlate(plateNumber);
  return vehiclesDB.find((item) => normalizePlate(item.plateNumber) === normalizedPlate);
}
