'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { getServices } from '@/features/services/service';
import { workOrdersQueryKey } from '@/features/work-orders/api';
import {
  useUpdateWorkOrder,
  useUpdateWorkOrderStatus,
  useWorkOrder
} from '@/features/work-orders/hooks';
import { WorkOrderStatusEnum } from '@/features/work-orders/types';
import type {
  OrderPart,
  OrderService,
  WorkOrder,
  WorkOrderStatus
} from '@/features/work-orders/types';
import {
  allowedTransitions,
  computeTotalAmount,
  statusLabel
} from '@/features/work-orders/utils';
import type { InventoryItem } from '@/features/inventory/types';
import { WorkOrderActionPanel } from '@/features/work-orders/components/work-order-action-panel';
import { InvoiceSummaryCard } from '@/features/invoices/components/invoice-summary-card';
import { WorkOrderPartsList } from '@/features/work-orders/components/work-order-parts-list';
import { WorkOrderServicesList } from '@/features/work-orders/components/work-order-services-list';
import { WorkOrderStatusBadge } from '@/features/work-orders/components/work-order-status-badge';
import type { Worker } from '@/features/work-orders/types';
import { formatCurrencyUsd, formatDateTime } from '@/lib/utils/format';

type Props = {
  orderId: string;
};

type InventoryApiResponse = {
  success: boolean;
  data?: { items: InventoryItem[] };
};
type WorkersApiResponse = { success: boolean; data?: { workers: Worker[] } };

async function getInventoryItems(): Promise<InventoryItem[]> {
  const response = await fetch('/api/inventory?page=1&pageSize=100');
  const payload = (await response.json()) as InventoryApiResponse;
  if (!payload.success || !payload.data) {
    return [];
  }
  return payload.data.items;
}

async function getWorkers(): Promise<Worker[]> {
  const response = await fetch('/api/work-orders?page=1&pageSize=1');
  const payload = (await response.json()) as WorkersApiResponse;
  if (!payload.success || !payload.data) {
    return [];
  }
  return payload.data.workers;
}

