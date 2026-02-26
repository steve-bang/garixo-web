import { Search } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import type {
  InventoryCategory,
  StockStatus
} from '@/features/inventory/types';

type InventoryFiltersProps = {
  searchInput: string;
  category?: InventoryCategory;
  stockStatus?: StockStatus;
  sort: 'default' | 'name_asc' | 'name_desc' | 'quantity_asc' | 'quantity_desc';
  onSearchInputChange: (value: string) => void;
  onCategoryChange: (value?: InventoryCategory) => void;
  onStockStatusChange: (value?: StockStatus) => void;
  onSortChange: (
    value:
      | 'default'
      | 'name_asc'
      | 'name_desc'
      | 'quantity_asc'
      | 'quantity_desc'
  ) => void;
  onClear: () => void;
};

export function InventoryFilters({
  searchInput,
  category,
  stockStatus,
  sort,
  onSearchInputChange,
  onCategoryChange,
  onStockStatusChange,
  onSortChange,
  onClear
}: InventoryFiltersProps): JSX.Element {
  return (
    <Card className="space-y-s3 p-s4">
      <div className="grid gap-s3 md:grid-cols-[1fr_180px_180px_180px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-s3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
          <Input
            className="h-11 pl-9"
            placeholder="Search parts by name"
            value={searchInput}
            onChange={(event) => onSearchInputChange(event.target.value)}
          />
        </div>

        <Select
          className="h-11 w-full rounded-md border border-input-border bg-input px-s3 text-small text-input-foreground"
          value={category ?? ''}
          onChange={(event) =>
            onCategoryChange(
              (event.target.value || undefined) as InventoryCategory | undefined
            )
          }
        >
          <option value="">All Categories</option>
          <option value="ENGINE">Engine</option>
          <option value="OIL">Oil</option>
          <option value="TIRE">Tire</option>
          <option value="BRAKE">Brake</option>
          <option value="ELECTRICAL">Electrical</option>
        </Select>

        <Select
          className="h-11 w-full rounded-md border border-input-border bg-input px-s3 text-small text-input-foreground"
          value={stockStatus ?? ''}
          onChange={(event) =>
            onStockStatusChange(
              (event.target.value || undefined) as StockStatus | undefined
            )
          }
        >
          <option value="">All Stock Status</option>
          <option value="IN_STOCK">In Stock</option>
          <option value="LOW_STOCK">Low Stock</option>
          <option value="OUT_OF_STOCK">Out of Stock</option>
        </Select>

        <Select
          className="h-11 w-full rounded-md border border-input-border bg-input px-s3 text-small text-input-foreground"
          value={sort}
          onChange={(event) =>
            onSortChange(
              event.target.value as
                | 'default'
                | 'name_asc'
                | 'name_desc'
                | 'quantity_asc'
                | 'quantity_desc'
            )
          }
        >
          <option value="default">Sort: Default</option>
          <option value="name_asc">Sort: Name A-Z</option>
          <option value="name_desc">Sort: Name Z-A</option>
          <option value="quantity_asc">Sort: Quantity Low-High</option>
          <option value="quantity_desc">Sort: Quantity High-Low</option>
        </Select>
      </div>

      <div className="flex items-center justify-between gap-s2">
        <div className="flex flex-wrap items-center gap-s2">
          {category ? <Badge variant="default">{category} x</Badge> : null}
          {stockStatus ? (
            <Badge variant="default">{stockStatus} x</Badge>
          ) : null}
        </div>
        <Button variant="secondary" onClick={onClear}>
          Clear All
        </Button>
      </div>
    </Card>
  );
}
