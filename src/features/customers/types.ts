export type CustomerStatus = 'ACTIVE' | 'INACTIVE' | 'VIP';

export type SpendingTier = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Vehicle {
  id: string;
  plate: string;
  brand: string;
  model?: string;
  year?: number;
  color?: string;
  lastServiceDate?: string;
}

export interface ServiceRecord {
  id: string;
  date: string;
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
  vehicles: Vehicle[];
  totalVisits: number;
  totalSpent: number;
  lastVisit?: string | null;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type CustomerListMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type CustomerListResponse = {
  items: Customer[];
  meta: CustomerListMeta;
};

export type CustomerDetailResponse = {
  customer: Customer;
  serviceHistory: ServiceRecord[];
};

export type CustomerKpis = {
  totalCustomers: number;
  activeThisMonth: number;
  returningRate: number;
  topSpender: number;
};
