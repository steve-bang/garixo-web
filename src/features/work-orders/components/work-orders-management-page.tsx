'use client';

import { useQuery } from '@tanstack/react-query';
import { KanbanSquare, List, Plus } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { CancelOrderModal } from '@/features/work-orders/components/cancel-order-modal';
import { CreateOrderDrawer } from '@/features/work-orders/components/create-order-drawer';
import { PaymentModal } from '@/features/work-orders/components/payment-modal';
import { WorkOrderDetailDrawer } from '@/features/work-orders/components/work-order-detail-drawer';
import { WorkOrdersFilters } from '@/features/work-orders/components/work-orders-filters';
import { WorkOrdersKanbanBoard } from '@/features/work-orders/components/work-orders-kanban-board';
import { WorkOrdersSkeleton } from '@/features/work-orders/components/work-orders-skeleton';
import { WorkOrdersSummaryCards } from '@/features/work-orders/components/work-orders-summary-cards';
import { WorkOrdersTableView } from '@/features/work-orders/components/work-orders-table-view';
import {
  useCancelWorkOrder,
  useCreateWorkOrder,
  useUpdateWorkOrder,
  useUpdateWorkOrderStatus,
  useWorkOrders,
  useWorkOrdersSummary,
  usePayWorkOrder
} from '@/features/work-orders/hooks';
import { getServices } from '@/features/services/service';
import type { CreateWorkOrderInput } from '@/features/work-orders/schema';
import { WorkOrderStatusEnum } from '@/features/work-orders/types';
import type {
  OrderService,
  PaymentMethod,
  WorkOrder,
  WorkOrderStatus
} from '@/features/work-orders/types';
import {
  allowedTransitions,
  groupByStatus,
  statusLabel
} from '@/features/work-orders/utils';
import type { Role } from '@/types/primitives';

type ViewMode = 'board' | 'table';
type DateFilter = 'all' | 'today' | 'this_week' | 'this_month' | 'custom';
type QueryValue = string | null | undefined;

const currentUserRole: Role = 'OWNER';
const pageSize = 20;
const dateFilterValues: DateFilter[] = [
  'all',
  'today',
  'this_week',
  'this_month',
  'custom'
];
const validWorkOrderStatuses = new Set(Object.values(WorkOrderStatusEnum));

function parseViewMode(value: string | null): ViewMode {
  return value === 'table' ? 'table' : 'board';
}

function parseDateFilter(value: string | null): DateFilter {
  if (
    value &&
    dateFilterValues.includes(
      value as 'all' | 'today' | 'this_week' | 'this_month' | 'custom'
    )
  ) {
    return value as DateFilter;
  }

  return 'all';
}

function parsePositiveInt(value: string | null, fallback = 1): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
}

function parseWorkOrderStatus(
  value: string | null
): WorkOrderStatus | undefined {
  if (!value) {
    return undefined;
  }

  return validWorkOrderStatuses.has(value as WorkOrderStatus)
    ? (value as WorkOrderStatus)
    : undefined;
}

function toQueryStringValue(value: QueryValue): string | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }

  const normalized = value.trim();
  return normalized ? normalized : undefined;
}

