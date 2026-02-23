import type { DashboardResponse, DateRange } from '@/features/dashboard/types';

function toDateLabel(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() - offset);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit'
  }).format(d);
}

function rangeFactor(range: DateRange): number {
  if (range === 'today') return 0.8;
  if (range === 'week') return 1;
  if (range === 'month') return 1.25;
  return 0.9;
}

export function createDashboardMock(
  range: DateRange,
  from?: string,
  to?: string
): DashboardResponse {
  const factor = rangeFactor(range);

  if (range === 'custom' && from && to) {
    const fromDate = new Date(from);
    const toDate = new Date(to);

    if (!Number.isNaN(fromDate.getTime()) && !Number.isNaN(toDate.getTime())) {
      const diffDays = Math.floor(
        (toDate.getTime() - fromDate.getTime()) / (24 * 3600 * 1000)
      );
      if (diffDays < 0) {
        return {
          kpi: {
            todayRevenue: 0,
            vehiclesToday: 0,
            activeOrders: 0,
            overdueOrders: 0
          },
          secondary: {
            revenueThisWeek: 0,
            averageTicket: 0,
            returningCustomersRate: 0,
            workerUtilization: 0
          },
          revenueTrend: [],
          statusDistribution: {
            draft: 0,
            inProgress: 0,
            completed: 0,
            paid: 0
          },
          todayOrders: [],
          topWorkers: []
        };
      }
    }
  }

  const revenueTrend = Array.from({ length: 7 }).map((_, idx) => {
    const revenue = Math.round(
      (8_500_000 + (idx * 1_400_000 + (idx % 2) * 500_000)) * factor
    );
    const previousRevenue = Math.round(revenue * 0.88);

    return {
      date: toDateLabel(6 - idx),
      revenue,
      previousRevenue
    };
  });

  const kpi = {
    todayRevenue: Math.round(13_800_000 * factor),
    vehiclesToday: Math.round(24 * factor),
    activeOrders: Math.round(17 * factor),
    overdueOrders: Math.round(6 * factor)
  };

  return {
    kpi,
    secondary: {
      revenueThisWeek: Math.round(84_000_000 * factor),
      averageTicket: Math.round(2_850_000 * factor),
      returningCustomersRate: Math.round(46 * factor),
      workerUtilization: Math.min(98, Math.round(71 * factor))
    },
    revenueTrend,
    statusDistribution: {
      draft: Math.round(6 * factor),
      inProgress: Math.round(8 * factor),
      completed: Math.round(12 * factor),
      paid: Math.round(4 * factor)
    },
    todayOrders: [
      {
        id: 'wo-1',
        plate: '29A-12345',
        service: 'Oil Change',
        worker: 'Nguyen Tuan',
        status: 'InProgress'
      },
      {
        id: 'wo-2',
        plate: '51H-88999',
        service: 'Brake Service',
        worker: 'Tran Kiet',
        status: 'Draft'
      },
      {
        id: 'wo-3',
        plate: '30F-45678',
        service: 'Engine Check',
        worker: 'Le Huy',
        status: 'WaitingForApproval'
      },
      {
        id: 'wo-4',
        plate: '43B-76291',
        service: 'Battery Replace',
        worker: 'Pham Son',
        status: 'Completed'
      },
      {
        id: 'wo-5',
        plate: '60K-11752',
        service: 'AC Service',
        worker: 'Vo Duy',
        status: 'InProgress'
      }
    ],
    topWorkers: [
      { id: 'w-1', name: 'Nguyen Tuan', completedJobs: 6, activeJobs: 3 },
      { id: 'w-2', name: 'Tran Kiet', completedJobs: 5, activeJobs: 4 },
      { id: 'w-3', name: 'Le Huy', completedJobs: 5, activeJobs: 2 },
      { id: 'w-4', name: 'Pham Son', completedJobs: 4, activeJobs: 4 }
    ]
  };
}
