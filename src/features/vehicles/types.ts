export type VehicleStatus = 'ACTIVE' | 'IN_SERVICE' | 'COMPLETED' | 'OVERDUE' | 'INACTIVE';

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
  lastServiceDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceRecord {
  id: string;
  vehicleId: string;
  date: string;
  serviceName: string;
  amount: number;
  status: 'OPEN' | 'DONE';
}

export type VehicleListMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type VehicleListResponse = {
  items: Vehicle[];
  meta: VehicleListMeta;
};

export type VehicleKpis = {
  totalVehicles: number;
  inService: number;
  overdue: number;
  totalRevenue: number;
};
