import type {
  ISODateString,
  PaginatedResponse,
  PaginationMeta
} from '@/types/primitives';
import type {
  OrderPart,
  OrderService,
  PaymentMethod,
  WorkOrderStatus
} from '@/features/work-orders/types';

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
  images?: VehicleImage[];
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface VehicleImage {
  id: string;
  url: string;
  path: string;
  name: string;
  contentType: 'image/jpeg' | 'image/png' | 'image/webp';
  size: number;
  uploadedByUserId: string;
  uploadedAt: ISODateString;
}

export interface VehicleServiceRecord {
  id: string;
  vehicleId: string;
  date: ISODateString;
  serviceName: string;
  amount: number;
  status: 'OPEN' | 'DONE';
}

export interface VehicleWorkOrderHistoryRecord {
  id: string;
  workOrderId: string;
  vehicleId: string;
  orderCode: string;
  plateNumber: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  workerId?: string;
  workerName?: string;
  services: OrderService[];
  parts: OrderPart[];
  totalAmount: number;
  status: WorkOrderStatus;
  notes?: string;
  paymentMethod?: PaymentMethod;
  completedAt?: ISODateString | null;
  paidAt?: ISODateString | null;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export type VehicleListMeta = PaginationMeta;

export type VehicleListResponse = PaginatedResponse<Vehicle>;

export type VehicleKpis = {
  totalVehicles: number;
  inService: number;
  overdue: number;
  totalRevenue: number;
};
