'use client';

import { useEffect, useMemo, useState } from 'react';

import { Card } from '@/components/ui/card';
import { getPublicInvoiceByToken } from '@/features/invoices/service';
import type { PublicInvoiceView } from '@/features/invoices/types';
import { formatCurrencyUsd, formatDate } from '@/lib/utils/format';

function paymentTermLabel(
  paymentTerm: PublicInvoiceView['paymentTerm']
): string {
  if (paymentTerm === 'DUE_ON_RECEIPT') return 'Due on receipt';
  if (paymentTerm === 'NET_7') return 'Due in 7 days';
  if (paymentTerm === 'NET_15') return 'Due in 15 days';
  return 'Due in 30 days';
}

type PublicInvoicePageProps = {
  token: string;
};

export function PublicInvoicePage({
  token
}: PublicInvoicePageProps): JSX.Element {
  const [invoice, setInvoice] = useState<PublicInvoiceView | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    void (async () => {
      setLoading(true);
      setError('');

      try {
        const data = await getPublicInvoiceByToken(token);
        if (!mounted) return;
        setInvoice(data);
      } catch (e) {
        if (!mounted) return;
        setError(
          e instanceof Error
            ? e.message
            : 'This invoice link is not available right now.'
        );
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [token]);

  const pageTitle = useMemo(() => {
    if (invoice) {
      return `Invoice from ${invoice.garageDisplayName}`;
    }
    return 'Invoice Details';
  }, [invoice]);

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-[760px] p-s4 sm:p-s6">
        <Card className="space-y-s3 p-s6">
          <div className="h-6 w-52 animate-pulse rounded bg-surface-hover" />
          <div className="h-4 w-72 animate-pulse rounded bg-surface-hover" />
          <div className="h-44 animate-pulse rounded bg-surface-hover" />
        </Card>
      </div>
    );
  }

  if (error || !invoice) {
    const isExpiredLink = error.toLowerCase().includes('expired');
    const title = isExpiredLink
      ? 'This Invoice Link Has Expired'
      : 'This Invoice Link Is Unavailable';
    const primaryMessage = isExpiredLink
      ? 'For your security, this link is no longer active.'
      : 'This link is no longer available or may have been replaced.';
    const secondaryMessage =
      'Please contact the garage and ask for a new invoice link. They can share one with you in a few seconds.';

    return (
      <div className="mx-auto w-full max-w-[640px] p-s4 sm:p-s6">
        <Card className="space-y-s3 p-s6 text-center">
          <h1 className="text-h2">{title}</h1>
          <p className="text-small text-text-secondary">{primaryMessage}</p>
          <p className="text-caption text-text-muted">{secondaryMessage}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[760px] space-y-s4 p-s4 sm:p-s6">
      <Card className="space-y-s4 p-s6">
        <div className="space-y-s1">
          <p className="text-caption text-text-muted">{pageTitle}</p>
          <h1 className="text-h2">{invoice.invoiceNumber}</h1>
          <p className="text-small text-text-secondary">
            For {invoice.customerDisplayName} •{' '}
            {paymentTermLabel(invoice.paymentTerm)}
          </p>
          <p className="text-caption text-text-muted">
            Please review the items and total amount below.
          </p>
        </div>

        <div className="grid gap-s3 text-small sm:grid-cols-2">
          <div>
            <p className="text-text-muted">Issue Date</p>
            <p className="font-medium text-text-primary">
              {formatDate(invoice.issuedAt)}
            </p>
          </div>
          <div>
            <p className="text-text-muted">Due Date</p>
            <p className="font-medium text-text-primary">
              {formatDate(invoice.dueDate)}
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-s6">
        <h2 className="text-h3">Invoice Details</h2>
        <div className="mt-s3 overflow-x-auto">
          <table className="w-full text-left text-small">
            <thead className="border-b border-border text-text-secondary">
              <tr>
                <th className="px-s2 py-s2 font-medium">Item</th>
                <th className="px-s2 py-s2 text-right font-medium">Qty</th>
                <th className="px-s2 py-s2 text-right font-medium">Unit</th>
                <th className="px-s2 py-s2 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.lineItems.map((item, index) => (
                <tr
                  key={`${item.name}-${index}`}
                  className="border-t border-border"
                >
                  <td className="px-s2 py-s2 text-text-primary">{item.name}</td>
                  <td className="px-s2 py-s2 text-right text-text-secondary">
                    {item.quantity}
                  </td>
                  <td className="px-s2 py-s2 text-right text-text-secondary">
                    {formatCurrencyUsd(item.unitPrice)}
                  </td>
                  <td className="px-s2 py-s2 text-right font-medium text-text-primary">
                    {formatCurrencyUsd(item.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-s4 space-y-s2 border-t border-border pt-s3 text-small">
          <div className="flex items-center justify-between">
            <span className="text-text-secondary">Subtotal</span>
            <span className="text-text-primary">
              {formatCurrencyUsd(invoice.subtotal)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-text-secondary">
              {invoice.tax.enabled
                ? `${invoice.tax.label} (${invoice.tax.rate}%)`
                : 'Tax'}
            </span>
            <span className="text-text-primary">
              {formatCurrencyUsd(invoice.tax.amount)}
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-border pt-s2">
            <span className="font-semibold text-text-primary">Total</span>
            <span className="text-base font-bold text-text-primary">
              {formatCurrencyUsd(invoice.total)}
            </span>
          </div>
        </div>
      </Card>

      <p className="text-center text-caption text-text-muted">
        Questions about this invoice? Please contact {invoice.garageDisplayName}
        .
      </p>
    </div>
  );
}
