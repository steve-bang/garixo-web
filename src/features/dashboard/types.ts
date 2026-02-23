import type { WorkOrderStatus } from '@/features/work-orders/types';

export type DateRange = 'today' | 'week' | 'month' | 'custom';

export interface DashboardKPI {
  todayRevenue: number;
  vehiclesToday: number;
  activeOrders: number;
  overdueOrders: number;
}

export interface SecondaryMetrics {
  revenueThisWeek: number;
  averageTicket: number;
  returningCustomersRate: number;
  workerUtilization: number;
}

export interface RevenuePoint {
  date: string;
  revenue: number;
  previousRevenue?: number;
}

export interface OrderStatusDistribution {
  draft: number;
  inProgress: number;
  completed: number;
  paid: number;
}

export interface TodayOrder {
  id: string;
  plate: string;
  service: string;
  worker: string;
  status: WorkOrderStatus;
}

export interface WorkerOverview {
  id: string;
  name: string;
  avatar?: string;
  completedJobs: number;
  activeJobs: number;
}

export interface DashboardResponse {
  kpi: DashboardKPI;
  secondary: SecondaryMetrics;
  revenueTrend: RevenuePoint[];
  statusDistribution: OrderStatusDistribution;
  todayOrders: TodayOrder[];
  topWorkers: WorkerOverview[];
}

// Legacy compatibility types for existing dashboard components.
export type TrendDirection = 'up' | 'down' | 'flat';

export type KpiMetric = {
  id: 'revenue-today' | 'revenue-month' | 'orders-today' | 'pending-jobs';
  label:
    | 'Revenue Today'
    | 'Revenue This Month'
    | 'Orders Today'
    | 'Pending Jobs';
  value: string;
  delta: string;
  trend: TrendDirection;
  tone?: 'default' | 'warning';
};

export type WorkOrderStatusLegacy = WorkOrderStatus;

export type WorkOrderRow = {
  id: string;
  customer: string;
  vehicle: string;
  service: string;
  amount: string;
  status: WorkOrderStatusLegacy;
  updatedAt: string;
  isSelected?: boolean;
};

export type DashboardOverview = {
  kpis: [KpiMetric, KpiMetric, KpiMetric, KpiMetric];
  recentWorkOrders: WorkOrderRow[];
};
