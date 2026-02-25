import type {
  ISODateString,
  PaginatedResponse,
  PaginationMeta
} from '@/types/primitives';

export type VehicleStatus =
  | 'ACTIVE'
  | 'IN_SERVICE'
  | 'COMPLETED'
  | 'OVERDUE'
  | 'INACTIVE';

export interface Vehicle {
  id: string;
  plateNumber: string;
  brand?: string;
  model?: string;
  year?: number;
  color?: string;
  vin?: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  status: VehicleStatus;
  totalVisits: number;
  totalSpent: number;
  lastServiceDate?: ISODateString;
  notes?: string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface VehicleServiceRecord {
  id: string;
  vehicleId: string;
  date: ISODateString;
  serviceName: string;
  amount: number;
  status: 'OPEN' | 'DONE';
}

export type VehicleListMeta = PaginationMeta;

export type VehicleListResponse = PaginatedResponse<Vehicle>;

export type VehicleKpis = {
  totalVehicles: number;
  inService: number;
  overdue: number;
  totalRevenue: number;
};
