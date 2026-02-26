import { Search } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import type { ServiceCategory, ServiceStatus } from '@/features/services/types';

type ServicesFiltersProps = {
  searchInput: string;
  onSearchInputChange: (value: string) => void;
  category?: ServiceCategory;
  status?: ServiceStatus;
  onCategoryChange: (value?: ServiceCategory) => void;
  onStatusChange: (value?: ServiceStatus) => void;
  onRemoveCategory: () => void;
  onRemoveStatus: () => void;
  onClear: () => void;
};

export function ServicesFilters({
  searchInput,
  onSearchInputChange,
  category,
  status,
  onCategoryChange,
  onStatusChange,
  onRemoveCategory,
  onRemoveStatus,
  onClear
}: ServicesFiltersProps): JSX.Element {
  const hasFilters = Boolean(category || status);
  const formatLabel = (value: string) =>
    value
      .toLowerCase()
      .split('_')
      .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
      .join(' ');

  return (
    <Card className="space-y-s3 p-s4">
      <div className="grid gap-s3 md:grid-cols-[1fr_200px_180px_auto] md:items-center">
        <div className="relative">
          <Search className="pointer-events-none absolute left-s3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
          <Input
            className="h-11 pl-9"
            placeholder="Search by service name"
            value={searchInput}
            onChange={(event) => onSearchInputChange(event.target.value)}
          />
        </div>

        <Select
          className="h-11 w-full rounded-md border border-input-border bg-input px-s3 text-small text-input-foreground"
          value={category ?? ''}
          onChange={(event) =>
            onCategoryChange(
              (event.target.value || undefined) as ServiceCategory | undefined
            )
          }
        >
          <option value="">All Categories</option>
          <option value="ENGINE">Engine</option>
          <option value="OIL">Oil</option>
          <option value="BRAKE">Brake</option>
          <option value="TIRE">Tire</option>
          <option value="ELECTRICAL">Electrical</option>
          <option value="OTHER">Other</option>
        </Select>

        <Select
          className="h-11 w-full rounded-md border border-input-border bg-input px-s3 text-small text-input-foreground"
          value={status ?? ''}
          onChange={(event) =>
            onStatusChange(
              (event.target.value || undefined) as ServiceStatus | undefined
            )
          }
        >
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </Select>

        <Button variant="secondary" className="h-11" onClick={onClear}>
          Clear All
        </Button>
      </div>

      {hasFilters ? (
        <div className="flex flex-wrap items-center gap-s2">
          {category ? (
            <button type="button" onClick={onRemoveCategory}>
              <Badge variant="default">{formatLabel(category)} x</Badge>
            </button>
          ) : null}
          {status ? (
            <button type="button" onClick={onRemoveStatus}>
              <Badge variant="default">{formatLabel(status)} x</Badge>
            </button>
          ) : null}
        </div>
      ) : null}
    </Card>
  );
}
