export type InvoiceEmailTemplateInput = {
  garageName: string;
  customerName: string;
  invoiceNumber: string;
  orderCode: string;
  paymentTerm: 'DUE_ON_RECEIPT' | 'NET_7' | 'NET_15' | 'NET_30';
  issuedAt: Date;
  total: number;
  subtotal: number;
  taxLabel: string;
  taxRate: number;
  taxAmount: number;
  dueDate: Date;
  lineItems: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }>;
  invoiceLink: string;
  supportEmail?: string;
};

export type InvoiceEmailTemplate = {
  subject: string;
  text: string;
  html: string;
};

function formatUsd(value: number): string {
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: value % 1 === 0 ? 0 : 2
  });
}

function formatDate(value: Date): string {
  return value.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit'
  });
}

function formatPaymentTerm(
  value: InvoiceEmailTemplateInput['paymentTerm']
): string {
  if (value === 'DUE_ON_RECEIPT') return 'Due on receipt';
  if (value === 'NET_7') return 'Due in 7 days';
  if (value === 'NET_15') return 'Due in 15 days';
  return 'Due in 30 days';
}

/**
 * Simple invoice notification email optimized for non-technical garage owners and customers.
 */
export function buildInvoiceEmailTemplate(
  input: InvoiceEmailTemplateInput
): InvoiceEmailTemplate {
  const totalFormatted = formatUsd(input.total);
  const subject = `${input.garageName} Invoice ${input.invoiceNumber} - ${totalFormatted}`;
  const subtotalFormatted = formatUsd(input.subtotal);
  const taxAmountFormatted = formatUsd(input.taxAmount);
  const issuedAtFormatted = formatDate(input.issuedAt);
  const dueDateFormatted = formatDate(input.dueDate);
  const paymentTermFormatted = formatPaymentTerm(input.paymentTerm);
  const lineItemsText = input.lineItems
    .map(
      (item, index) =>
        `${index + 1}. ${item.name} — ${item.quantity} x ${formatUsd(item.unitPrice)} = ${formatUsd(item.amount)}`
    )
    .join('\n');
  const lineItemsRowsHtml = input.lineItems
    .map((item) =>
      `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #E5E7EB; color: #111827;">${item.name}</td>
          <td style="padding: 8px; border-bottom: 1px solid #E5E7EB; text-align: center; color: #111827;">${item.quantity}</td>
          <td style="padding: 8px; border-bottom: 1px solid #E5E7EB; text-align: right; color: #111827;">${formatUsd(item.unitPrice)}</td>
          <td style="padding: 8px; border-bottom: 1px solid #E5E7EB; text-align: right; color: #111827;">${formatUsd(item.amount)}</td>
        </tr>
      `.trim()
    )
    .join('');

  const text = [
    `Hi ${input.customerName || 'there'},`,
    '',
    `Your invoice ${input.invoiceNumber} is ready from ${input.garageName}.`,
    '',
    `Invoice number: ${input.invoiceNumber}`,
    `Work order: ${input.orderCode}`,
    `Issue date: ${issuedAtFormatted}`,
    `Payment term: ${paymentTermFormatted}`,
    `Due date: ${dueDateFormatted}`,
    '',
    'Invoice details:',
    lineItemsText || '-',
    '',
    `Subtotal: ${subtotalFormatted}`,
    `Tax: ${input.taxLabel} (${input.taxRate}%) = ${taxAmountFormatted}`,
    `Total amount: ${totalFormatted}`,
    '',
    `View your invoice: ${input.invoiceLink}`,
    '',
    input.supportEmail
      ? `If you have any questions, contact us at ${input.supportEmail}.`
      : 'If you have any questions, please contact our shop directly.',
    '',
    `Thank you,`,
    input.garageName
  ].join('\n');

  const html = `
    <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6; max-width: 560px; margin: 0 auto;">
      <h2 style="margin: 0 0 12px; font-size: 22px;">Your invoice is ready</h2>
      <p style="margin: 0 0 12px;">Hi ${input.customerName || 'there'},</p>
      <p style="margin: 0 0 14px;">
        Your invoice <strong>${input.invoiceNumber}</strong> is ready from ${input.garageName}.
      </p>
      <div style="background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; padding: 12px 14px; margin: 0 0 14px;">
        <p style="margin: 0 0 6px;"><strong>Invoice number:</strong> ${input.invoiceNumber}</p>
        <p style="margin: 0 0 6px;"><strong>Work order:</strong> ${input.orderCode}</p>
        <p style="margin: 0 0 6px;"><strong>Issue date:</strong> ${issuedAtFormatted}</p>
        <p style="margin: 0 0 6px;"><strong>Payment term:</strong> ${paymentTermFormatted}</p>
        <p style="margin: 0;"><strong>Due date:</strong> ${dueDateFormatted}</p>
      </div>
      <table style="width: 100%; border-collapse: collapse; margin: 0 0 14px;">
        <thead>
          <tr style="background: #F9FAFB;">
            <th style="padding: 8px; text-align: left; border-bottom: 1px solid #E5E7EB;">Item</th>
            <th style="padding: 8px; text-align: center; border-bottom: 1px solid #E5E7EB;">Qty</th>
            <th style="padding: 8px; text-align: right; border-bottom: 1px solid #E5E7EB;">Unit Price</th>
            <th style="padding: 8px; text-align: right; border-bottom: 1px solid #E5E7EB;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${lineItemsRowsHtml}
        </tbody>
      </table>
      <div style="background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; padding: 12px 14px; margin: 0 0 14px;">
        <p style="margin: 0 0 6px;"><strong>Subtotal:</strong> ${subtotalFormatted}</p>
        <p style="margin: 0 0 6px;"><strong>${input.taxLabel} (${input.taxRate}%):</strong> ${taxAmountFormatted}</p>
        <p style="margin: 0; font-weight: 700;"><strong>Total amount:</strong> ${totalFormatted}</p>
      </div>
      <p style="margin: 0 0 14px;">
        <a
          href="${input.invoiceLink}"
          style="display: inline-block; background: #1D4ED8; color: #FFFFFF; text-decoration: none; padding: 10px 16px; border-radius: 8px; font-weight: 600;"
        >
          View Invoice
        </a>
      </p>
      <p style="margin: 0 0 12px; color: #4B5563;">
        ${
          input.supportEmail
            ? `If you have any questions, contact us at <a href="mailto:${input.supportEmail}" style="color: #1D4ED8;">${input.supportEmail}</a>.`
            : 'If you have any questions, please contact our shop directly.'
        }
      </p>
      <p style="margin: 0; color: #6B7280;">Thank you,<br />${input.garageName}</p>
    </div>
  `.trim();

  return {
    subject,
    text,
    html
  };
}
