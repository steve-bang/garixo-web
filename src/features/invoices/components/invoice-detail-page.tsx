'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { getCustomerById } from '@/features/customers/service';
import {
  InvoiceRequestError,
  createInvoiceShare,
  getCurrentInvoiceShare,
  revokeInvoiceShare
} from '@/features/invoices/service';
import {
  useInvoice,
  useSendInvoice,
  useUpdateInvoice
} from '@/features/invoices/hooks';
import type {
  InvoiceLineItem,
  InvoicePaymentTerm,
  UpdateInvoiceInput
} from '@/features/invoices/types';
import { useWorkOrder } from '@/features/work-orders/hooks';
import { WorkOrderStatusEnum } from '@/features/work-orders/types';
import { useToast } from '@/hooks/use-toast';
import { trackEvent } from '@/lib/analytics/ga';
import { formatCurrencyUsd, formatDate } from '@/lib/utils/format';

const paymentTermOptions: Array<{ value: InvoicePaymentTerm; label: string }> =
  [
    { value: 'DUE_ON_RECEIPT', label: 'Due on receipt' },
    { value: 'NET_7', label: 'Due in 7 days' },
    { value: 'NET_15', label: 'Due in 15 days' },
    { value: 'NET_30', label: 'Due in 30 days' }
  ];

type InvoiceDetailPageProps = {
  invoiceId: string;
};

function toInputDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return date.toISOString().slice(0, 10);
}

function fromInputDate(value: string): string {
  return new Date(`${value}T00:00:00.000Z`).toISOString();
}

