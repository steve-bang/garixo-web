'use client';

import { useMemo, useState } from 'react';
import { PlusCircle, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { InventoryItem } from '@/features/inventory/types';
import type { OrderPart } from '@/features/work-orders/types';
import { formatCurrencyUsd } from '@/lib/utils/format';

type WorkOrderPartsListProps = {
  parts: OrderPart[];
  inventoryItems: InventoryItem[];
  isSaving: boolean;
  readOnly?: boolean;
  onAddPart: (partId: string) => Promise<void>;
  onUpdatePartQuantity: (partId: string, quantity: number) => Promise<void>;
  onRemovePart: (partId: string) => Promise<void>;
};

export function WorkOrderPartsList({
  parts,
  inventoryItems,
  isSaving,
  readOnly = false,
  onAddPart,
  onUpdatePartQuantity,
  onRemovePart
}: WorkOrderPartsListProps): JSX.Element {
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');

  const selectedIds = useMemo(
    () => new Set(parts.map((part) => part.id)),
    [parts]
  );
  const stockMap = useMemo(() => {
    const map = new Map<string, number>();
    inventoryItems.forEach((item) => {
      map.set(item.id, item.quantity);
    });
    return map;
  }, [inventoryItems]);

  const filteredInventory = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    if (!normalized) {
      return inventoryItems.slice(0, 8);
    }

    return inventoryItems
      .filter((item) => item.name.toLowerCase().includes(normalized))
      .slice(0, 8);
  }, [inventoryItems, search]);

  return (
    <Card className="space-y-s3 p-s4">
      <div className="flex items-center justify-between gap-s2">
        <div>
          <h3 className="text-small font-semibold text-text-primary">
            Parts Used
          </h3>
          <p className="text-caption text-text-muted">
            {readOnly
              ? 'View only. This job is completed.'
              : 'Add parts and set quantity quickly.'}
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={readOnly || isSaving}
          onClick={() => setShowAdd((prev) => !prev)}
        >
          <PlusCircle className="mr-s1 size-4" />
          Add Part
        </Button>
      </div>

      {showAdd ? (
        <div className="space-y-s2 rounded-md border border-border bg-surface-default p-s3">
          <Input
            className="h-10"
            placeholder="Search part"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <div className="max-h-56 space-y-s1 overflow-y-auto">
            {filteredInventory.length > 0 ? (
              filteredInventory.map((item) => {
                const alreadyAdded = selectedIds.has(item.id);

                return (
                  <button
                    key={item.id}
                    type="button"
                    className="flex w-full items-center justify-between rounded-md border border-border bg-white px-s3 py-s2 text-left text-small hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={readOnly || alreadyAdded || isSaving}
                    onClick={() => void onAddPart(item.id)}
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-semibold text-text-primary">
                        {item.name}
                      </span>
                      <span className="block text-caption text-text-muted">
                        {formatCurrencyUsd(item.costPrice)} • Stock:{' '}
                        {item.quantity}
                      </span>
                    </span>
                    <span className="text-caption text-text-muted">
                      {alreadyAdded ? 'Added' : 'Add'}
                    </span>
                  </button>
                );
              })
            ) : (
              <p className="text-small text-text-muted">
                No parts match your search.
              </p>
            )}
          </div>
        </div>
      ) : null}

      {parts.length > 0 ? (
        <div className="space-y-s2">
          {parts.map((part) => {
            const stock = stockMap.get(part.id);

            return (
              <div
                key={part.id}
                className="grid gap-s2 rounded-md border border-border bg-white px-s3 py-s3 md:grid-cols-[1fr_110px_130px_auto] md:items-center"
              >
                <div>
                  <p className="text-small font-semibold text-text-primary">
                    {part.partName}
                  </p>
                  <p className="text-caption text-text-muted">
                    Unit: {formatCurrencyUsd(part.unitPrice)}
                  </p>
                  {stock !== undefined && stock <= 1 ? (
                    <p className="text-caption font-medium text-state-error">
                      Only {stock} left in stock
                    </p>
                  ) : null}
                </div>
                <Input
                  key={`${part.id}-${part.quantity}`}
                  className="h-10"
                  inputMode="numeric"
                  defaultValue={String(part.quantity)}
                  disabled={readOnly || isSaving}
                  aria-label={`Quantity for ${part.partName}`}
                  onBlur={(event) => {
                    const parsed = Number(event.target.value);
                    if (
                      !Number.isInteger(parsed) ||
                      parsed <= 0 ||
                      parsed === part.quantity
                    ) {
                      return;
                    }
                    void onUpdatePartQuantity(part.id, parsed);
                  }}
                />
                <p className="text-small font-semibold text-text-primary">
                  {formatCurrencyUsd(part.quantity * part.unitPrice)}
                </p>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-10"
                  disabled={readOnly || isSaving}
                  onClick={() => void onRemovePart(part.id)}
                >
                  <X className="size-4" />
                  <span className="sr-only">Remove {part.partName}</span>
                </Button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-md border border-dashed border-border px-s3 py-s4 text-center">
          <p className="text-small text-text-muted">No parts added yet.</p>
        </div>
      )}
    </Card>
  );
}
