'use client';

import { Search, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { OrderService } from '@/features/work-orders/types';
import type { Service } from '@/features/services/types';
import { formatCurrencyVnd } from '@/features/work-orders/utils';

type Props = {
  query: string;
  loading: boolean;
  available: Service[];
  selected: OrderService[];
  onQueryChange: (value: string) => void;
  onAdd: (service: Service) => void;
  onRemove: (serviceId: string) => void;
  onUpdatePrice: (serviceId: string, price: number) => void;
  onQuickAdd: () => void;
};

export function ServiceSelector({
  query,
  loading,
  available,
  selected,
  onQueryChange,
  onAdd,
  onRemove,
  onUpdatePrice,
  onQuickAdd
}: Props): JSX.Element {
  return (
    <div className="space-y-s2">
      <label className="text-small font-medium text-text-secondary">
        Services
      </label>

      <div className="relative">
        <Search className="pointer-events-none absolute left-s3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
        <Input
          className="h-11 pl-9"
          placeholder="Search service"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
        />
      </div>

      <div className="max-h-[180px] overflow-y-auto rounded-md border border-border bg-surface-default">
        {loading ? (
          <p className="px-s3 py-s2 text-small text-text-muted">
            Searching services...
          </p>
        ) : null}

        {!loading && available.length === 0 ? (
          <div className="space-y-s2 px-s3 py-s3">
            <p className="text-small text-text-muted">
              No services found. Add one quickly.
            </p>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onQuickAdd}
            >
              + Add quick service
            </Button>
          </div>
        ) : null}

        {!loading
          ? available.map((service) => (
              <button
                key={service.id}
                type="button"
                className="flex w-full items-center justify-between gap-s2 border-t border-border px-s3 py-s2 text-left first:border-t-0 hover:bg-surface-hover"
                onClick={() => onAdd(service)}
              >
                <div>
                  <p className="text-small font-medium text-text-primary">
                    {service.name}
                  </p>
                  <p className="text-caption text-text-muted">
                    {service.estimatedTime}
                  </p>
                </div>
                <p className="text-small text-text-secondary">
                  {formatCurrencyVnd(service.price)}
                </p>
              </button>
            ))
          : null}
      </div>

      {selected.length > 0 ? (
        <div className="space-y-s2 rounded-md border border-border bg-surface-default p-s3">
          {selected.map((service) => (
            <div
              key={service.id}
              className="grid gap-s2 md:grid-cols-[1fr_150px_auto] md:items-center"
            >
              <p className="text-small font-medium text-text-primary">
                {service.name}
              </p>
              <Input
                className="h-10"
                inputMode="numeric"
                value={String(service.price)}
                onChange={(event) =>
                  onUpdatePrice(service.id, Number(event.target.value) || 0)
                }
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onRemove(service.id)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