export function WorkOrderDetailPage({ orderId }: Props): JSX.Element {
  const toast = useToast();
  const queryClient = useQueryClient();
  const detailQueryKey = [...workOrdersQueryKey, 'detail', orderId] as const;

  const orderQuery = useWorkOrder(orderId);
  const servicesQuery = useQuery({
    queryKey: ['work-order-detail', 'services'],
    queryFn: () =>
      getServices({ status: 'ACTIVE', page: 1, pageSize: 20, sort: 'name_asc' })
  });
  const inventoryQuery = useQuery({
    queryKey: ['work-order-detail', 'inventory'],
    queryFn: getInventoryItems
  });
  const workersQuery = useQuery({
    queryKey: ['work-order-detail', 'workers'],
    queryFn: getWorkers
  });

  const updateMutation = useUpdateWorkOrder();
  const statusMutation = useUpdateWorkOrderStatus();

  const [notes, setNotes] = useState('');
  const [assignWorkerId, setAssignWorkerId] = useState('');
  const [pendingStatus, setPendingStatus] = useState<WorkOrderStatus | null>(
    null
  );
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [isSavingWorker, setIsSavingWorker] = useState(false);
  const [isSavingStatus, setIsSavingStatus] = useState(false);
  const [isSavingServices, setIsSavingServices] = useState(false);
  const [isSavingParts, setIsSavingParts] = useState(false);

  const order = orderQuery.data;

  useEffect(() => {
    if (!order) return;
    setNotes(order.notes ?? '');
    setAssignWorkerId(order.workerId ?? '');
  }, [order]);

  if (orderQuery.isLoading) {
    return <WorkOrderDetailSkeleton />;
  }

  if (orderQuery.isError || !order) {
    return (
      <div className="p-s8 text-small text-state-error">
        Could not load work order.
      </div>
    );
  }
  const isFinalStatus =
    order.status === WorkOrderStatusEnum.Paid ||
    order.status === WorkOrderStatusEnum.Cancelled;
  const isReadOnlyContent =
    order.status === WorkOrderStatusEnum.Completed ||
    order.status === WorkOrderStatusEnum.Paid ||
    order.status === WorkOrderStatusEnum.Cancelled;
  const nextStatuses = allowedTransitions[order.status] ?? [];

  const setOrderCache = (updater: (current: WorkOrder) => WorkOrder): void => {
    queryClient.setQueryData<WorkOrder | undefined>(
      detailQueryKey,
      (current) => (current ? updater(current) : current)
    );
  };

  const invalidateWorkOrderQueries = (): void => {
    void queryClient.invalidateQueries({ queryKey: workOrdersQueryKey });
  };

  const handleSaveNotes = async (): Promise<void> => {
    if (notes.trim() === (order.notes ?? '').trim()) {
      return;
    }

    const previousNotes = order.notes ?? '';
    setIsSavingNotes(true);
    setOrderCache((current) => ({ ...current, notes }));

    try {
      const updated = await updateMutation.mutateAsync({
        id: order.id,
        payload: { notes }
      });
      queryClient.setQueryData(detailQueryKey, updated);
      toast.success('Notes updated.');
    } catch (error) {
      setOrderCache((current) => ({ ...current, notes: previousNotes }));
      setNotes(previousNotes);
      toast.error(
        error instanceof Error ? error.message : 'Could not update notes.'
      );
    } finally {
      setIsSavingNotes(false);
      invalidateWorkOrderQueries();
    }
  };

  const handleAssignWorker = async (): Promise<void> => {
    if (isFinalStatus) {
      toast.error('This status is locked. No further changes are allowed.');
      return;
    }

    if (!assignWorkerId) {
      toast.error('Please select a worker.');
      return;
    }

    const selectedWorker = (workersQuery.data ?? []).find(
      (worker) => worker.id === assignWorkerId
    );
    if (!selectedWorker) {
      toast.error('Worker not found.');
      return;
    }

    const previousWorkerId = order.workerId ?? '';
    const previousWorkerName = order.workerName ?? '';
    setIsSavingWorker(true);
    setOrderCache((current) => ({
      ...current,
      workerId: selectedWorker.id,
      workerName: selectedWorker.name
    }));

    try {
      const updated = await updateMutation.mutateAsync({
        id: order.id,
        payload: {
          workerId: selectedWorker.id,
          workerName: selectedWorker.name
        }
      });
      queryClient.setQueryData(detailQueryKey, updated);
      toast.success('Worker assigned.');
    } catch (error) {
      setOrderCache((current) => ({
        ...current,
        workerId: previousWorkerId,
        workerName: previousWorkerName
      }));
      setAssignWorkerId(previousWorkerId);
      toast.error(
        error instanceof Error ? error.message : 'Could not assign worker.'
      );
    } finally {
      setIsSavingWorker(false);
      invalidateWorkOrderQueries();
    }
  };

  const handleChangeStatus = async (status: WorkOrderStatus): Promise<void> => {
    if (!nextStatuses.includes(status)) {
      toast.error(
        `Invalid transition: ${statusLabel(order.status)} → ${statusLabel(status)}`
      );
      return;
    }

    const previousStatus = order.status;
    setIsSavingStatus(true);
    setOrderCache((current) => ({ ...current, status }));

    try {
      const updated = await statusMutation.mutateAsync({
        id: order.id,
        payload: { status }
      });
      queryClient.setQueryData(detailQueryKey, updated);
      toast.success(`Status updated to ${statusLabel(status)}.`);
      setPendingStatus(null);

      if (status === WorkOrderStatusEnum.Completed) {
        void inventoryQuery.refetch();
      }
    } catch (error) {
      setOrderCache((current) => ({ ...current, status: previousStatus }));
      setPendingStatus(null);
      toast.error(
        error instanceof Error ? error.message : 'Could not update status.'
      );
    } finally {
      setIsSavingStatus(false);
      invalidateWorkOrderQueries();
    }
  };

  const handleConfirmStatusChange = async (): Promise<void> => {
    if (!pendingStatus) {
      return;
    }
    await handleChangeStatus(pendingStatus);
  };

  const handleApplyServices = async (serviceIds: string[]): Promise<void> => {
    if (isReadOnlyContent) {
      toast.error('This job is completed. You can only edit notes.');
      return;
    }
    const catalog = servicesQuery.data?.items ?? [];
    const catalogMap = new Map(catalog.map((service) => [service.id, service]));
    const existingMap = new Map(
      order.services.map((service) => [service.id, service])
    );

    const nextServices: OrderService[] = serviceIds
      .map((serviceId) => {
        const existing = existingMap.get(serviceId);
        if (existing) {
          return existing;
        }

        const fromCatalog = catalogMap.get(serviceId);
        if (!fromCatalog) {
          return null;
        }

        return {
          id: fromCatalog.id,
          name: fromCatalog.name,
          price: fromCatalog.price
        } satisfies OrderService;
      })
      .filter((service): service is OrderService => service !== null);

    const previousServices = order.services;
    const previousTotalAmount = order.totalAmount;
    setIsSavingServices(true);
    setOrderCache((current) => ({
      ...current,
      services: nextServices,
      totalAmount: computeTotalAmount(nextServices, current.parts)
    }));

    try {
      const updated = await updateMutation.mutateAsync({
        id: order.id,
        payload: {
          services: nextServices,
          parts: order.parts,
          plateNumber: order.plateNumber,
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          priority: order.priority
        }
      });
      queryClient.setQueryData(detailQueryKey, updated);

      toast.success('Services updated.');
    } catch (error) {
      setOrderCache((current) => ({
        ...current,
        services: previousServices,
        totalAmount: previousTotalAmount
      }));
      toast.error(
        error instanceof Error ? error.message : 'Could not update services.'
      );
    } finally {
      setIsSavingServices(false);
      invalidateWorkOrderQueries();
    }
  };

  const handleUpdateServicePrice = async (
    serviceId: string,
    nextPrice: number
  ): Promise<void> => {
    if (isReadOnlyContent) {
      toast.error('This job is completed. You can only edit notes.');
      return;
    }
    if (!Number.isFinite(nextPrice) || nextPrice < 0) {
      return;
    }

    const nextServices = order.services.map((service) =>
      service.id === serviceId ? { ...service, price: nextPrice } : service
    );

    const previousServices = order.services;
    const previousTotalAmount = order.totalAmount;
    setIsSavingServices(true);
    setOrderCache((current) => ({
      ...current,
      services: nextServices,
      totalAmount: computeTotalAmount(nextServices, current.parts)
    }));

    try {
      const updated = await updateMutation.mutateAsync({
        id: order.id,
        payload: { services: nextServices, parts: order.parts }
      });
      queryClient.setQueryData(detailQueryKey, updated);
    } catch (error) {
      setOrderCache((current) => ({
        ...current,
        services: previousServices,
        totalAmount: previousTotalAmount
      }));
      toast.error(
        error instanceof Error ? error.message : 'Could not update service.'
      );
    } finally {
      setIsSavingServices(false);
      invalidateWorkOrderQueries();
    }
  };

  const handleRemoveService = async (serviceId: string): Promise<void> => {
    if (isReadOnlyContent) {
      toast.error('This job is completed. You can only edit notes.');
      return;
    }
    const nextServices = order.services.filter(
      (service) => service.id !== serviceId
    );
    const previousServices = order.services;
    const previousTotalAmount = order.totalAmount;
    setIsSavingServices(true);
    setOrderCache((current) => ({
      ...current,
      services: nextServices,
      totalAmount: computeTotalAmount(nextServices, current.parts)
    }));

    try {
      const updated = await updateMutation.mutateAsync({
        id: order.id,
        payload: { services: nextServices, parts: order.parts }
      });
      queryClient.setQueryData(detailQueryKey, updated);
      toast.success('Service removed.');
    } catch (error) {
      setOrderCache((current) => ({
        ...current,
        services: previousServices,
        totalAmount: previousTotalAmount
      }));
      toast.error(
        error instanceof Error ? error.message : 'Could not remove service.'
      );
    } finally {
      setIsSavingServices(false);
      invalidateWorkOrderQueries();
    }
  };

  const handleAddPart = async (partId: string): Promise<void> => {
    if (isReadOnlyContent) {
      toast.error('This job is completed. You can only edit notes.');
      return;
    }
    const item = inventoryQuery.data?.find((entry) => entry.id === partId);
    if (!item) return;

    const found = order.parts.find((part) => part.id === item.id);
    if (found) {
      toast.error('Part already added. Update quantity instead.');
      return;
    }

    const nextParts: OrderPart[] = [
      ...order.parts,
      {
        id: item.id,
        partName: item.name,
        quantity: 1,
        unitPrice: item.costPrice
      }
    ];

    const previousParts = order.parts;
    const previousTotalAmount = order.totalAmount;
    setIsSavingParts(true);
    setOrderCache((current) => ({
      ...current,
      parts: nextParts,
      totalAmount: computeTotalAmount(current.services, nextParts)
    }));

    try {
      const updated = await updateMutation.mutateAsync({
        id: order.id,
        payload: {
          services: order.services,
          parts: nextParts,
          plateNumber: order.plateNumber,
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          priority: order.priority
        }
      });
      queryClient.setQueryData(detailQueryKey, updated);

      toast.success('Part added.');
    } catch (error) {
      setOrderCache((current) => ({
        ...current,
        parts: previousParts,
        totalAmount: previousTotalAmount
      }));
      toast.error(
        error instanceof Error ? error.message : 'Could not add part.'
      );
    } finally {
      setIsSavingParts(false);
      invalidateWorkOrderQueries();
    }
  };

  const handleUpdatePartQuantity = async (
    partId: string,
    quantity: number
  ): Promise<void> => {
    if (isReadOnlyContent) {
      toast.error('This job is completed. You can only edit notes.');
      return;
    }
    if (!Number.isInteger(quantity) || quantity <= 0) {
      return;
    }

    const nextParts = order.parts.map((part) =>
      part.id === partId ? { ...part, quantity } : part
    );

    const previousParts = order.parts;
    const previousTotalAmount = order.totalAmount;
    setIsSavingParts(true);
    setOrderCache((current) => ({
      ...current,
      parts: nextParts,
      totalAmount: computeTotalAmount(current.services, nextParts)
    }));

    try {
      const updated = await updateMutation.mutateAsync({
        id: order.id,
        payload: { services: order.services, parts: nextParts }
      });
      queryClient.setQueryData(detailQueryKey, updated);
    } catch (error) {
      setOrderCache((current) => ({
        ...current,
        parts: previousParts,
        totalAmount: previousTotalAmount
      }));
      toast.error(
        error instanceof Error ? error.message : 'Could not update part.'
      );
    } finally {
      setIsSavingParts(false);
      invalidateWorkOrderQueries();
    }
  };

  const handleRemovePart = async (partId: string): Promise<void> => {
    if (isReadOnlyContent) {
      toast.error('This job is completed. You can only edit notes.');
      return;
    }
    const nextParts = order.parts.filter((part) => part.id !== partId);
    const previousParts = order.parts;
    const previousTotalAmount = order.totalAmount;
    setIsSavingParts(true);
    setOrderCache((current) => ({
      ...current,
      parts: nextParts,
      totalAmount: computeTotalAmount(current.services, nextParts)
    }));

    try {
      const updated = await updateMutation.mutateAsync({
        id: order.id,
        payload: { services: order.services, parts: nextParts }
      });
      queryClient.setQueryData(detailQueryKey, updated);
      toast.success('Part removed.');
    } catch (error) {
      setOrderCache((current) => ({
        ...current,
        parts: previousParts,
        totalAmount: previousTotalAmount
      }));
      toast.error(
        error instanceof Error ? error.message : 'Could not remove part.'
      );
    } finally {
      setIsSavingParts(false);
      invalidateWorkOrderQueries();
    }
  };

  const completedAt =
    [...order.timeline]
      .reverse()
      .find(
        (event) =>
          event.status === WorkOrderStatusEnum.Completed ||
          event.status === WorkOrderStatusEnum.Paid
      )?.timestamp ?? undefined;

  const isMutating = isSavingWorker || isSavingStatus;

  return (
    <div className="grid gap-s4 p-s4 pb-24 md:p-s6 xl:grid-cols-[280px_minmax(0,1fr)_320px] xl:gap-s6 xl:p-s8 xl:pb-s8">
      <aside className="space-y-s4 xl:sticky xl:top-s6 xl:self-start">
        <Card className="p-s4">
          <p className="text-caption text-text-muted">Order Code</p>
          <p className="text-h3">{order.orderCode}</p>
          <div className="mt-s2">
            <WorkOrderStatusBadge status={order.status} />
          </div>
        </Card>

        <Card className="p-s4">
          <h3 className="text-small font-semibold">Customer</h3>
          <p className="mt-s2 text-base font-semibold text-text-primary">
            {order.customerName}
          </p>
          <a
            href={`tel:${order.customerPhone}`}
            className="text-primary text-small hover:underline"
          >
            {order.customerPhone}
          </a>
          <div className="mt-s3">
            <Link
              href={
                order.customerId
                  ? `/dashboard/customers/${order.customerId}/vehicles`
                  : `/dashboard/customers?search=${encodeURIComponent(order.customerPhone)}`
              }
            >
              <Button size="sm" variant="secondary">
                View Customer
              </Button>
            </Link>
          </div>
        </Card>

        <Card className="p-s4">
          <h3 className="text-small font-semibold">Vehicle</h3>
          <p className="mt-s2 text-xl font-bold text-text-primary">
            {order.plateNumber}
          </p>
          <p className="text-small text-text-secondary">
            {order.vehicleModel || 'Model not set'}
          </p>
        </Card>

        <Card className="space-y-s3 p-s4">
          <h3 className="text-small font-semibold">Worker</h3>
          {order.workerName ? (
            <p className="text-small text-text-primary">{order.workerName}</p>
          ) : (
            <>
              <p className="text-small text-text-muted">
                No worker assigned yet.
              </p>
              <Select
                className="h-11 w-full rounded-md border border-input-border bg-input px-s3 text-small"
                value={assignWorkerId}
                disabled={isFinalStatus || isMutating || workersQuery.isLoading}
                onChange={(event) => setAssignWorkerId(event.target.value)}
              >
                <option value="">Select worker</option>
                {(workersQuery.data ?? []).map((worker) => (
                  <option key={worker.id} value={worker.id}>
                    {worker.name}
                  </option>
                ))}
              </Select>
              <Button
                type="button"
                className="w-full"
                variant="secondary"
                disabled={
                  isFinalStatus ||
                  isMutating ||
                  workersQuery.isLoading ||
                  !assignWorkerId
                }
                onClick={() => void handleAssignWorker()}
              >
                {isSavingWorker ? 'Assigning...' : 'Assign Worker'}
              </Button>
              {isSavingWorker ? (
                <p className="text-caption text-text-muted">
                  Assigning worker...
                </p>
              ) : null}
            </>
          )}
        </Card>
      </aside>

      <section className="space-y-s4">
        <WorkOrderServicesList
          services={order.services}
          availableServices={servicesQuery.data?.items ?? []}
          isSaving={isSavingServices}
          readOnly={isReadOnlyContent}
          onApplyServices={handleApplyServices}
          onUpdateServicePrice={handleUpdateServicePrice}
          onRemoveService={handleRemoveService}
        />
        {isSavingServices ? (
          <p className="text-caption text-text-muted">Updating services...</p>
        ) : null}

        <WorkOrderPartsList
          parts={order.parts}
          inventoryItems={inventoryQuery.data ?? []}
          isSaving={isSavingParts}
          readOnly={isReadOnlyContent}
          onAddPart={handleAddPart}
          onUpdatePartQuantity={handleUpdatePartQuantity}
          onRemovePart={handleRemovePart}
        />
        {isSavingParts ? (
          <p className="text-caption text-text-muted">Updating parts...</p>
        ) : null}

        <Card className="p-s4">
          <h3 className="text-small font-semibold">Notes</h3>
          <Textarea
            className="mt-s2"
            rows={4}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            disabled={isSavingNotes}
          />
          <div className="mt-s3 flex justify-end">
            <Button
              size="sm"
              disabled={isSavingNotes}
              onClick={() => void handleSaveNotes()}
            >
              {isSavingNotes ? 'Saving...' : 'Save Notes'}
            </Button>
          </div>
        </Card>

        <Card className="p-s4">
          <h3 className="text-small font-semibold">Timeline</h3>
          <div className="mt-s2 space-y-s2">
            {order.timeline.length === 0 ? (
              <p className="text-small text-text-muted">
                No timeline updates yet.
              </p>
            ) : (
              order.timeline.map((event, index) => (
                <div
                  key={`${event.status}-${event.timestamp}-${index}`}
                  className="flex items-center justify-between gap-s3 text-small"
                >
                  <span className="font-medium text-text-primary">
                    {statusLabel(event.status)}
                  </span>
                  <span className="text-text-muted">
                    {formatDateTime(event.timestamp)}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>
      </section>

      <aside className="space-y-s4 xl:sticky xl:top-s6 xl:self-start">
        <WorkOrderActionPanel
          status={order.status}
          totalAmount={order.totalAmount}
          completedAt={completedAt}
          isSaving={isSavingStatus}
          nextStatuses={nextStatuses}
          onRequestStatusChange={setPendingStatus}
        />
        <InvoiceSummaryCard workOrderId={order.id} orderStatus={order.status} />
        {isSavingStatus ? (
          <p className="text-caption text-text-muted">Updating status...</p>
        ) : null}
      </aside>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-white/95 px-s4 py-s3 shadow-sm xl:hidden">
        <div className="mx-auto flex max-w-screen-md items-center justify-between gap-s3">
          <div>
            <p className="text-caption text-text-muted">Total</p>
            <p className="text-small font-semibold text-text-primary">
              {formatCurrencyUsd(order.totalAmount)}
            </p>
          </div>
          {nextStatuses.length === 0 ? (
            <Button className="h-11 min-w-[160px]" disabled>
              No Actions
            </Button>
          ) : (
            <Button
              className="h-11 min-w-[160px]"
              onClick={() => setPendingStatus(nextStatuses[0] ?? null)}
              disabled={isSavingStatus}
            >
              {isSavingStatus ? 'Updating...' : statusLabel(nextStatuses[0])}
            </Button>
          )}
        </div>
      </div>

      <Modal
        open={Boolean(pendingStatus)}
        onClose={() => setPendingStatus(null)}
        title="Confirm Status Update"
        width="sm"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setPendingStatus(null)}
              disabled={isSavingStatus}
            >
              Cancel
            </Button>
            <Button
              onClick={() => void handleConfirmStatusChange()}
              disabled={isSavingStatus || !pendingStatus}
            >
              {isSavingStatus ? 'Updating...' : 'Confirm'}
            </Button>
          </>
        }
      >
        <p className="text-small text-text-secondary">
          {pendingStatus
            ? `Change status from ${statusLabel(order.status)} to ${statusLabel(
                pendingStatus
              )}?`
            : ''}
        </p>
      </Modal>
    </div>
  );
}

function WorkOrderDetailSkeleton(): JSX.Element {
  return (
    <div className="grid gap-s4 p-s4 pb-24 md:p-s6 xl:grid-cols-[280px_minmax(0,1fr)_320px] xl:gap-s6 xl:p-s8 xl:pb-s8">
      <aside className="space-y-s4">
        <div className="h-24 animate-pulse rounded-lg border border-border bg-surface-default" />
        <div className="h-32 animate-pulse rounded-lg border border-border bg-surface-default" />
        <div className="h-24 animate-pulse rounded-lg border border-border bg-surface-default" />
      </aside>

      <section className="space-y-s4">
        <div className="h-64 animate-pulse rounded-lg border border-border bg-surface-default" />
        <div className="h-64 animate-pulse rounded-lg border border-border bg-surface-default" />
        <div className="h-44 animate-pulse rounded-lg border border-border bg-surface-default" />
        <div className="h-52 animate-pulse rounded-lg border border-border bg-surface-default" />
      </section>

      <aside className="space-y-s4">
        <div className="h-64 animate-pulse rounded-lg border border-border bg-surface-default" />
      </aside>
    </div>
  );
}
