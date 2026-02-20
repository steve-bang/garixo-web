import { Search } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { VehicleStatus } from '@/features/vehicles/types';

type BrandFilter = 'TOYOTA' | 'HONDA' | 'HYUNDAI' | 'FORD' | 'OTHER';

type VehiclesFiltersProps = {
  searchInput: string;
  brand?: BrandFilter;
  status?: VehicleStatus;
  onSearchInputChange: (value: string) => void;
  onBrandChange: (value?: BrandFilter) => void;
  onStatusChange: (value?: VehicleStatus) => void;
  onClear: () => void;
};

function labelize(value: string): string {
  return value
    .toLowerCase()
    .split('_')
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(' ');
}

export function VehiclesFilters({
  searchInput,
  brand,
  status,
  onSearchInputChange,
  onBrandChange,
  onStatusChange,
  onClear
}: VehiclesFiltersProps): JSX.Element {
  return (
    <Card className="space-y-s3 p-s4">
      <div className="grid gap-s3 md:grid-cols-[1fr_180px_200px_auto] md:items-center">
        <div className="relative">
          <Search className="pointer-events-none absolute left-s3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
          <Input
            className="h-11 pl-9"
            placeholder="Search by plate, customer, phone"
            value={searchInput}
            onChange={(event) => onSearchInputChange(event.target.value)}
          />
        </div>

        <select
          className="h-11 w-full rounded-md border border-input-border bg-input px-s3 text-small text-input-foreground"
          value={brand ?? ''}
          onChange={(event) => onBrandChange((event.target.value || undefined) as BrandFilter | undefined)}
        >
          <option value="">All Brands</option>
          <option value="TOYOTA">Toyota</option>
          <option value="HONDA">Honda</option>
          <option value="HYUNDAI">Hyundai</option>
          <option value="FORD">Ford</option>
          <option value="OTHER">Other</option>
        </select>

        <select
          className="h-11 w-full rounded-md border border-input-border bg-input px-s3 text-small text-input-foreground"
          value={status ?? ''}
          onChange={(event) => onStatusChange((event.target.value || undefined) as VehicleStatus | undefined)}
        >
          <option value="">All Status</option>
          <option value="IN_SERVICE">In Service</option>
          <option value="COMPLETED">Completed</option>
          <option value="OVERDUE">Overdue</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>

        <Button variant="secondary" className="h-11" onClick={onClear}>
          Clear All
        </Button>
      </div>

      {brand || status ? (
        <div className="flex flex-wrap items-center gap-s2">
          {brand ? <Badge variant="default">{labelize(brand)}</Badge> : null}
          {status ? <Badge variant="default">{labelize(status)}</Badge> : null}
        </div>
      ) : null}
    </Card>
  );
}
