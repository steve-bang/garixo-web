import { Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { WorkOrderStatusEnum } from '@/features/work-orders/types';
import type { WorkOrderStatus, Worker } from '@/features/work-orders/types';

type Props = {
  searchInput: string;
  workerId?: string;
  status?: WorkOrderStatus;
  dateFilter: 'all' | 'today' | 'this_week' | 'this_month' | 'custom';
  dateFrom: string;
  dateTo: string;
  workers: Worker[];
  onSearchInputChange: (value: string) => void;
  onWorkerChange: (value?: string) => void;
  onStatusChange: (value?: WorkOrderStatus) => void;
  onDateFilterChange: (
    value: 'all' | 'today' | 'this_week' | 'this_month' | 'custom'
  ) => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onClear: () => void;
};

export function WorkOrdersFilters({
  searchInput,
  workerId,
  status,
  dateFilter,
  dateFrom,
  dateTo,
  workers,
  onSearchInputChange,
  onWorkerChange,
  onStatusChange,
  onDateFilterChange,
  onDateFromChange,
  onDateToChange,
  onClear
}: Props): JSX.Element {
  const statusOptions: Array<{ label: string; value: WorkOrderStatus }> = [
    { label: 'Draft', value: WorkOrderStatusEnum.Draft },
    {
      label: 'Waiting For Approval',
      value: WorkOrderStatusEnum.WaitingForApproval
    },
    { label: 'In Progress', value: WorkOrderStatusEnum.InProgress },
    { label: 'Waiting For Parts', value: WorkOrderStatusEnum.WaitingForParts },
    { label: 'Completed', value: WorkOrderStatusEnum.Completed },
    { label: 'Paid', value: WorkOrderStatusEnum.Paid },
    { label: 'Cancelled', value: WorkOrderStatusEnum.Cancelled }
  ];

  return (
    <Card className="space-y-s3 p-s4">
      <div className="grid gap-s3 md:grid-cols-[1fr_200px_220px_180px_auto] md:items-center">
        <div className="relative">
          <Search className="pointer-events-none absolute left-s3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
          <Input
            className="h-11 pl-9"
            placeholder="Search plate, order, customer"
            value={searchInput}
            onChange={(event) => onSearchInputChange(event.target.value)}
          />
        </div>

        <Select
          className="h-11 w-full rounded-md border border-input-border bg-input px-s3 text-small text-input-foreground"
          value={workerId ?? ''}
          onChange={(event) => onWorkerChange(event.target.value || undefined)}
        >
          <option value="">All Workers</option>
          {workers.map((worker) => (
            <option key={worker.id} value={worker.id}>
              {worker.name} ({worker.activeJobs})
            </option>
          ))}
        </Select>

        <Select
          className="h-11 w-full rounded-md border border-input-border bg-input px-s3 text-small text-input-foreground"
          value={status ?? ''}
          onChange={(event) =>
            onStatusChange(
              (event.target.value || undefined) as WorkOrderStatus | undefined
            )
          }
        >
          <option value="">All Status</option>
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>

        <Select
          className="h-11 w-full rounded-md border border-input-border bg-input px-s3 text-small text-input-foreground"
          value={dateFilter}
          onChange={(event) =>
            onDateFilterChange(
              event.target.value as
                | 'all'
                | 'today'
                | 'this_week'
                | 'this_month'
                | 'custom'
            )
          }
        >
          <option value="all">All Dates</option>
          <option value="today">Today</option>
          <option value="this_week">This Week</option>
          <option value="this_month">This Month</option>
          <option value="custom">Custom</option>
        </Select>

        <Button variant="secondary" className="h-11" onClick={onClear}>
          Clear All
        </Button>
      </div>

      {dateFilter === 'custom' ? (
        <div className="grid gap-s3 md:grid-cols-2">
          <Input
            type="date"
            className="h-11"
            value={dateFrom}
            onChange={(event) => onDateFromChange(event.target.value)}
          />
          <Input
            type="date"
            className="h-11"
            value={dateTo}
            onChange={(event) => onDateToChange(event.target.value)}
          />
        </div>
      ) : null}
    </Card>
  );
}
