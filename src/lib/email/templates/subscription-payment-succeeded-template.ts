export type SubscriptionPaymentSucceededEmailTemplateInput = {
  firstName?: string;
  planName: string;
  billingCycle: 'Monthly' | 'Annual';
  amount: number;
  billedAt: Date;
  nextBillingDate: Date;
  dashboardLink: string;
  supportEmail: string;
  websiteUrl: string;
};

export type SubscriptionPaymentSucceededEmailTemplate = {
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

/**
 * Sent for recurring successful paid cycles (e.g. regular monthly renewal).
 */
export function buildSubscriptionPaymentSucceededEmailTemplate(
  input: SubscriptionPaymentSucceededEmailTemplateInput
): SubscriptionPaymentSucceededEmailTemplate {
  const firstName = input.firstName?.trim() ? input.firstName.trim() : '';
  const greeting = firstName ? `Hi ${firstName},` : 'Hi,';
  const subject = 'Payment received: your Garixo subscription is active';
  const formattedAmount = formatUsd(input.amount);
  const formattedBilledAt = formatDate(input.billedAt);
  const formattedNextBillingDate = formatDate(input.nextBillingDate);

  const text = [
    greeting,
    '',
    'Your subscription payment was processed successfully.',
    '',
    'Billing summary:',
    '',
    `Plan: ${input.planName}`,
    `Billing cycle: ${input.billingCycle}`,
    `Amount paid: ${formattedAmount}`,
    `Payment date: ${formattedBilledAt}`,
    `Next billing date: ${formattedNextBillingDate}`,
    '',
    'Your account stays active and ready for daily operations.',
    '',
    'Open your dashboard:',
    input.dashboardLink,
    '',
    `If you need help, reply to this email or contact us at ${input.supportEmail}.`,
    '',
    'Thank you for choosing Garixo.',
    '',
    '— The Garixo Team',
    input.websiteUrl
  ].join('\n');

  const html = `
    <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6; max-width: 560px; margin: 0 auto;">
      <h2 style="margin: 0 0 12px; font-size: 22px;">Payment received: your Garixo subscription is active</h2>
      <p style="margin: 0 0 12px;">${greeting}</p>
      <p style="margin: 0 0 12px;">
        Your subscription payment was processed successfully.
      </p>
      <p style="margin: 0 0 8px;">Billing summary:</p>
      <div style="background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; padding: 12px 14px; margin: 0 0 14px;">
        <p style="margin: 0 0 6px;"><strong>Plan:</strong> ${input.planName}</p>
        <p style="margin: 0 0 6px;"><strong>Billing cycle:</strong> ${input.billingCycle}</p>
        <p style="margin: 0 0 6px;"><strong>Amount paid:</strong> ${formattedAmount}</p>
        <p style="margin: 0 0 6px;"><strong>Payment date:</strong> ${formattedBilledAt}</p>
        <p style="margin: 0;"><strong>Next billing date:</strong> ${formattedNextBillingDate}</p>
      </div>
      <p style="margin: 0 0 12px;">
        Your account stays active and ready for daily operations.
      </p>
      <p style="margin: 0 0 14px;">
        <a
          href="${input.dashboardLink}"
          style="display: inline-block; background: #1D4ED8; color: #FFFFFF; text-decoration: none; padding: 10px 16px; border-radius: 8px; font-weight: 600;"
        >
          Open Dashboard
        </a>
      </p>
      <p style="margin: 0 0 12px; color: #4B5563;">
        If you need help, reply to this email or contact us at
        <a href="mailto:${input.supportEmail}" style="color: #1D4ED8;"> ${input.supportEmail}</a>.
      </p>
      <p style="margin: 0 0 4px;">Thank you for choosing Garixo.</p>
      <p style="margin: 0; color: #6B7280;">— The Garixo Team<br /><a href="${input.websiteUrl}" style="color: #1D4ED8;">${input.websiteUrl}</a></p>
    </div>
  `.trim();

  return {
    subject,
    text,
    html
  };
}
