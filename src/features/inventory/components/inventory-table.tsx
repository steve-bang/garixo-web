import { Boxes, Pencil, SlidersHorizontal, Trash2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { InventoryItem, StockStatus } from '@/features/inventory/types';
import { formatCurrency, getStockStatus } from '@/features/inventory/utils';
import { cn } from '@/lib/utils/cn';

type UserRole = 'OWNER' | 'MANAGER' | 'STAFF';

type InventoryTableProps = {
  items: InventoryItem[];
  currentUserRole: UserRole;
  onAddFirst: () => void;
  onEdit: (item: InventoryItem) => void;
  onAdjust: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
};

function statusStyle(status: StockStatus): { text: string; className: string } {
  if (status === 'IN_STOCK') {
    return { text: 'In Stock', className: 'bg-badge-success text-badge-success-text' };
  }

  if (status === 'LOW_STOCK') {
    return { text: 'Low Stock', className: 'bg-warning-100 text-warning-800' };
  }

  return { text: 'Out of Stock', className: 'bg-error-100 text-error-800' };
}

export function InventoryTable({ items, currentUserRole, onAddFirst, onEdit, onAdjust, onDelete }: InventoryTableProps): JSX.Element {
  if (items.length === 0) {
    return (
      <Card className="grid min-h-[260px] place-items-center p-s6 text-center">
        <div className="space-y-s2">
          <div className="mx-auto grid size-10 place-items-center rounded-full bg-surface-hover text-text-secondary">
            <Boxes className="size-5" />
          </div>
          <h3 className="text-h3">No inventory items yet.</h3>
          <p className="text-small text-text-muted">Add parts to start managing your stock.</p>
          <div className="pt-s2">
            <Button onClick={onAddFirst}>Add your first item</Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1120px] text-left text-small">
          <thead className="bg-table-header text-table-header-text">
            <tr>
              <th className="px-s4 py-s3 font-semibold">Item</th>
              <th className="px-s4 py-s3 font-semibold">Part Code</th>
              <th className="px-s4 py-s3 font-semibold">Category</th>
              <th className="px-s4 py-s3 text-right font-semibold">Quantity</th>
              <th className="px-s4 py-s3 text-right font-semibold">Minimum Level</th>
              <th className="px-s4 py-s3 text-right font-semibold">Cost Price</th>
              <th className="px-s4 py-s3 font-semibold">Status</th>
              <th className="px-s4 py-s3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const status = getStockStatus(item);
              const badge = statusStyle(status);
              const quantityClass =
                status === 'OUT_OF_STOCK'
                  ? 'text-state-error'
                  : status === 'LOW_STOCK'
                    ? 'text-warning-700 dark:text-warning-300'
                    : 'text-text-primary';

              return (
                <tr key={item.id} className="border-t border-border bg-surface-default text-text-primary hover:bg-surface-hover">
                  <td className="px-s4 py-s3">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      {item.notes ? <p className="text-caption text-text-muted">{item.notes}</p> : null}
                    </div>
                  </td>
                  <td className="px-s4 py-s3 text-text-secondary">{item.sku ?? '-'}</td>
                  <td className="px-s4 py-s3">{item.category}</td>
                  <td className={cn('px-s4 py-s3 text-right tabular-nums', quantityClass)}>{item.quantity}</td>
                  <td className="px-s4 py-s3 text-right tabular-nums text-text-secondary">{item.minLevel}</td>
                  <td className="px-s4 py-s3 text-right tabular-nums">{formatCurrency(item.costPrice)}</td>
                  <td className="px-s4 py-s3">
                    <Badge variant="default" className={badge.className}>
                      {badge.text}
                    </Badge>
                  </td>
                  <td className="px-s4 py-s3">
                    <div className="flex flex-wrap items-center gap-s2">
                      <Button size="sm" variant="ghost" onClick={() => onEdit(item)}>
                        <Pencil className="size-4" />
                        Edit
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => onAdjust(item)}>
                        <SlidersHorizontal className="size-4" />
                        Adjust
                      </Button>
                      {currentUserRole === 'OWNER' ? (
                        <Button size="sm" variant="ghost" className="text-state-error" onClick={() => onDelete(item)}>
                          <Trash2 className="size-4" />
                          Delete
                        </Button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
