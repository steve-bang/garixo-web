'use client';

import { Search, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { InventoryItem } from '@/features/inventory/types';
import type { OrderPart } from '@/features/work-orders/types';
import { formatCurrencyUsd } from '@/lib/utils/format';


type Props = {
  open: boolean;
  query: string;
  loading: boolean;
  available: InventoryItem[];
  selected: OrderPart[];
  onToggleOpen: () => void;
  onQueryChange: (value: string) => void;
  onAdd: (item: InventoryItem) => void;
  onRemove: (partId: string) => void;
  onChangeQuantity: (partId: string, quantity: number) => void;
};

export function InventorySelector({
  open,
  query,
  loading,
  available,
  selected,
  onToggleOpen,
  onQueryChange,
  onAdd,
  onRemove,
  onChangeQuantity
}: Props): JSX.Element {
  if (!open) {
    return (
      <div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onToggleOpen}
        >
          + Add Part
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-s2 rounded-md border border-border p-s3">
      <div className="flex items-center justify-between gap-s2">
        <label className="text-small font-medium text-text-secondary">
          Parts (optional)
        </label>
        <Button type="button" variant="ghost" size="sm" onClick={onToggleOpen}>
          Hide
        </Button>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-s3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
        <Input
          className="h-11 pl-9"
          placeholder="Search inventory"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
        />
      </div>

      <div className="max-h-[180px] overflow-y-auto rounded-md border border-border bg-surface-default">
        {loading ? (
          <p className="px-s3 py-s2 text-small text-text-muted">
            Searching parts...
          </p>
        ) : null}

        {!loading
          ? available.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onAdd(item)}
                className="flex w-full items-center justify-between gap-s2 border-t border-border px-s3 py-s2 text-left first:border-t-0 hover:bg-surface-hover"
              >
                <div>
                  <p className="text-small font-medium text-text-primary">
                    {item.name}
                  </p>
                  <p className="text-caption text-text-muted">
                    Stock: {item.quantity} • {formatCurrencyUsd(item.costPrice)}
                  </p>
                </div>
                {item.quantity <= 1 ? (
                  <span className="text-caption text-warning-700">
                    Only {item.quantity} left
                  </span>
                ) : null}
              </button>
            ))
          : null}
      </div>

      {selected.length > 0 ? (
        <div className="space-y-s2 rounded-md border border-border bg-surface-default p-s3">
          {selected.map((part) => (
            <div
              key={part.id}
              className="grid gap-s2 md:grid-cols-[1fr_120px_auto] md:items-center"
            >
              <p className="text-small font-medium text-text-primary">
                {part.partName}
              </p>
              <Input
                className="h-10"
                inputMode="numeric"
                value={String(part.quantity)}
                onChange={(event) =>
                  onChangeQuantity(part.id, Number(event.target.value) || 1)
                }
              />
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => onRemove(part.id)}
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