export function WorkOrdersManagementPage(): JSX.Element {
  const toast = useToast();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchInput, setSearchInput] = useState('');

  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailOrder, setDetailOrder] = useState<WorkOrder | null>(null);
  const [paymentTarget, setPaymentTarget] = useState<WorkOrder | null>(null);
  const [cancelTarget, setCancelTarget] = useState<WorkOrder | null>(null);

  const [optimisticItems, setOptimisticItems] = useState<WorkOrder[] | null>(
    null
  );

  const viewMode = parseViewMode(searchParams.get('view'));
  const search = toQueryStringValue(searchParams.get('search')) ?? '';
  const workerId = toQueryStringValue(searchParams.get('workerId'));
  const status = parseWorkOrderStatus(searchParams.get('status'));
  const dateFilter = parseDateFilter(searchParams.get('dateFilter'));
  const dateFrom =
    dateFilter === 'custom'
      ? (toQueryStringValue(searchParams.get('dateFrom')) ?? '')
      : '';
  const dateTo =
    dateFilter === 'custom'
      ? (toQueryStringValue(searchParams.get('dateTo')) ?? '')
      : '';
  const page = parsePositiveInt(searchParams.get('page'), 1);

  const setQueryParams = useCallback(
    (updates: Record<string, QueryValue>) => {
      const nextParams = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        const normalized = toQueryStringValue(value);
        if (!normalized) {
          nextParams.delete(key);
          return;
        }

        nextParams.set(key, normalized);
      });

      const nextQuery = nextParams.toString();
      const currentQuery = searchParams.toString();
      if (nextQuery === currentQuery) {
        return;
      }

      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
        scroll: false
      });
    },
    [pathname, router, searchParams]
  );

  const setQueryPage = useCallback(
    (nextPage: number) => {
      setQueryParams({ page: nextPage <= 1 ? undefined : String(nextPage) });
    },
    [setQueryParams]
  );

  const setQueryViewMode = useCallback(
    (next: ViewMode) => {
      setQueryParams({ view: next === 'board' ? undefined : next });
    },
    [setQueryParams]
  );

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (searchInput.trim() === search) {
        return;
      }

      setQueryParams({
        search: searchInput,
        page: '1'
      });
    }, 300);

    return () => window.clearTimeout(timer);
  }, [search, searchInput, setQueryParams]);

  const params = useMemo(
    () =>
      ({
        search: search || undefined,
        workerId,
        status,
        dateFilter,
        dateFrom: dateFilter === 'custom' ? dateFrom || undefined : undefined,
        dateTo: dateFilter === 'custom' ? dateTo || undefined : undefined,
        page,
        pageSize
      }) as const,
    [dateFilter, dateFrom, dateTo, page, search, status, workerId]
  );
  const summaryParams = useMemo(
    () =>
      ({
        search: search || undefined,
        workerId,
        status,
        dateFilter,
        dateFrom: dateFilter === 'custom' ? dateFrom || undefined : undefined,
        dateTo: dateFilter === 'custom' ? dateTo || undefined : undefined,
        page: 1,
        pageSize: 100
      }) as const,
    [dateFilter, dateFrom, dateTo, search, status, workerId]
  );

  const listQuery = useWorkOrders(params);
  const summaryQuery = useWorkOrders(summaryParams);

  const createMutation = useCreateWorkOrder();
  const updateMutation = useUpdateWorkOrder();
  const updateStatusMutation = useUpdateWorkOrderStatus();
  const payMutation = usePayWorkOrder();
  const cancelMutation = useCancelWorkOrder();
  const servicesQuery = useQuery({
    queryKey: ['work-orders', 'service-catalog'],
    queryFn: () =>
      getServices({ status: 'ACTIVE', page: 1, pageSize: 20, sort: 'name_asc' })
  });

  const items = listQuery.data?.items ?? [];
  const workers = listQuery.data?.workers ?? [];
  const availableServices: OrderService[] = (
    servicesQuery.data?.items ?? []
  ).map((item) => ({
    id: item.id,
    name: item.name,
    price: item.price
  }));
  const meta = listQuery.data?.meta;

  const displayItems = optimisticItems ?? items;
  const grouped = useMemo(() => groupByStatus(displayItems), [displayItems]);

  const summary = useWorkOrdersSummary(
    summaryQuery.data?.items ?? [],
    summaryQuery.data?.workers ?? []
  );

  const onCreate = async (payload: CreateWorkOrderInput) => {
    await createMutation.mutateAsync(payload);
    setCreateOpen(false);
    toast.success('Work order created.');
  };

  const onMoveStatus = async (id: string, nextStatus: WorkOrderStatus) => {
    const current = displayItems.find((item) => item.id === id);
    if (!current || current.status === nextStatus) return;
    const nextAllowedStatuses = allowedTransitions[current.status] ?? [];

    if (!nextAllowedStatuses.includes(nextStatus)) {
      toast.error(
        `Invalid transition: ${statusLabel(current.status)} → ${statusLabel(nextStatus)}.`
      );
      return;
    }

    if (nextStatus === WorkOrderStatusEnum.Paid) {
      setPaymentTarget(current);
      return;
    }

    const snapshot = displayItems;

    setOptimisticItems(
      displayItems.map((item) =>
        item.id === id
          ? { ...item, status: nextStatus, updatedAt: new Date().toISOString() }
          : item
      )
    );

    try {
      await updateStatusMutation.mutateAsync({
        id,
        payload: { status: nextStatus }
      });
      setOptimisticItems(null);
      toast.success('Status updated.');
    } catch (error) {
      setOptimisticItems(snapshot);
      toast.error(
        error instanceof Error ? error.message : 'Could not update status.'
      );
    }
  };

  const onPay = async (id: string, method: PaymentMethod) => {
    await payMutation.mutateAsync({ id, payload: { method } });
    setPaymentTarget(null);
    toast.success('Payment completed.');
  };

  const onCancel = async (id: string, reason: string) => {
    await cancelMutation.mutateAsync({ id, payload: { reason } });
    setCancelTarget(null);
    toast.success('Order cancelled.');
  };

  const onSaveNotes = async (id: string, notes: string) => {
    await updateMutation.mutateAsync({ id, payload: { notes } });
    toast.success('Notes updated.');
  };

  if (listQuery.isLoading || summaryQuery.isLoading) {
    return <WorkOrdersSkeleton />;
  }

  if (listQuery.isError || summaryQuery.isError) {
    return (
      <Card className="m-s8 p-s6">
        <p className="text-small text-state-error">
          Could not load work orders.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-s6 p-s8">
      <header className="flex flex-col items-start justify-between gap-s3 md:flex-row md:items-center">
        <div>
          <h1 className="text-h1">Work Orders</h1>
          <p className="text-small text-text-muted">
            Manage and track mechanic tasks.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-s2">
          <div className="flex items-center gap-s1 rounded-md border border-border bg-surface-default p-1">
            <Button
              variant={viewMode === 'board' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setQueryViewMode('board')}
            >
              <KanbanSquare className="size-4" />
              Board
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setQueryViewMode('table')}
            >
              <List className="size-4" />
              Table
            </Button>
          </div>

          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            Create Order
          </Button>
        </div>
      </header>

      <WorkOrdersSummaryCards summary={summary} />

      <WorkOrdersFilters
        searchInput={searchInput}
        workerId={workerId}
        status={status}
        dateFilter={dateFilter}
        dateFrom={dateFrom}
        dateTo={dateTo}
        workers={workers}
        onSearchInputChange={setSearchInput}
        onWorkerChange={(value) => {
          setQueryParams({
            workerId: value,
            page: '1'
          });
        }}
        onStatusChange={(value) => {
          setQueryParams({
            status: value,
            page: '1'
          });
        }}
        onDateFilterChange={(value) => {
          setQueryParams({
            dateFilter: value === 'all' ? undefined : value,
            dateFrom: value === 'custom' ? dateFrom : undefined,
            dateTo: value === 'custom' ? dateTo : undefined,
            page: '1'
          });
        }}
        onDateFromChange={(value) =>
          setQueryParams({
            dateFrom: value,
            page: '1'
          })
        }
        onDateToChange={(value) =>
          setQueryParams({
            dateTo: value,
            page: '1'
          })
        }
        onClear={() => {
          setSearchInput('');
          setQueryParams({
            search: undefined,
            workerId: undefined,
            status: undefined,
            dateFilter: undefined,
            dateFrom: undefined,
            dateTo: undefined,
            page: undefined
          });
        }}
      />

      {viewMode === 'board' ? (
        <WorkOrdersKanbanBoard
          grouped={grouped}
          onCardClick={(item) => {
            setDetailOrder(item);
            setDetailOpen(true);
          }}
          onDropStatus={onMoveStatus}
        />
      ) : (
        <WorkOrdersTableView
          items={displayItems}
          currentUserRole={currentUserRole}
          onView={(item) => {
            setDetailOrder(item);
            setDetailOpen(true);
          }}
          onEdit={(item) => {
            setDetailOrder(item);
            setDetailOpen(true);
          }}
          onCancel={(item) => setCancelTarget(item)}
        />
      )}

      {meta ? (
        <div className="flex items-center justify-between gap-s2">
          <p className="text-small text-text-muted">
            Page {meta.page} of {meta.totalPages} ({meta.total} orders)
          </p>

          <div className="flex items-center gap-s2">
            <Button
              variant="secondary"
              size="sm"
              disabled={meta.page <= 1}
              onClick={() => setQueryPage(Math.max(meta.page - 1, 1))}
            >
              Previous
            </Button>
            <Badge variant="default">{meta.page}</Badge>
            <Button
              variant="secondary"
              size="sm"
              disabled={meta.page >= meta.totalPages}
              onClick={() =>
                setQueryPage(Math.min(meta.page + 1, meta.totalPages))
              }
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}

      <CreateOrderDrawer
        open={createOpen}
        workers={workers}
        availableServices={availableServices}
        onClose={() => setCreateOpen(false)}
        onSubmit={onCreate}
      />

      <WorkOrderDetailDrawer
        open={detailOpen}
        order={detailOrder}
        onClose={() => setDetailOpen(false)}
        onSaveNotes={onSaveNotes}
      />

      <PaymentModal
        open={Boolean(paymentTarget)}
        order={paymentTarget}
        onClose={() => setPaymentTarget(null)}
        onConfirm={onPay}
      />

      <CancelOrderModal
        open={Boolean(cancelTarget)}
        order={cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={onCancel}
      />
    </div>
  );
}
