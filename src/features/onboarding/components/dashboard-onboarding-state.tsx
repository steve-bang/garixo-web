'use client';

import {
  AlertTriangle,
  Car,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  TrendingDown,
  TrendingUp,
  X
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmailVerificationNotice } from '@/features/onboarding/components/email-verification-notice';
import { useSoftOnboardingTooltip } from '@/features/onboarding/hooks/use-soft-onboarding-tooltip';
import type { QuickWorkOrder } from '@/features/onboarding/types';
import { FirstWorkOrderDrawer } from '@/features/work-orders/components/first-work-order-drawer';
import { WorkOrderStatusEnum } from '@/features/work-orders/types';
import { formatCurrencyUsd } from '@/lib/utils/format';

type DashboardOnboardingStateProps = {
  metrics: {
    carsInShop: number;
    waitingForApproval: number;
    readyForPickup: number;
    readyForPickupValue: number;
    overdueJobsCount: number;
    stuckInProgress: number;
    todayRevenue: number;
    weekRevenue: number;
    weekPaidCount: number;
    lastWeekPaidCount: number;
    monthRevenue: number;
    lastMonthRevenue: number;
  };
  recentWorkOrders: QuickWorkOrder[];
  ownerName?: string;
  garageName?: string;
  ownerEmail?: string;
  ownerCreatedAt?: string;
  ownerEmailVerifiedAt?: string | null;
};

function timeGreeting(value: Date): 'morning' | 'afternoon' | 'night' {
  const hour = value.getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  return 'night';
}

function statusLabel(status?: string): string {
  if (!status) return 'Draft';
  if (status === WorkOrderStatusEnum.WaitingForApproval)
    return 'Waiting For Approval';
  if (status === WorkOrderStatusEnum.InProgress) return 'In Progress';
  if (status === WorkOrderStatusEnum.WaitingForParts)
    return 'Waiting For Parts';
  return status;
}

function statusTone(status?: string): string {
  if (status === WorkOrderStatusEnum.WaitingForApproval)
    return 'bg-warning-100 text-warning-800';
  if (status === WorkOrderStatusEnum.InProgress)
    return 'bg-primary-100 text-primary-800';
  if (status === WorkOrderStatusEnum.WaitingForParts)
    return 'bg-primary-100 text-primary-800';
  if (status === WorkOrderStatusEnum.Completed)
    return 'bg-success-100 text-success-800';
  if (status === WorkOrderStatusEnum.Paid)
    return 'bg-success-100 text-success-800';
  if (status === WorkOrderStatusEnum.Cancelled)
    return 'bg-error-100 text-error-800';
  return 'bg-surface-hover text-text-secondary';
}

function shouldShowVerificationNotice(input: {
  ownerEmail?: string;
  ownerCreatedAt?: string;
  ownerEmailVerifiedAt?: string | null;
}): boolean {
  if (!input.ownerEmail || input.ownerEmailVerifiedAt || !input.ownerCreatedAt)
    return false;
  const createdAtTime = new Date(input.ownerCreatedAt).getTime();
  if (Number.isNaN(createdAtTime)) return false;
  return Date.now() - createdAtTime >= 24 * 60 * 60 * 1000;
}

function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

function MonthlyRevenueBanner({
  monthRevenue,
  lastMonthRevenue
}: {
  monthRevenue: number;
  lastMonthRevenue: number;
}) {
  const now = new Date();
  const monthName = now.toLocaleString('default', { month: 'long' });
  const change = pctChange(monthRevenue, lastMonthRevenue);
  const isUp = change !== null && change >= 0;
  const TrendIcon = isUp ? TrendingUp : TrendingDown;
  const trendColor = isUp ? 'text-success-700' : 'text-state-error';

  return (
    <Card className="flex flex-col gap-s1 border-emerald-200 bg-emerald-50 px-s4 py-s4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-caption font-semibold uppercase tracking-wide text-emerald-700">
          {monthName} Revenue
        </p>
        <p className="text-[32px] font-bold leading-none text-emerald-900">
          {formatCurrencyUsd(monthRevenue)}
        </p>
      </div>
      {lastMonthRevenue > 0 || monthRevenue > 0 ? (
        <div className="flex items-center gap-s2">
          {change !== null ? (
            <span
              className={`inline-flex items-center gap-1 rounded-full px-s3 py-s1 text-small font-semibold ${isUp ? 'bg-success-100 text-success-800' : 'bg-error-100 text-error-800'}`}
            >
              <TrendIcon
                aria-hidden="true"
                className={`size-4 ${trendColor}`}
              />
              {isUp ? '+' : ''}
              {change}%
            </span>
          ) : null}
          <p className="text-small text-emerald-700">
            vs {formatCurrencyUsd(lastMonthRevenue)} last month
          </p>
        </div>
      ) : null}
    </Card>
  );
}

