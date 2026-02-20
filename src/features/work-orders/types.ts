export type WorkOrderStatus =
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'WAITING_PARTS'
  | 'READY_FOR_PAYMENT'
  | 'COMPLETED'
  | 'CANCELLED';

export type PriorityLevel = 'NORMAL' | 'HIGH' | 'URGENT';

export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'QR';

export interface Worker {
  id: string;
  name: string;
  avatar?: string;
  activeJobs: number;
}

export interface OrderService {
  id: string;
  name: string;
  price: number;
}

export interface OrderPart {
  id: string;
  partName: string;
  quantity: number;
  unitPrice: number;
}

export interface TimelineEvent {
  status: WorkOrderStatus;
  timestamp: string;
}

export interface WorkOrder {
  id: string;
  orderCode: string;
  plateNumber: string;
  customerName: string;
  customerPhone: string;
  workerId?: string;
  workerName?: string;
  services: OrderService[];
  parts: OrderPart[];
  status: WorkOrderStatus;
  priority: PriorityLevel;
  estimatedTimeMinutes?: number;
  estimatedFinish?: string;
  totalAmount: number;
  isOverdue: boolean;
  timeline: TimelineEvent[];
  notes?: string;
  cancellationReason?: string;
  paymentMethod?: PaymentMethod;
  createdAt: string;
  updatedAt: string;
}

export type WorkOrderGroup = Record<Exclude<WorkOrderStatus, 'CANCELLED'>, WorkOrder[]>;

export type WorkOrdersMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type WorkOrdersResponse = {
  items: WorkOrder[];
  grouped: WorkOrderGroup;
  workers: Worker[];
  meta: WorkOrdersMeta;
};

export type WorkOrderSummary = {
  totalActiveJobs: number;
  completedToday: number;
  overdueJobs: number;
  busyWorkers: number;
};
