'use client';

import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  useCreateInvoiceFromWorkOrder,
  useInvoices,
  useSendInvoice
} from '@/features/invoices/hooks';
import type { WorkOrderStatus } from '@/features/work-orders/types';
import { WorkOrderStatusEnum } from '@/features/work-orders/types';
import { useToast } from '@/hooks/use-toast';
import { formatCurrencyUsd, formatDate } from '@/lib/utils/format';

type InvoiceSummaryCardProps = {
  workOrderId: string;
  orderStatus: WorkOrderStatus;
};

/**
 * Compact owner-friendly invoice panel embedded in work order detail.
 * Lets users create, open, and send invoice with minimal clicks.
 */
export function InvoiceSummaryCard({
  workOrderId,
  orderStatus
}: InvoiceSummaryCardProps): JSX.Element {
  const toast = useToast();
  const invoicesQuery = useInvoices({ workOrderId, page: 1, pageSize: 1 });
  const createMutation = useCreateInvoiceFromWorkOrder();
  const sendMutation = useSendInvoice();

  const invoice = invoicesQuery.data?.items[0] ?? null;
  const canCreate =
    orderStatus === WorkOrderStatusEnum.Completed ||
    orderStatus === WorkOrderStatusEnum.Paid;

  const handleCreate = async (): Promise<void> => {
    try {
      await createMutation.mutateAsync({ workOrderId });
      await invoicesQuery.refetch();
      toast.success('Invoice created.');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Could not create invoice.'
      );
    }
  };

  const handleSend = async (): Promise<void> => {
    if (!invoice) {
      return;
    }

    try {
      await sendMutation.mutateAsync({
        id: invoice.id
      });
      await invoicesQuery.refetch();
      toast.success('Invoice sent.');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Could not send invoice.'
      );
    }
  };

  return (
    <Card className="space-y-s3 p-s4">
      <h3 className="text-small font-semibold">Invoice</h3>

      {invoicesQuery.isLoading ? (
        <div className="h-20 animate-pulse rounded-md bg-surface-hover" />
      ) : invoice ? (
        <>
          <div className="space-y-s1 text-small">
            <p className="font-semibold text-text-primary">
              {invoice.invoiceNumber}
            </p>
            <p className="text-text-secondary">
              Total: {formatCurrencyUsd(invoice.total)}
            </p>
            <p className="text-text-secondary">
              Due: {formatDate(invoice.dueDate)}
            </p>
            <p className="text-text-muted">
              Sent {invoice.sentCount}{' '}
              {invoice.sentCount === 1 ? 'time' : 'times'}
            </p>
          </div>

          <div className="flex gap-s2">
            <Link href={`/dashboard/invoices/${invoice.id}`} className="flex-1">
              <Button variant="secondary" className="w-full">
                Open Invoice
              </Button>
            </Link>
            <Button
              className="flex-1"
              onClick={() => void handleSend()}
              disabled={sendMutation.isPending}
            >
              {sendMutation.isPending ? 'Sending...' : 'Send Email'}
            </Button>
          </div>
        </>
      ) : (
        <>
          <p className="text-small text-text-muted">
            {canCreate
              ? 'Create a simple invoice from this completed work order.'
              : 'Invoice will be available after this work order is completed.'}
          </p>
          <Button
            onClick={() => void handleCreate()}
            disabled={!canCreate || createMutation.isPending}
          >
            {createMutation.isPending ? 'Creating...' : 'Create Invoice'}
          </Button>
        </>
      )}
    </Card>
  );
}