export function DashboardOnboardingState({
  metrics,
  recentWorkOrders,
  ownerName,
  ownerEmail,
  ownerCreatedAt,
  ownerEmailVerifiedAt
}: DashboardOnboardingStateProps): JSX.Element {
  const router = useRouter();
  const hasDashboardData =
    metrics.carsInShop > 0 ||
    metrics.waitingForApproval > 0 ||
    metrics.readyForPickup > 0 ||
    metrics.todayRevenue > 0 ||
    metrics.weekRevenue > 0 ||
    metrics.monthRevenue > 0 ||
    recentWorkOrders.length > 0;

  const isEmpty = !hasDashboardData;
  const tooltip = useSoftOnboardingTooltip(isEmpty);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => {
      router.refresh();
    }, 60_000);
    return () => window.clearInterval(timer);
  }, [router]);

  const now = new Date();
  const greetingName = ownerName?.trim() || 'Owner';
  const greeting = `Good ${timeGreeting(now)}, ${greetingName}`;
  const showVerificationNotice = shouldShowVerificationNotice({
    ownerEmail,
    ownerCreatedAt,
    ownerEmailVerifiedAt
  });

  const weekJobChange = metrics.weekPaidCount - metrics.lastWeekPaidCount;
  const weekJobSummary =
    metrics.weekPaidCount === 0
      ? 'No jobs completed this week yet.'
      : metrics.lastWeekPaidCount === 0
        ? `You completed ${metrics.weekPaidCount} job${metrics.weekPaidCount !== 1 ? 's' : ''} this week.`
        : weekJobChange > 0
          ? `You completed ${metrics.weekPaidCount} jobs this week, up ${weekJobChange} from last week.`
          : weekJobChange < 0
            ? `You completed ${metrics.weekPaidCount} jobs this week, down ${Math.abs(weekJobChange)} from last week.`
            : `You completed ${metrics.weekPaidCount} jobs this week, same as last week.`;

  const snapshotCards = [
    {
      key: 'cars-in-shop',
      label: 'Cars in Shop',
      value: String(metrics.carsInShop),
      meta: 'In Progress + Waiting For Parts',
      icon: Car,
      href: '/dashboard/work-orders?status=InProgress',
      tone: {
        border: 'border-primary-200',
        iconWrap: 'bg-primary-100 border-primary-200',
        icon: 'text-primary-700',
        value: 'text-primary-900'
      }
    },
    {
      key: 'waiting-for-approval',
      label: 'Waiting for Approval',
      value: String(metrics.waitingForApproval),
      meta: 'Need customer decision',
      icon: Clock3,
      href: '/dashboard/work-orders?status=WaitingForApproval',
      tone: {
        border: 'border-warning-200',
        iconWrap: 'bg-warning-100 border-warning-200',
        icon: 'text-warning-700',
        value: 'text-warning-900'
      }
    },
    {
      key: 'ready-for-pickup',
      label: 'Ready for Pickup',
      value: String(metrics.readyForPickup),
      meta: 'Completed and waiting payment',
      icon: CheckCircle2,
      href: '/dashboard/work-orders?status=Completed',
      tone: {
        border: 'border-success-200',
        iconWrap: 'bg-success-100 border-success-200',
        icon: 'text-success-700',
        value: 'text-success-900'
      }
    },
    {
      key: 'today-revenue',
      label: 'Today Revenue',
      value: formatCurrencyUsd(metrics.todayRevenue),
      meta: 'Cash collected today',
      icon: CircleDollarSign,
      href: '/dashboard/work-orders?status=Paid&dateFilter=today',
      tone: {
        border: 'border-emerald-200',
        iconWrap: 'bg-emerald-100 border-emerald-200',
        icon: 'text-emerald-700',
        value: 'text-emerald-900'
      }
    }
  ] as const;

  const hasOverdueAlert = metrics.overdueJobsCount > 0;
  const hasWarningAlert =
    metrics.waitingForApproval > 0 ||
    metrics.readyForPickup > 0 ||
    metrics.stuckInProgress > 0;

  return (
    <div className="relative space-y-s6 p-s4 md:p-s6 xl:p-s8">
      <header className="flex flex-col justify-between gap-s4 md:flex-row md:items-center">
        <div className="space-y-s1">
          <h1 className="text-h1">{greeting}</h1>
          <p className="text-small text-text-secondary">
            Your daily operations start here.
          </p>
        </div>
      </header>

      {showVerificationNotice && ownerEmail ? (
        <EmailVerificationNotice
          ownerEmail={ownerEmail}
          ownerName={ownerName}
        />
      ) : null}

      {isEmpty ? (
        <Card className="mx-auto max-w-[640px] space-y-s4 p-s8 text-center">
          <h2 className="text-h2">No jobs yet today</h2>
          <p className="text-small text-text-secondary">
            Successful garages start with the first job.
          </p>
          <div className="mx-auto max-w-[320px]">
            <Button className="h-12 w-full" onClick={() => setDrawerOpen(true)}>
              + Create First Job
            </Button>
          </div>
        </Card>
      ) : (
        <>
          {/* Monthly Revenue Banner */}
          <MonthlyRevenueBanner
            monthRevenue={metrics.monthRevenue}
            lastMonthRevenue={metrics.lastMonthRevenue}
          />

          {/* KPI Cards */}
          <section className="grid gap-s4 sm:grid-cols-2 xl:grid-cols-4">
            {snapshotCards.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  type="button"
                  className="text-left"
                  onClick={() => router.push(item.href)}
                >
                  <Card
                    className={`min-h-[168px] border bg-white p-s4 shadow-sm transition-all duration-150 hover:-translate-y-[1px] hover:shadow-md ${item.tone.border}`}
                  >
                    <div className="flex items-start justify-between gap-s3">
                      <div className="space-y-s1">
                        <p className="text-small font-semibold text-text-secondary">
                          {item.label}
                        </p>
                        <p
                          className={`text-[38px] font-bold leading-none ${item.tone.value}`}
                        >
                          {item.value}
                        </p>
                      </div>
                      <span
                        className={`inline-flex size-11 shrink-0 items-center justify-center rounded-lg border ${item.tone.iconWrap}`}
                      >
                        <Icon className={`size-5 ${item.tone.icon}`} />
                      </span>
                    </div>
                    <p className="mt-s6 text-caption text-text-muted">
                      {item.meta}
                    </p>
                  </Card>
                </button>
              );
            })}
          </section>

          {/* Overdue Alert — red, highest urgency */}
          {hasOverdueAlert ? (
            <section>
              <Card className="space-y-s3 border-error-200 bg-error-50 p-s4">
                <div className="flex items-center gap-s2">
                  <AlertTriangle className="size-5 text-state-error" />
                  <h2 className="text-h3 text-error-900">Overdue Jobs</h2>
                </div>
                <button
                  type="button"
                  className="flex w-full items-center justify-between rounded-md border border-error-200 bg-white px-s3 py-s3 text-left hover:bg-error-50"
                  onClick={() =>
                    router.push('/dashboard/work-orders?status=InProgress')
                  }
                >
                  <span className="inline-flex items-center gap-s2 text-small font-medium text-error-900">
                    <AlertTriangle
                      aria-hidden="true"
                      className="size-4 text-state-error"
                    />
                    {metrics.overdueJobsCount} job
                    {metrics.overdueJobsCount !== 1 ? 's' : ''} past their
                    estimated finish date
                  </span>
                  <span className="text-small font-semibold text-state-error">
                    View →
                  </span>
                </button>
              </Card>
            </section>
          ) : null}

          {/* Warning Alerts — yellow, action needed */}
          {hasWarningAlert ? (
            <section>
              <Card className="space-y-s3 border-warning-200 bg-warning-50 p-s4">
                <div className="flex items-center gap-s2">
                  <AlertTriangle className="size-5 text-warning-700" />
                  <h2 className="text-h3">Attention Required</h2>
                </div>

                <div className="space-y-s2">
                  {metrics.waitingForApproval > 0 ? (
                    <button
                      type="button"
                      className="flex w-full items-center justify-between rounded-md border border-warning-200 bg-white px-s3 py-s3 text-left hover:bg-warning-50"
                      onClick={() =>
                        router.push(
                          '/dashboard/work-orders?status=WaitingForApproval'
                        )
                      }
                    >
                      <span className="inline-flex items-center gap-s2 text-small text-text-primary">
                        <Clock3
                          aria-hidden="true"
                          className="size-4 text-warning-700"
                        />
                        {metrics.waitingForApproval} job
                        {metrics.waitingForApproval !== 1 ? 's' : ''} waiting
                        for customer approval
                      </span>
                      <span className="text-primary text-small font-medium">
                        View
                      </span>
                    </button>
                  ) : null}

                  {metrics.readyForPickup > 0 ? (
                    <button
                      type="button"
                      className="flex w-full items-center justify-between rounded-md border border-warning-200 bg-white px-s3 py-s3 text-left hover:bg-warning-50"
                      onClick={() =>
                        router.push('/dashboard/work-orders?status=Completed')
                      }
                    >
                      <span className="inline-flex items-center gap-s2 text-small text-text-primary">
                        <CircleDollarSign
                          aria-hidden="true"
                          className="size-4 text-success-700"
                        />
                        {metrics.readyForPickup} job
                        {metrics.readyForPickup !== 1 ? 's' : ''} ready for
                        payment
                        {metrics.readyForPickupValue > 0
                          ? ` · ${formatCurrencyUsd(metrics.readyForPickupValue)} waiting`
                          : ''}
                      </span>
                      <span className="text-primary text-small font-medium">
                        Collect
                      </span>
                    </button>
                  ) : null}

                  {metrics.stuckInProgress > 0 ? (
                    <button
                      type="button"
                      className="flex w-full items-center justify-between rounded-md border border-warning-200 bg-white px-s3 py-s3 text-left hover:bg-warning-50"
                      onClick={() =>
                        router.push('/dashboard/work-orders?status=InProgress')
                      }
                    >
                      <span className="inline-flex items-center gap-s2 text-small text-text-primary">
                        <AlertTriangle
                          aria-hidden="true"
                          className="size-4 text-warning-700"
                        />
                        {metrics.stuckInProgress} job
                        {metrics.stuckInProgress !== 1 ? 's' : ''} in progress
                        for more than 3 days
                      </span>
                      <span className="text-primary text-small font-medium">
                        View
                      </span>
                    </button>
                  ) : null}
                </div>
              </Card>
            </section>
          ) : null}

          {/* Recent Jobs */}
          <section className="space-y-s3">
            <div className="flex items-center justify-between">
              <h2 className="text-h2">Jobs</h2>
              <Link
                href="/dashboard/work-orders"
                className="text-primary text-small font-medium hover:underline"
              >
                View All Jobs →
              </Link>
            </div>
            <Card className="overflow-hidden p-0">
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[860px] text-left text-small">
                  <thead className="border-b border-border bg-background-secondary text-text-secondary">
                    <tr>
                      <th className="px-s4 py-s3 font-medium">RO #</th>
                      <th className="px-s4 py-s3 font-medium">Customer</th>
                      <th className="px-s4 py-s3 font-medium">Vehicle</th>
                      <th className="px-s4 py-s3 font-medium">Status</th>
                      <th className="px-s4 py-s3 font-medium">Total</th>
                      <th className="px-s4 py-s3 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentWorkOrders.length > 0 ? (
                      recentWorkOrders.map((order) => (
                        <tr key={order.id} className="border-t border-border">
                          <td className="px-s4 py-s3 font-medium text-text-primary">
                            {order.orderCode ||
                              `WO-${order.id.slice(0, 6).toUpperCase()}`}
                          </td>
                          <td className="px-s4 py-s3">{order.customerName}</td>
                          <td className="px-s4 py-s3">{order.plateNumber}</td>
                          <td className="px-s4 py-s3">
                            <span
                              className={`rounded-full px-s2 py-1 text-caption ${statusTone(order.status)}`}
                            >
                              {statusLabel(order.status)}
                            </span>
                          </td>
                          <td className="px-s4 py-s3 font-medium">
                            {formatCurrencyUsd(order.totalAmount ?? 0)}
                          </td>
                          <td className="px-s4 py-s3">
                            <Link href={`/dashboard/work-orders/${order.id}`}>
                              <Button size="sm" variant="secondary">
                                View
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          className="px-s4 py-s4 text-small text-text-secondary"
                          colSpan={7}
                        >
                          No jobs to show.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="space-y-s3 p-s3 md:hidden">
                {recentWorkOrders.length > 0 ? (
                  recentWorkOrders.map((order) => (
                    <Card key={order.id} className="space-y-s2 p-s3">
                      <div className="flex items-center justify-between gap-s2">
                        <p className="text-small font-semibold text-text-primary">
                          {order.orderCode ||
                            `WO-${order.id.slice(0, 6).toUpperCase()}`}
                        </p>
                        <span
                          className={`rounded-full px-s2 py-1 text-caption ${statusTone(order.status)}`}
                        >
                          {statusLabel(order.status)}
                        </span>
                      </div>
                      <p className="text-small text-text-primary">
                        {order.customerName}
                      </p>
                      <p className="text-small text-text-secondary">
                        {order.plateNumber}
                      </p>
                      <div className="flex items-center justify-between text-small">
                        <span className="font-medium text-text-primary">
                          {formatCurrencyUsd(order.totalAmount ?? 0)}
                        </span>
                      </div>
                      <Link href={`/dashboard/work-orders/${order.id}`}>
                        <Button
                          size="sm"
                          className="w-full"
                          variant="secondary"
                        >
                          View
                        </Button>
                      </Link>
                    </Card>
                  ))
                ) : (
                  <Card className="p-s3 text-small text-text-secondary">
                    No jobs to show.
                  </Card>
                )}
              </div>
            </Card>
          </section>

          {/* Cash Flow Snapshot with plain-language summary */}
          <section className="space-y-s3">
            <h2 className="text-h2">Cash Flow</h2>
            <div className="grid gap-s3 sm:grid-cols-3">
              <Card className="space-y-s2 p-s4">
                <p className="text-small text-text-secondary">Today</p>
                <p className="text-h2 font-bold text-success-700">
                  {formatCurrencyUsd(metrics.todayRevenue)}
                </p>
              </Card>
              <Card className="space-y-s2 p-s4">
                <p className="text-small text-text-secondary">This Week</p>
                <p className="text-h2 font-bold text-text-primary">
                  {formatCurrencyUsd(metrics.weekRevenue)}
                </p>
              </Card>
              <Card className="space-y-s2 p-s4">
                <p className="text-small text-text-secondary">This Month</p>
                <p className="text-h2 font-bold text-text-primary">
                  {formatCurrencyUsd(metrics.monthRevenue)}
                </p>
              </Card>
            </div>
            <p className="text-small text-text-secondary">{weekJobSummary}</p>
          </section>
        </>
      )}

      {tooltip.visible ? (
        <div className="fixed bottom-s4 right-s4 z-30 w-[320px] rounded-lg border border-border bg-surface-default p-s4 shadow-md">
          <button
            type="button"
            className="absolute right-s2 top-s2 text-text-muted hover:text-text-primary"
            aria-label="Dismiss onboarding tip"
            onClick={tooltip.dismiss}
          >
            <X className="size-4" />
          </button>
          <p className="pr-s4 text-small text-text-secondary">
            90% of garages start by creating their first job.
          </p>
          <div className="mt-s3">
            <Button
              size="sm"
              className="h-10 w-full"
              onClick={() => {
                tooltip.dismiss();
                setDrawerOpen(true);
              }}
            >
              Create Job
            </Button>
          </div>
        </div>
      ) : null}

      <FirstWorkOrderDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onCreated={(orderId) => {
          router.push(`/dashboard/work-orders/${orderId}`);
        }}
      />
    </div>
  );
}
