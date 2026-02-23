'use client';

import {
  AlertTriangle,
  Car,
  CircleDollarSign,
  Clock3,
  RefreshCw,
  Users
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/features/auth/hooks';
import { useDashboardOverview } from '@/features/dashboard/hooks';
import type {
  DateRange,
  DashboardResponse,
  RevenuePoint
} from '@/features/dashboard/types';
import { WorkOrderStatusEnum } from '@/features/work-orders/types';
import { cn } from '@/lib/utils/cn';

function formatCurrency(value: number): string {
  return `${new Intl.NumberFormat('vi-VN').format(value)} đ`;
}

function formatPercent(value: number): string {
  return `${value}%`;
}

function mapStatusTone(
  status: DashboardResponse['todayOrders'][number]['status']
): string {
  if (status === WorkOrderStatusEnum.Paid)
    return 'bg-success-100 text-success-800';
  if (status === WorkOrderStatusEnum.Completed)
    return 'bg-badge-success text-badge-success-text';
  if (status === WorkOrderStatusEnum.InProgress)
    return 'bg-info-100 text-info-800';
  if (status === WorkOrderStatusEnum.Cancelled)
    return 'bg-error-100 text-error-800';
  if (status === WorkOrderStatusEnum.WaitingForApproval)
    return 'bg-warning-100 text-warning-800';
  if (status === WorkOrderStatusEnum.WaitingForParts)
    return 'bg-primary-100 text-primary-800';
  return 'bg-surface-hover text-text-secondary';
}

function statusLabel(
  status: DashboardResponse['todayOrders'][number]['status']
): string {
  if (status === WorkOrderStatusEnum.InProgress) return 'In Progress';
  if (status === WorkOrderStatusEnum.WaitingForApproval)
    return 'Waiting For Approval';
  return status;
}

function RevenueLineChart({ points }: { points: RevenuePoint[] }): JSX.Element {
  if (!points.length) {
    return (
      <p className="text-small text-text-muted">No trend data available.</p>
    );
  }

  const width = 640;
  const height = 220;
  const padding = 26;

  const maxValue = Math.max(
    ...points.map((p) => Math.max(p.revenue, p.previousRevenue ?? 0)),
    1
  );

  const toPoint = (value: number, index: number) => {
    const x =
      padding +
      (index * (width - padding * 2)) / Math.max(points.length - 1, 1);
    const y = height - padding - (value / maxValue) * (height - padding * 2);
    return `${x},${y}`;
  };

  const currentPath = points.map((p, idx) => toPoint(p.revenue, idx)).join(' ');
  const previousPath = points
    .map((p, idx) => toPoint(p.previousRevenue ?? 0, idx))
    .join(' ');

  return (
    <div className="space-y-s3">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        role="img"
        aria-label="Revenue trend chart"
      >
        {Array.from({ length: 4 }).map((_, i) => {
          const y = padding + (i * (height - padding * 2)) / 3;
          return (
            <line
              key={i}
              x1={padding}
              y1={y}
              x2={width - padding}
              y2={y}
              stroke="hsl(var(--slate-200))"
              strokeWidth="1"
            />
          );
        })}

        <polyline
          fill="none"
          stroke="hsl(var(--primary-300))"
          strokeWidth="2"
          points={previousPath}
        />
        <polyline
          fill="none"
          stroke="hsl(var(--primary-700))"
          strokeWidth="3"
          points={currentPath}
        />
      </svg>

      <div className="grid grid-cols-7 text-center text-caption text-text-muted">
        {points.map((point) => (
          <span key={point.date}>{point.date}</span>
        ))}
      </div>
    </div>
  );
}

function StatusBarChart({
  data,
  onClick
}: {
  data: DashboardResponse['statusDistribution'];
  onClick: (status: string) => void;
}): JSX.Element {
  const items = [
    { key: 'draft', label: 'Draft', value: data.draft },
    { key: 'inProgress', label: 'In Progress', value: data.inProgress },
    { key: 'completed', label: 'Completed', value: data.completed },
    { key: 'paid', label: 'Paid', value: data.paid }
  ] as const;

  const max = Math.max(...items.map((item) => item.value), 1);

  return (
    <div className="space-y-s3">
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          className="w-full text-left"
          onClick={() => onClick(item.key)}
          title="Open filtered orders"
        >
          <div className="mb-s1 flex items-center justify-between text-small">
            <span className="text-text-secondary">{item.label}</span>
            <span className="font-medium text-text-primary">{item.value}</span>
          </div>
          <div className="h-3 rounded bg-surface-hover">
            <div
              className={cn(
                'h-3 rounded',
                item.key === 'paid'
                  ? 'bg-state-success'
                  : item.key === 'completed'
                    ? 'bg-success-600'
                    : 'bg-primary-600'
              )}
              style={{ width: `${Math.max(8, (item.value / max) * 100)}%` }}
            />
          </div>
        </button>
      ))}
    </div>
  );
}

