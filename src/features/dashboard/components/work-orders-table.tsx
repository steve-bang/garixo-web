import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/cn';
import type { WorkOrderRow } from '@/features/dashboard/types';

type WorkOrdersTableProps = {
  rows: WorkOrderRow[];
};

function statusToVariant(status: WorkOrderRow['status']): 'default' | 'success' | 'warning' | 'info' {
  switch (status) {
    case 'completed':
      return 'success';
    case 'waiting_parts':
      return 'warning';
    case 'in_progress':
      return 'info';
    default:
      return 'default';
  }
}

function formatStatus(status: WorkOrderRow['status']): string {
  return status.replace('_', ' ');
}

export function WorkOrdersTable({ rows }: WorkOrdersTableProps): JSX.Element {
  return (
    <section aria-label="Recent Work Orders">
      <Card className="overflow-hidden p-0">
        <div className="flex items-center justify-between border-b border-border px-s4 py-s3">
          <div>
            <h2 className="text-h3">Recent Work Orders</h2>
            <p className="text-small text-text-muted">Operational queue with financial alignment</p>
          </div>
          <Badge variant="default">Standard Density</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[840px] text-left text-small">
            <thead className="bg-table-header text-table-header-text">
              <tr>
                <th className="px-s4 py-s3 font-semibold">Order</th>
                <th className="px-s4 py-s3 font-semibold">Customer</th>
                <th className="px-s4 py-s3 font-semibold">Vehicle</th>
                <th className="px-s4 py-s3 font-semibold">Service</th>
                <th className="px-s4 py-s3 text-right font-semibold">Amount</th>
                <th className="px-s4 py-s3 font-semibold">Status</th>
                <th className="px-s4 py-s3 font-semibold">Updated</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className={cn(
                    'border-t border-border bg-surface-default text-text-primary transition-colors hover:bg-surface-hover',
                    row.isSelected && 'border-l-strong border-l-primary-600 bg-primary-50/60 dark:bg-primary-900/20'
                  )}
                >
                  <td className="px-s4 py-s3 font-medium">{row.id}</td>
                  <td className="px-s4 py-s3">{row.customer}</td>
                  <td className="px-s4 py-s3">{row.vehicle}</td>
                  <td className="px-s4 py-s3">{row.service}</td>
                  <td className="px-s4 py-s3 text-right tabular-nums">{row.amount}</td>
                  <td className="px-s4 py-s3">
                    <Badge variant={statusToVariant(row.status)}>{formatStatus(row.status)}</Badge>
                  </td>
                  <td className="px-s4 py-s3 text-text-secondary">{row.updatedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </section>
  );
}