export function InvoiceDetailPage({
  invoiceId
}: InvoiceDetailPageProps): JSX.Element {
  const toast = useToast();
  const invoiceQuery = useInvoice(invoiceId);
  const updateMutation = useUpdateInvoice();
  const sendMutation = useSendInvoice();

  const invoice = invoiceQuery.data;
  const workOrderQuery = useWorkOrder(invoice?.workOrderId);

  const [dueDate, setDueDate] = useState('');
  const [paymentTerm, setPaymentTerm] =
    useState<InvoicePaymentTerm>('DUE_ON_RECEIPT');
  const [taxEnabled, setTaxEnabled] = useState(false);
  const [taxRate, setTaxRate] = useState('0');
  const [taxLabel, setTaxLabel] = useState('Sales Tax');
  const [notes, setNotes] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [publicUrl, setPublicUrl] = useState('');
  const [publicUrlExpiresAt, setPublicUrlExpiresAt] = useState<string | null>(
    null
  );
  const [isSharing, setIsSharing] = useState(false);
  const [isRevokingShare, setIsRevokingShare] = useState(false);
  const [isSendRateLimitModalOpen, setIsSendRateLimitModalOpen] =
    useState(false);
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([]);
  const [initializedInvoiceId, setInitializedInvoiceId] = useState<
    string | null
  >(null);
  const [
    customerEmailHydratedForInvoiceId,
    setCustomerEmailHydratedForInvoiceId
  ] = useState<string | null>(null);

  useEffect(() => {
    if (!invoice || initializedInvoiceId === invoice.id) {
      return;
    }

    setDueDate(toInputDate(invoice.dueDate));
    setPaymentTerm(invoice.paymentTerm);
    setTaxEnabled(invoice.tax.enabled);
    setTaxRate(String(invoice.tax.rate));
    setTaxLabel(invoice.tax.label);
    setNotes(invoice.notes ?? '');
    setRecipientEmail(invoice.customerEmail ?? '');
    setLineItems(invoice.lineItems);
    setInitializedInvoiceId(invoice.id);
    setCustomerEmailHydratedForInvoiceId(null);
  }, [invoice, initializedInvoiceId]);

  useEffect(() => {
    if (!invoice?.customerId || !invoice?.id) {
      return;
    }
    if (customerEmailHydratedForInvoiceId === invoice.id) {
      return;
    }
    if (recipientEmail.trim()) {
      setCustomerEmailHydratedForInvoiceId(invoice.id);
      return;
    }

    // Prefill send-email field from live customer profile when invoice snapshot has no email.
    void (async () => {
      try {
        const detail = await getCustomerById(invoice.customerId as string);
        const customerEmail = detail.customer.email?.trim() ?? '';
        if (customerEmail) {
          setRecipientEmail(customerEmail);
        }
      } finally {
        setCustomerEmailHydratedForInvoiceId(invoice.id);
      }
    })();
  }, [
    invoice?.customerId,
    invoice?.id,
    recipientEmail,
    customerEmailHydratedForInvoiceId
  ]);

  useEffect(() => {
    if (!invoice?.id) {
      return;
    }

    void (async () => {
      try {
        const currentShare = await getCurrentInvoiceShare(invoice.id);
        if (!currentShare) {
          setPublicUrl('');
          setPublicUrlExpiresAt(null);
          return;
        }

        setPublicUrl(currentShare.publicUrl);
        setPublicUrlExpiresAt(currentShare.expiresAt);
      } catch {
        setPublicUrl('');
        setPublicUrlExpiresAt(null);
      }
    })();
  }, [invoice?.id]);

  const subtotal = useMemo(
    () =>
      lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
    [lineItems]
  );

  const taxAmount = useMemo(() => {
    const rate = Number(taxRate) || 0;
    return taxEnabled ? (subtotal * rate) / 100 : 0;
  }, [subtotal, taxRate, taxEnabled]);

  const total = useMemo(() => subtotal + taxAmount, [subtotal, taxAmount]);

  const isLockedByPayment =
    workOrderQuery.data?.status === WorkOrderStatusEnum.Paid;

  const handleLineItemChange = (
    key: string,
    patch: Partial<InvoiceLineItem>
  ): void => {
    setLineItems((current) =>
      current.map((item) =>
        item.key === key
          ? {
              ...item,
              ...patch,
              quantity:
                patch.quantity !== undefined
                  ? Math.max(0, Number(patch.quantity) || 0)
                  : item.quantity,
              unitPrice:
                patch.unitPrice !== undefined
                  ? Math.max(0, Number(patch.unitPrice) || 0)
                  : item.unitPrice
            }
          : item
      )
    );
  };

  const handleSave = async (): Promise<void> => {
    if (!invoice) {
      return;
    }

    if (!dueDate) {
      toast.error('Please choose a due date.');
      return;
    }

    const payload: UpdateInvoiceInput = {
      dueDate: fromInputDate(dueDate),
      paymentTerm,
      notes,
      tax: {
        enabled: taxEnabled,
        rate: Math.max(0, Number(taxRate) || 0),
        label: taxLabel.trim() || 'Sales Tax'
      },
      lineItems: lineItems.map((item) => ({
        ...item,
        quantity: Math.max(0, Number(item.quantity) || 0),
        unitPrice: Math.max(0, Number(item.unitPrice) || 0),
        amount: Math.max(
          0,
          Number((Number(item.quantity) * Number(item.unitPrice)).toFixed(2))
        )
      }))
    };

    try {
      await updateMutation.mutateAsync({ id: invoice.id, payload });
      toast.success('Invoice updated.');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Could not update invoice.'
      );
    }
  };

  const handleSend = async (): Promise<void> => {
    if (!invoice) {
      return;
    }

    try {
      await sendMutation.mutateAsync({
        id: invoice.id,
        payload: {
          recipientEmail: recipientEmail.trim() || undefined
        }
      });
      trackEvent('invoice_email_sent', {
        from_detail_page: true
      });
      toast.success('Invoice sent successfully.');
      void invoiceQuery.refetch();
    } catch (error) {
      if (error instanceof InvoiceRequestError && error.status === 429) {
        setIsSendRateLimitModalOpen(true);
        return;
      }
      toast.error(
        error instanceof Error ? error.message : 'Could not send invoice.'
      );
    }
  };

  const handleCreateShare = async (): Promise<void> => {
    if (!invoice) {
      return;
    }

    setIsSharing(true);
    try {
      const data = await createInvoiceShare(invoice.id, {
        expiresInDays: 90
      });
      setPublicUrl(data.publicUrl);
      setPublicUrlExpiresAt(data.expiresAt);
      toast.success('Public invoice link is ready.');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Could not create public link.'
      );
    } finally {
      setIsSharing(false);
    }
  };

  const handleRevokeShare = async (): Promise<void> => {
    if (!invoice) {
      return;
    }

    setIsRevokingShare(true);
    try {
      await revokeInvoiceShare(invoice.id);
      setPublicUrl('');
      setPublicUrlExpiresAt(null);
      toast.success('Public link revoked.');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Could not revoke link.'
      );
    } finally {
      setIsRevokingShare(false);
    }
  };

  const handleCopyShareUrl = async (): Promise<void> => {
    if (!publicUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(publicUrl);
      toast.success('Public link copied.');
    } catch {
      toast.error('Could not copy link. Please copy it manually.');
    }
  };

  if (invoiceQuery.isLoading) {
    return (
      <div className="space-y-s4">
        <div className="h-24 animate-pulse rounded-lg border border-border bg-surface-default" />
        <div className="h-64 animate-pulse rounded-lg border border-border bg-surface-default" />
      </div>
    );
  }

  if (invoiceQuery.isError || !invoice) {
    return (
      <p className="text-small text-state-error">Could not load invoice.</p>
    );
  }

  return (
    <div className="mx-auto max-w-[1040px] space-y-s4">
      <div className="flex flex-wrap items-center justify-between gap-s3">
        <div>
          <p className="text-caption text-text-muted">Invoice</p>
          <h1 className="text-h2">{invoice.invoiceNumber}</h1>
          <p className="text-small text-text-muted">
            Work order {invoice.orderCode} • Created{' '}
            {formatDate(invoice.createdAt)}
          </p>
        </div>
        <div className="flex gap-s2">
          <Link href={`/dashboard/work-orders/${invoice.workOrderId}`}>
            <Button variant="secondary">Back to Work Order</Button>
          </Link>
          <Button
            onClick={() => void handleSave()}
            disabled={updateMutation.isPending || isLockedByPayment}
          >
            {updateMutation.isPending ? 'Saving...' : 'Save Invoice'}
          </Button>
        </div>
      </div>

      {isLockedByPayment ? (
        <Card className="p-s3">
          <p className="text-small text-text-secondary">
            This invoice is locked because the work order is already paid.
          </p>
        </Card>
      ) : null}

      <div className="grid gap-s4 lg:grid-cols-[1fr_320px]">
        <Card className="space-y-s4 p-s4">
          <h2 className="text-h3">Invoice Details</h2>

          <div className="grid gap-s3 sm:grid-cols-2">
            <div className="space-y-s1">
              <label className="text-small font-medium text-text-secondary">
                Customer
              </label>
              <Input value={invoice.customerName} disabled />
            </div>
            <div className="space-y-s1">
              <label className="text-small font-medium text-text-secondary">
                Vehicle
              </label>
              <Input value={invoice.vehicleLabel} disabled />
            </div>
            <div className="space-y-s1">
              <label className="text-small font-medium text-text-secondary">
                Payment Term
              </label>
              <Select
                value={paymentTerm}
                disabled={isLockedByPayment}
                onChange={(event) =>
                  setPaymentTerm(event.target.value as InvoicePaymentTerm)
                }
              >
                {paymentTermOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-s1">
              <label className="text-small font-medium text-text-secondary">
                Due Date
              </label>
              <Input
                type="date"
                value={dueDate}
                disabled={isLockedByPayment}
                onChange={(event) => setDueDate(event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-s2">
            <p className="text-small font-medium text-text-secondary">Tax</p>
            <label className="inline-flex items-center gap-s2 rounded-md border border-border px-s3 py-s2">
              <input
                type="checkbox"
                checked={taxEnabled}
                disabled={isLockedByPayment}
                onChange={(event) => setTaxEnabled(event.target.checked)}
              />
              <span className="text-small text-text-secondary">Add tax</span>
            </label>

            <div className="grid gap-s3 sm:grid-cols-2">
              <div className="space-y-s1">
                <label className="text-caption font-medium text-text-muted">
                  Tax Label
                </label>
                <Input
                  value={taxLabel}
                  disabled={!taxEnabled || isLockedByPayment}
                  onChange={(event) => setTaxLabel(event.target.value)}
                  placeholder="Sales Tax"
                />
              </div>
              <div className="space-y-s1">
                <label className="text-caption font-medium text-text-muted">
                  Tax Rate (%)
                </label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  step={0.01}
                  value={taxRate}
                  disabled={!taxEnabled || isLockedByPayment}
                  onChange={(event) => setTaxRate(event.target.value)}
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          <div className="space-y-s2">
            <h3 className="text-small font-semibold text-text-primary">
              Line Items
            </h3>
            <div className="hidden text-caption font-medium uppercase tracking-wide text-text-muted sm:grid sm:grid-cols-[1.5fr_100px_120px_120px] sm:gap-s2 sm:px-s1">
              <span>Item</span>
              <span className="text-center">Qty</span>
              <span className="text-right">Unit Price</span>
              <span className="text-right">Amount</span>
            </div>
            <div className="space-y-s2">
              {lineItems.map((item) => (
                <div
                  key={item.key}
                  className="grid gap-s2 rounded-md border border-border p-s3 sm:grid-cols-[1.5fr_100px_120px_120px]"
                >
                  <div className="space-y-s1">
                    <label className="text-caption font-medium text-text-muted sm:hidden">
                      Item
                    </label>
                    <Input
                      value={item.name}
                      disabled={isLockedByPayment}
                      onChange={(event) =>
                        handleLineItemChange(item.key, {
                          name: event.target.value
                        })
                      }
                    />
                  </div>
                  <div className="space-y-s1">
                    <label className="text-caption font-medium text-text-muted sm:hidden">
                      Qty
                    </label>
                    <Input
                      type="number"
                      min={1}
                      value={item.quantity}
                      disabled={isLockedByPayment}
                      onChange={(event) =>
                        handleLineItemChange(item.key, {
                          quantity: Number(event.target.value)
                        })
                      }
                    />
                  </div>
                  <div className="space-y-s1">
                    <label className="text-caption font-medium text-text-muted sm:hidden">
                      Unit Price
                    </label>
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      value={item.unitPrice}
                      disabled={isLockedByPayment}
                      onChange={(event) =>
                        handleLineItemChange(item.key, {
                          unitPrice: Number(event.target.value)
                        })
                      }
                    />
                  </div>
                  <div className="space-y-s1">
                    <label className="text-caption font-medium text-text-muted sm:hidden">
                      Amount
                    </label>
                    <Input
                      value={formatCurrencyUsd(item.quantity * item.unitPrice)}
                      disabled
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-s1">
            <label className="text-small font-medium text-text-secondary">
              Notes
            </label>
            <Textarea
              rows={3}
              value={notes}
              disabled={isLockedByPayment}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Optional note for customer"
            />
          </div>
        </Card>

        <div className="space-y-s4">
          <Card className="space-y-s2 p-s4">
            <h2 className="text-h3">Summary</h2>
            <div className="flex items-center justify-between text-small">
              <span className="text-text-secondary">Subtotal</span>
              <span className="font-medium">{formatCurrencyUsd(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-small">
              <span className="text-text-secondary">
                {taxEnabled ? `${taxLabel} (${taxRate}%)` : 'Tax'}
              </span>
              <span className="font-medium">
                {formatCurrencyUsd(taxAmount)}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-s2 text-small">
              <span className="font-semibold text-text-primary">Total</span>
              <span className="text-base font-bold text-text-primary">
                {formatCurrencyUsd(total)}
              </span>
            </div>
          </Card>

          <Card className="space-y-s3 p-s4">
            <h2 className="text-h3">Send Invoice</h2>
            <Input
              type="email"
              value={recipientEmail}
              onChange={(event) => setRecipientEmail(event.target.value)}
              placeholder="customer@email.com"
            />
            <Button
              className="w-full"
              onClick={() => void handleSend()}
              disabled={sendMutation.isPending}
            >
              {sendMutation.isPending ? 'Sending...' : 'Send Invoice Email'}
            </Button>
            <p className="text-caption text-text-muted">
              Sent {invoice.sentCount}{' '}
              {invoice.sentCount === 1 ? 'time' : 'times'}
              {invoice.lastSentAt
                ? ` • Last sent ${formatDate(invoice.lastSentAt)}`
                : ''}
            </p>
          </Card>

          <Card className="space-y-s3 p-s4">
            <h2 className="text-h3">Public Invoice Link</h2>
            <p className="text-caption text-text-muted">
              Share a simple read-only invoice link with your customer.
            </p>

            <Button
              className="w-full"
              variant="secondary"
              onClick={() => void handleCreateShare()}
              disabled={isSharing}
            >
              {isSharing
                ? 'Generating Link...'
                : publicUrl
                  ? 'Regenerate Link'
                  : 'Generate Public Link'}
            </Button>

            {publicUrl ? (
              <div className="space-y-s2">
                <Input value={publicUrl} readOnly />
                <div className="flex gap-s2">
                  <Button
                    type="button"
                    className="flex-1"
                    onClick={() => void handleCopyShareUrl()}
                  >
                    Copy Link
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="flex-1"
                    onClick={() => void handleRevokeShare()}
                    disabled={isRevokingShare}
                  >
                    {isRevokingShare ? 'Revoking...' : 'Revoke Link'}
                  </Button>
                </div>
                <p className="text-caption text-text-muted">
                  This link expires on{' '}
                  {publicUrlExpiresAt
                    ? formatDate(publicUrlExpiresAt)
                    : 'never'}
                  .
                </p>
              </div>
            ) : (
              <p className="text-caption text-text-muted">
                Generate a link when you are ready to share this invoice.
              </p>
            )}
          </Card>
        </div>
      </div>

      <Modal
        open={isSendRateLimitModalOpen}
        onClose={() => setIsSendRateLimitModalOpen(false)}
        title="Please wait before sending again"
        width="sm"
        footer={
          <Button onClick={() => setIsSendRateLimitModalOpen(false)}>
            Got it
          </Button>
        }
      >
        <p className="text-small text-text-secondary">
          To prevent accidental duplicate emails and protect your account,
          invoice emails can only be sent a few times within a short period.
        </p>
      </Modal>
    </div>
  );
}
