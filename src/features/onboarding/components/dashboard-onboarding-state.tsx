'use client';

import { X } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useSoftOnboardingTooltip } from '@/features/onboarding/hooks/use-soft-onboarding-tooltip';
import type { QuickWorkOrder } from '@/features/onboarding/types';

type DashboardOnboardingStateProps = {
  workOrders: QuickWorkOrder[];
};

export function DashboardOnboardingState({ workOrders }: DashboardOnboardingStateProps): JSX.Element {
  const isEmpty = workOrders.length === 0;
  const tooltip = useSoftOnboardingTooltip(isEmpty);

  return (
    <div className="relative space-y-s6 p-s8">
      <header className="space-y-s1">
        <h1 className="text-h1">Dashboard</h1>
        <p className="text-small text-text-muted">Your daily operations start here.</p>
      </header>

      {isEmpty ? (
        <Card className="mx-auto max-w-[640px] space-y-s4 p-s8 text-center">
          <h2 className="text-h2">No work orders today</h2>
          <p className="text-small text-text-secondary">Successful garages start with their first job.</p>
          <div className="mx-auto max-w-[320px]">
            <Button asChild className="h-12 w-full">
              <Link href="/dashboard/work-orders/new">+ Create First Work Order</Link>
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="space-y-s4 p-s6">
          <div className="flex items-center justify-between gap-s2">
            <h2 className="text-h2">Recent Work Orders</h2>
            <Button asChild size="sm">
              <Link href="/dashboard/work-orders/new">Create Work Order</Link>
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-small">
              <thead className="border-b border-border text-text-secondary">
                <tr>
                  <th className="py-s2 font-medium">Customer</th>
                  <th className="py-s2 font-medium">License Plate</th>
                  <th className="py-s2 font-medium">Service</th>
                  <th className="py-s2 font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {workOrders.map((order) => (
                  <tr key={order.id} className="border-t border-border">
                    <td className="py-s2 font-medium text-text-primary">{order.customerName}</td>
                    <td className="py-s2 text-text-secondary">{order.licensePlate}</td>
                    <td className="py-s2 text-text-secondary">{order.service || '—'}</td>
                    <td className="py-s2 text-text-secondary">{new Date(order.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
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
            90% of garages start by creating their first work order.
          </p>
          <div className="mt-s3">
            <Button asChild size="sm" className="h-10 w-full">
              <Link href="/dashboard/work-orders/new" onClick={tooltip.dismiss}>
                Create Work Order
              </Link>
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
