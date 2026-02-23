'use client';

import { Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Customer } from '@/features/customers/types';

type Props = {
  query: string;
  loading: boolean;
  items: Customer[];
  selectedCustomerId?: string;
  onQueryChange: (value: string) => void;
  onSelect: (customer: Customer) => void;
  onCreateNew: () => void;
};

export function CustomerAutocomplete({
  query,
  loading,
  items,
  selectedCustomerId,
  onQueryChange,
  onSelect,
  onCreateNew
}: Props): JSX.Element {
  return (
    <div className="space-y-s2">
      <label className="text-small font-medium text-text-secondary">
        Customer
      </label>
      <div className="relative">
        <Search className="pointer-events-none absolute left-s3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
        <Input
          className="h-11 pl-9"
          placeholder="Search customer by name, phone, plate"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          autoFocus
        />
      </div>

      <div className="max-h-[220px] overflow-y-auto rounded-md border border-border bg-surface-default">
        {loading ? (
          <p className="px-s3 py-s2 text-small text-text-muted">
            Searching customers...
          </p>
        ) : null}

        {!loading && items.length === 0 ? (
          <div className="space-y-s2 px-s3 py-s3">
            <p className="text-small text-text-muted">No customers found.</p>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onCreateNew}
            >
              + Create new customer
            </Button>
          </div>
        ) : null}

        {!loading
          ? items.map((customer) => {
              const latestPlate = customer.vehicles[0]?.plate ?? '-';
              const active = selectedCustomerId === customer.id;

              return (
                <button
                  key={customer.id}
                  type="button"
                  onClick={() => onSelect(customer)}
                  className={`flex w-full items-center justify-between gap-s2 border-t border-border px-s3 py-s2 text-left first:border-t-0 hover:bg-surface-hover ${
                    active ? 'bg-primary-50' : ''
                  }`}
                >
                  <div>
                    <p className="text-small font-medium text-text-primary">
                      {customer.name}
                    </p>
                    <p className="text-caption text-text-muted">
                      {customer.phone}
                    </p>
                  </div>
                  <p className="text-caption text-text-muted">{latestPlate}</p>
                </button>
              );
            })
          : null}
      </div>
    </div>
  );
}
