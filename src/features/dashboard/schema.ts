import { z } from 'zod';

export const dateRangeSchema = z.enum(['today', 'week', 'month', 'custom']);

export const dashboardKpiSchema = z.object({
  todayRevenue: z.number(),
  vehiclesToday: z.number(),
  activeOrders: z.number(),
  overdueOrders: z.number()
});

export const secondaryMetricsSchema = z.object({
  revenueThisWeek: z.number(),
  averageTicket: z.number(),
  returningCustomersRate: z.number(),
  workerUtilization: z.number()
});

export const revenuePointSchema = z.object({
  date: z.string(),
  revenue: z.number(),
  previousRevenue: z.number().optional()
});

export const orderStatusDistributionSchema = z.object({
  assigned: z.number(),
  inProgress: z.number(),
  completed: z.number(),
  overdue: z.number()
});

export const todayOrderSchema = z.object({
  id: z.string(),
  plate: z.string(),
  service: z.string(),
  worker: z.string(),
  status: z.enum(['assigned', 'in_progress', 'completed', 'overdue'])
});

export const workerOverviewSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatar: z.string().optional(),
  completedJobs: z.number(),
  activeJobs: z.number()
});

export const dashboardResponseSchema = z.object({
  kpi: dashboardKpiSchema,
  secondary: secondaryMetricsSchema,
  revenueTrend: z.array(revenuePointSchema),
  statusDistribution: orderStatusDistributionSchema,
  todayOrders: z.array(todayOrderSchema),
  topWorkers: z.array(workerOverviewSchema)
});
