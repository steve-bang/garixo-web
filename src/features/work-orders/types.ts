import type {
  ISODateString,
  PaginatedResponse,
  PaginationMeta
} from '@/types/primitives';

export const WorkOrderStatusEnum = {
  Draft: 'Draft',
  WaitingForApproval: 'WaitingForApproval',
  InProgress: 'InProgress',
  WaitingForParts: 'WaitingForParts',
  Completed: 'Completed',
  Paid: 'Paid',
  Cancelled: 'Cancelled'
} as const;

export type WorkOrderStatus =
  (typeof WorkOrderStatusEnum)[keyof typeof WorkOrderStatusEnum];

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
  timestamp: ISODateString;
}

export interface WorkOrder {
  id: string;
  orderCode: string;
  plateNumber: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  vehicleId?: string;
  vehicleModel?: string;
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
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export type WorkOrderGroup = Record<
  Exclude<WorkOrderStatus, typeof WorkOrderStatusEnum.Cancelled>,
  WorkOrder[]
>;

export type WorkOrdersMeta = PaginationMeta;

export type WorkOrdersResponse = PaginatedResponse<WorkOrder> & {
  grouped: WorkOrderGroup;
  workers: Worker[];
};

export type WorkOrderSummary = {
  totalActiveJobs: number;
  completedToday: number;
  overdueJobs: number;
  busyWorkers: number;
};
