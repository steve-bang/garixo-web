import type {
  ISODateString,
  PaginatedResponse,
  PaginationMeta
} from '@/types/primitives';

export type CustomerStatus = 'ACTIVE' | 'INACTIVE' | 'VIP';

export type SpendingTier = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Vehicle {
  id: string;
  plate: string;
  brand: string;
  model?: string;
  year?: number;
  color?: string;
  lastServiceDate?: ISODateString;
}

export type CustomerVehicle = Vehicle;

export interface CustomerServiceRecord {
  id: string;
  date: ISODateString;
  vehiclePlate: string;
  serviceName: string;
  amount: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  status: CustomerStatus;
  totalVehicles: number;
  totalVisits: number;
  totalSpent: number;
  lastVisit?: ISODateString | null;
  notes?: string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export type CustomerListMeta = PaginationMeta;

export type CustomerListResponse = PaginatedResponse<Customer>;

export type CustomerDetailResponse = {
  customer: Customer;
  vehicles: CustomerVehicle[];
  serviceHistory: CustomerServiceRecord[];
};

export type CustomerKpis = {
  totalCustomers: number;
  activeThisMonth: number;
  returningRate: number;
  topSpender: number;
};
