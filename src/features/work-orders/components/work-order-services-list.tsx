'use client';

import { useMemo, useState } from 'react';
import { PlusCircle, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import type { Service } from '@/features/services/types';
import type { OrderService } from '@/features/work-orders/types';
import { formatCurrencyUsd } from '@/lib/utils/format';

type WorkOrderServicesListProps = {
  services: OrderService[];
  availableServices: Service[];
  isSaving: boolean;
  readOnly?: boolean;
  onApplyServices: (serviceIds: string[]) => Promise<void>;
  onUpdateServicePrice: (serviceId: string, price: number) => Promise<void>;
  onRemoveService: (serviceId: string) => Promise<void>;
};

export function WorkOrderServicesList({
  services,
  availableServices,
  isSaving,
  readOnly = false,
  onApplyServices,
  onUpdateServicePrice,
  onRemoveService
}: WorkOrderServicesListProps): JSX.Element {
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [pendingSelectedIds, setPendingSelectedIds] = useState<string[]>([]);
  const selectedIds = useMemo(
    () => new Set(services.map((service) => service.id)),
    [services]
  );
  const selectedIdList = useMemo(
    () => services.map((service) => service.id),
    [services]
  );

  const filtered = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    if (!normalized) {
      return [...availableServices].sort((a, b) =>
        a.name.localeCompare(b.name)
      );
    }

    return [...availableServices]
      .filter((service) => service.name.toLowerCase().includes(normalized))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [availableServices, search]);

  const serviceTime = useMemo(() => {
    const map = new Map<string, string>();
    availableServices.forEach((service) => {
      map.set(service.id, service.estimatedTime || '60 minutes');
    });
    return map;
  }, [availableServices]);

  const pendingSet = useMemo(
    () => new Set(pendingSelectedIds),
    [pendingSelectedIds]
  );
  const hasSelectionChanged = useMemo(() => {
    if (pendingSelectedIds.length !== selectedIdList.length) {
      return true;
    }

    return pendingSelectedIds.some((id) => !selectedIds.has(id));
  }, [pendingSelectedIds, selectedIdList.length, selectedIds]);

  const toggleServiceSelection = (serviceId: string): void => {
    setPendingSelectedIds((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleApply = async (): Promise<void> => {
    if (readOnly) {
      return;
    }
    await onApplyServices(pendingSelectedIds);
    setModalOpen(false);
    setSearch('');
  };

  const openModal = (): void => {
    if (readOnly) {
      return;
    }
    setPendingSelectedIds(selectedIdList);
    setSearch('');
    setModalOpen(true);
  };

  return (
    <Card className="space-y-s3 p-s4">
      <div className="flex items-center justify-between gap-s2">
        <div>
          <h3 className="text-small font-semibold text-text-primary">
            Services
          </h3>
          <p className="text-caption text-text-muted">
            {readOnly
              ? 'View only. This job is completed.'
              : 'Add and adjust service prices inline.'}
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={openModal}
          disabled={readOnly || isSaving}
        >
          <PlusCircle className="mr-s1 size-4" />
          Add Service
        </Button>
      </div>

      {services.length > 0 ? (
        <div className="space-y-s2">
          {services.map((service) => (
            <div
              key={service.id}
              className="grid gap-s2 rounded-md border border-border bg-white px-s3 py-s3 md:grid-cols-[1fr_190px_auto] md:items-center"
            >
              <div className="min-w-0">
                <p className="truncate text-small font-semibold text-text-primary">
                  {service.name}
                </p>
                <p className="text-caption text-text-muted">
                  {serviceTime.get(service.id) ?? '60 minutes'}
                </p>
              </div>
              <div className="space-y-s1">
                <p className="text-caption font-medium text-text-secondary">
                  Price: {formatCurrencyUsd(service.price)}
                </p>
                <Input
                  key={`${service.id}-${service.price}`}
                  className="h-10"
                  inputMode="decimal"
                  defaultValue={String(service.price)}
                  disabled={readOnly || isSaving}
                  aria-label={`Price for ${service.name}`}
                  onBlur={(event) => {
                    const parsed = Number(event.target.value);
                    if (
                      !Number.isFinite(parsed) ||
                      parsed < 0 ||
                      parsed === service.price
                    ) {
                      return;
                    }
                    void onUpdateServicePrice(service.id, parsed);
                  }}
                />
              </div>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-10"
                disabled={readOnly || isSaving}
                onClick={() => void onRemoveService(service.id)}
              >
                <X className="size-4" />
                <span className="sr-only">Remove {service.name}</span>
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-md border border-dashed border-border px-s3 py-s4 text-center">
          <p className="text-small text-text-muted">No services added yet.</p>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="mt-s2"
            onClick={openModal}
            disabled={readOnly || isSaving}
          >
            <PlusCircle className="mr-s1 size-4" />
            Add Service
          </Button>
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSearch('');
        }}
        title="Add Services"
        width="lg"
        footer={
          <>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setModalOpen(false);
                setSearch('');
              }}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => void handleApply()}
              disabled={readOnly || isSaving || !hasSelectionChanged}
            >
              {isSaving ? 'Applying...' : 'Apply'}
            </Button>
          </>
        }
      >
        <div className="space-y-s3">
          <p className="text-small text-text-muted">
            Select one or more services for this work order.
          </p>
          <Input
            className="h-10"
            placeholder="Search service name"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <div className="max-h-[360px] space-y-s1 overflow-y-auto rounded-md border border-border bg-surface-default p-s2">
            {filtered.length > 0 ? (
              filtered.map((service) => {
                const checked = pendingSet.has(service.id);

                return (
                  <label
                    key={service.id}
                    className="flex cursor-pointer items-start gap-s2 rounded-md border border-transparent px-s2 py-s2 hover:border-border hover:bg-white"
                  >
                    <input
                      type="checkbox"
                      className="mt-[2px] size-4 rounded border border-input-border"
                      checked={checked}
                      disabled={readOnly || isSaving}
                      onChange={() => toggleServiceSelection(service.id)}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-small font-semibold text-text-primary">
                        {service.name}
                      </span>
                      <span className="block text-caption text-text-muted">
                        {formatCurrencyUsd(service.price)} •{' '}
                        {service.estimatedTime}
                      </span>
                    </span>
                    {selectedIds.has(service.id) ? (
                      <span className="text-caption text-text-muted">
                        In this job
                      </span>
                    ) : null}
                  </label>
                );
              })
            ) : (
              <p className="px-s2 py-s2 text-small text-text-muted">
                No services found.
              </p>
            )}
          </div>
        </div>
      </Modal>
    </Card>
  );
}
