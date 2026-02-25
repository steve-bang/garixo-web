import { Search } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import type { CustomerStatus, SpendingTier } from '@/features/customers/types';

type CustomersFiltersProps = {
  searchInput: string;
  status?: CustomerStatus;
  spendingTier?: SpendingTier;
  onSearchInputChange: (value: string) => void;
  onStatusChange: (value?: CustomerStatus) => void;
  onSpendingTierChange: (value?: SpendingTier) => void;
  onRemoveStatus: () => void;
  onRemoveSpendingTier: () => void;
  onClear: () => void;
};

function labelize(value: string): string {
  return value
    .toLowerCase()
    .split('_')
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(' ');
}

export function CustomersFilters({
  searchInput,
  status,
  spendingTier,
  onSearchInputChange,
  onStatusChange,
  onSpendingTierChange,
  onRemoveStatus,
  onRemoveSpendingTier,
  onClear
}: CustomersFiltersProps): JSX.Element {
  return (
    <Card className="space-y-s3 p-s4">
      <div className="grid gap-s3 md:grid-cols-[1fr_180px_180px_auto] md:items-center">
        <div className="relative">
          <Search className="pointer-events-none absolute left-s3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
          <Input
            className="h-11 pl-9"
            placeholder="Search by name / phone / plate"
            value={searchInput}
            onChange={(event) => onSearchInputChange(event.target.value)}
          />
        </div>

        <Select
          className="h-11 w-full rounded-md border border-input-border bg-input px-s3 text-small text-input-foreground"
          value={status ?? ''}
          onChange={(event) =>
            onStatusChange(
              (event.target.value || undefined) as CustomerStatus | undefined
            )
          }
        >
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="VIP">VIP</option>
        </Select>

        <Select
          className="h-11 w-full rounded-md border border-input-border bg-input px-s3 text-small text-input-foreground"
          value={spendingTier ?? ''}
          onChange={(event) =>
            onSpendingTierChange(
              (event.target.value || undefined) as SpendingTier | undefined
            )
          }
        >
          <option value="">All Spending Tiers</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </Select>

        <Button variant="secondary" className="h-11" onClick={onClear}>
          Clear All
        </Button>
      </div>

      {status || spendingTier ? (
        <div className="flex flex-wrap items-center gap-s2">
          {status ? (
            <button type="button" onClick={onRemoveStatus}>
              <Badge variant="default">{labelize(status)} x</Badge>
            </button>
          ) : null}
          {spendingTier ? (
            <button type="button" onClick={onRemoveSpendingTier}>
              <Badge variant="default">{labelize(spendingTier)} x</Badge>
            </button>
          ) : null}
        </div>
      ) : null}
    </Card>
  );
}