export function DashboardOverview(): JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { role, status: authStatus } = useAuth();

  const [range, setRange] = useState<DateRange>('today');
  const [customOpen, setCustomOpen] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const query = useDashboardOverview({
    range,
    from: range === 'custom' ? dateFrom || undefined : undefined,
    to: range === 'custom' ? dateTo || undefined : undefined
  });

  const isStaff = role === 'staff';
  const data = query.data;

  if (authStatus === 'unauthenticated') {
    return (
      <Card className="m-s8 p-s6">
        <p className="text-small text-state-error">
          You do not have permission to view dashboard data.
        </p>
      </Card>
    );
  }

  const primaryCards = data
    ? [
        {
          key: 'todayRevenue',
          label: 'Today Revenue',
          value: formatCurrency(data.kpi.todayRevenue),
          icon: CircleDollarSign,
          hidden: isStaff,
          href: '/dashboard/work-orders?status=WaitingForParts'
        },
        {
          key: 'vehiclesToday',
          label: 'Vehicles Today',
          value: String(data.kpi.vehiclesToday),
          icon: Car,
          hidden: false,
          href: '/dashboard/vehicles'
        },
        {
          key: 'activeOrders',
          label: 'Active Orders',
          value: String(data.kpi.activeOrders),
          icon: Clock3,
          hidden: false,
          href: '/dashboard/work-orders?status=InProgress'
        },
        {
          key: 'overdueOrders',
          label: 'Overdue Orders',
          value: String(data.kpi.overdueOrders),
          icon: AlertTriangle,
          hidden: false,
          overdue: true,
          href: '/dashboard/work-orders?status=WaitingForApproval'
        }
      ].filter((item) => !item.hidden)
    : [];

  if (authStatus === 'loading' || query.isLoading) {
    return <DashboardSkeleton />;
  }

  if (query.isError || !data) {
    return (
      <Card className="m-s8 p-s6">
        <p className="text-small text-state-error">
          Could not load dashboard data.
        </p>
      </Card>
    );
  }

  const summaryCards = [
    {
      key: 'revenueThisWeek',
      label: 'Revenue This Week',
      value: formatCurrency(data.secondary.revenueThisWeek),
      tooltip: 'Total revenue generated during current week.',
      hidden: isStaff
    },
    {
      key: 'averageTicket',
      label: 'Average Ticket',
      value: formatCurrency(data.secondary.averageTicket),
      tooltip: 'Average order value in selected range.',
      hidden: isStaff
    },
    {
      key: 'returningCustomersRate',
      label: 'Returning Customers %',
      value: formatPercent(data.secondary.returningCustomersRate),
      tooltip: 'Share of customers who returned for another service.',
      hidden: false
    },
    {
      key: 'workerUtilization',
      label: 'Worker Utilization %',
      value: formatPercent(data.secondary.workerUtilization),
      tooltip: 'Average active workload across workers.',
      hidden: false
    }
  ].filter((item) => !item.hidden);

  const shouldShowVerificationBanner = searchParams.get('verify') === 'phone';

  return (
    <div className="space-y-s8 p-s8">
      <header className="flex flex-col items-start justify-between gap-s3 md:flex-row md:items-center">
        <div>
          <h1 className="text-h1">Dashboard</h1>
          <p className="text-small text-text-muted">
            Garage operational overview.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-s2">
          <select
            className="h-10 rounded-md border border-input-border bg-input px-s3 text-small"
            value={range}
            onChange={(event) => {
              const next = event.target.value as DateRange;
              if (next === 'custom') {
                setCustomOpen(true);
              }
              setRange(next);
            }}
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="custom">Custom</option>
          </select>

          <Button variant="secondary" size="sm" onClick={() => query.refetch()}>
            <RefreshCw className="size-4" />
            Refresh
          </Button>
        </div>
      </header>

      {customOpen ? (
        <Card className="space-y-s3 p-s4">
          <p className="text-small font-medium">Custom Date Range</p>
          <div className="grid gap-s3 md:grid-cols-2">
            <Input
              type="date"
              className="h-11"
              value={dateFrom}
              onChange={(event) => setDateFrom(event.target.value)}
            />
            <Input
              type="date"
              className="h-11"
              value={dateTo}
              onChange={(event) => setDateTo(event.target.value)}
            />
          </div>
          <div className="flex justify-end gap-s2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCustomOpen(false)}
            >
              Close
            </Button>
          </div>
        </Card>
      ) : null}

      {shouldShowVerificationBanner ? (
        <Card className="border border-warning-200 bg-warning-50 p-s4">
          <p className="text-small font-medium text-warning-800">
            Please verify your phone number to secure your account.
          </p>
        </Card>
      ) : null}

      {data.kpi.overdueOrders > 5 ? (
        <Card className="border border-warning-200 bg-warning-50 p-s4">
          <p className="text-small font-medium text-warning-800">
            You have many overdue jobs today.
          </p>
        </Card>
      ) : null}

      <section
        className={`grid gap-s4 ${primaryCards.length === 4 ? 'md:grid-cols-2 xl:grid-cols-4' : 'md:grid-cols-2 xl:grid-cols-3'}`}
      >
        {primaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.key}
              type="button"
              onClick={() => router.push(card.href)}
              className={cn(
                'rounded-lg border border-border bg-surface-default p-s6 text-left shadow-sm hover:bg-surface-hover',
                card.overdue ? 'border-l-[3px] border-l-state-error' : ''
              )}
            >
              <div className="flex items-start justify-between gap-s2">
                <div>
                  <p className="text-small text-text-secondary">{card.label}</p>
                  <p className="mt-s2 text-[34px] font-bold leading-none text-text-primary">
                    {card.value}
                  </p>
                </div>
                <span className="rounded-md bg-surface-hover p-s2 text-text-secondary">
                  <Icon className="size-4" />
                </span>
              </div>
            </button>
          );
        })}
      </section>

      <section className="grid gap-s4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((item) => (
          <Card key={item.key} className="p-s6" title={item.tooltip}>
            <p className="text-small text-text-secondary">{item.label}</p>
            <p className="mt-s2 text-[28px] font-bold leading-none text-text-primary">
              {item.value}
            </p>
          </Card>
        ))}
      </section>

      <section className="grid gap-s6 xl:grid-cols-2">
        <Card className="space-y-s4 p-s6">
          <div>
            <h3 className="text-h3">Revenue Trend</h3>
            <p className="text-caption text-text-muted">
              Daily revenue trend in selected range.
            </p>
          </div>
          <RevenueLineChart points={data.revenueTrend} />
        </Card>

        <Card className="space-y-s4 p-s6">
          <div>
            <h3 className="text-h3">Orders Status Distribution</h3>
            <p className="text-caption text-text-muted">
              Click a bar to open filtered orders.
            </p>
          </div>
          <StatusBarChart
            data={data.statusDistribution}
            onClick={(statusKey) => {
              const statusMap: Record<string, string> = {
                draft: 'Draft',
                inProgress: 'InProgress',
                completed: 'Completed',
                paid: 'Paid'
              };
              router.push(
                `/dashboard/work-orders?status=${statusMap[statusKey] ?? ''}`
              );
            }}
          />
        </Card>
      </section>

      <section className="grid gap-s6 xl:grid-cols-2">
        <Card className="space-y-s4 p-s6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-h3">Today Schedule Snapshot</h3>
              <p className="text-caption text-text-muted">
                Latest operational jobs.
              </p>
            </div>
            <Link
              href="/dashboard/work-orders"
              className="text-small font-medium text-primary-700 hover:underline"
            >
              View All Orders
            </Link>
          </div>

          {data.todayOrders.length === 0 ? (
            <div className="grid min-h-[220px] place-items-center rounded-lg border border-dashed border-border bg-surface-default text-center">
              <div>
                <p className="text-h3">No operational data yet.</p>
                <p className="mt-s1 text-small text-text-muted">
                  Start by creating your first work order.
                </p>
                <div className="mt-s3">
                  <Button onClick={() => router.push('/dashboard/work-orders')}>
                    Create your first Order
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-small">
                <thead className="border-b border-border text-text-secondary">
                  <tr>
                    <th className="py-s2 font-medium">Plate</th>
                    <th className="py-s2 font-medium">Service</th>
                    <th className="py-s2 font-medium">Worker</th>
                    <th className="py-s2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.todayOrders.slice(0, 7).map((row) => (
                    <tr
                      key={row.id}
                      className="border-t border-border hover:bg-surface-hover"
                    >
                      <td className="py-s2 font-medium">{row.plate}</td>
                      <td className="py-s2 text-text-secondary">
                        {row.service}
                      </td>
                      <td className="py-s2 text-text-secondary">
                        {row.worker}
                      </td>
                      <td className="py-s2">
                        <Badge
                          variant="default"
                          className={mapStatusTone(row.status)}
                        >
                          {statusLabel(row.status)}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card className="space-y-s4 p-s6">
          <div>
            <h3 className="text-h3">Top Workers Today</h3>
            <p className="text-caption text-text-muted">
              Current output and active workload.
            </p>
          </div>

          <div className="space-y-s3">
            {data.topWorkers.slice(0, 5).map((worker) => (
              <div
                key={worker.id}
                className="flex items-center justify-between rounded-md border border-border bg-surface-default px-s3 py-s2"
              >
                <div className="flex items-center gap-s3">
                  <span className="grid size-8 place-items-center rounded-full bg-surface-hover text-caption font-semibold text-text-secondary">
                    {worker.name.slice(0, 1)}
                  </span>
                  <div>
                    <p className="text-small font-medium">{worker.name}</p>
                    <p className="text-caption text-text-muted">
                      Completed: {worker.completedJobs}
                    </p>
                  </div>
                </div>
                <p className="text-small text-text-secondary">
                  Active: {worker.activeJobs}
                </p>
              </div>
            ))}

            {data.topWorkers.length === 0 ? (
              <p className="text-small text-text-muted">
                No worker activity yet.
              </p>
            ) : null}
          </div>
        </Card>
      </section>
    </div>
  );
}

function DashboardSkeleton(): JSX.Element {
  return (
    <div className="space-y-s8 p-s8">
      <div className="h-8 w-64 animate-pulse rounded bg-surface-hover" />
      <div className="grid gap-s4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-32 animate-pulse rounded-lg border border-border bg-surface-default"
          />
        ))}
      </div>
      <div className="grid gap-s4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-24 animate-pulse rounded-lg border border-border bg-surface-default"
          />
        ))}
      </div>
      <div className="grid gap-s6 xl:grid-cols-2">
        <div className="h-72 animate-pulse rounded-lg border border-border bg-surface-default" />
        <div className="h-72 animate-pulse rounded-lg border border-border bg-surface-default" />
      </div>
      <div className="grid gap-s6 xl:grid-cols-2">
        <div className="h-64 animate-pulse rounded-lg border border-border bg-surface-default" />
        <div className="h-64 animate-pulse rounded-lg border border-border bg-surface-default" />
      </div>
    </div>
  );
}
