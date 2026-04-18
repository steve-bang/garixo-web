export type SubscriptionPaymentFailedEmailTemplateInput = {
  firstName?: string;
  planName: string;
  amount: number;
  billingDate: Date;
  gracePeriodDate: Date;
  updateBillingLink: string;
  supportEmail: string;
  websiteUrl: string;
};

export type SubscriptionPaymentFailedEmailTemplate = {
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
 * Payment issue email for non-technical garage owners.
 * Copy is action-oriented and avoids technical billing jargon.
 */
export function buildSubscriptionPaymentFailedEmailTemplate(
  input: SubscriptionPaymentFailedEmailTemplateInput
): SubscriptionPaymentFailedEmailTemplate {
  const firstName = input.firstName?.trim() ? input.firstName.trim() : '';
  const greeting = firstName ? `Hi ${firstName},` : 'Hi,';
  const formattedAmount = formatUsd(input.amount);
  const formattedBillingDate = formatDate(input.billingDate);
  const formattedGracePeriodDate = formatDate(input.gracePeriodDate);
  const subject = 'Action Required: Payment issue with your subscription';

  const text = [
    greeting,
    '',
    'We were unable to process your recent subscription payment for Garixo.',
    '',
    'Subscription details:',
    '',
    `Plan: ${input.planName}`,
    `Amount due: ${formattedAmount}`,
    `Billing date: ${formattedBillingDate}`,
    'Payment method: PayPal',
    '',
    'This usually happens due to:',
    '',
    '• Expired or changed payment method',
    '• Insufficient funds',
    '• Payment authorization issue',
    '',
    'To avoid any interruption to your account, please update your payment information as soon as possible:',
    '',
    `Update billing link: ${input.updateBillingLink}`,
    '',
    `We will automatically retry the payment. If the issue is not resolved, your access may be temporarily limited after ${formattedGracePeriodDate}.`,
    '',
    `If you have any questions or believe this was an error, please reply to this email or contact us at ${input.supportEmail}.`,
    '',
    'We appreciate your prompt attention to this matter and thank you for choosing Garixo.',
    '',
    '— The Garixo Team',
    input.websiteUrl
  ].join('\n');

  const html = `
    <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6; max-width: 560px; margin: 0 auto;">
      <h2 style="margin: 0 0 12px; font-size: 22px;">Action Required: Payment issue with your subscription</h2>
      <p style="margin: 0 0 12px;">${greeting}</p>
      <p style="margin: 0 0 12px;">
        We were unable to process your recent subscription payment for Garixo.
      </p>
      <p style="margin: 0 0 8px;">Subscription details:</p>
      <div style="background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; padding: 12px 14px; margin: 0 0 14px;">
        <p style="margin: 0 0 6px;"><strong>Plan:</strong> ${input.planName}</p>
        <p style="margin: 0 0 6px;"><strong>Amount due:</strong> ${formattedAmount}</p>
        <p style="margin: 0 0 6px;"><strong>Billing date:</strong> ${formattedBillingDate}</p>
      </div>
      <p style="margin: 0 0 8px;">This usually happens due to:</p>
      <ul style="margin: 0 0 14px; padding-left: 20px;">
        <li>Expired or changed payment method</li>
        <li>Insufficient funds</li>
        <li>Payment authorization issue</li>
      </ul>
      <p style="margin: 0 0 12px;">
        To avoid any interruption to your account, please update your payment information as soon as possible:
      </p>
      <p style="margin: 0 0 14px;">
        <a
          href="${input.updateBillingLink}"
          style="display: inline-block; background: #DC2626; color: #FFFFFF; text-decoration: none; padding: 10px 16px; border-radius: 8px; font-weight: 600;"
        >
          Update Payment Method
        </a>
      </p>
      <p style="margin: 0 0 12px; color: #4B5563;">
        We will automatically retry the payment. If the issue is not resolved, your access may be temporarily limited after ${formattedGracePeriodDate}.
      </p>
      <p style="margin: 0 0 12px; color: #4B5563;">
        If you have any questions or believe this was an error, please reply to this email or contact us at
        <a href="mailto:${input.supportEmail}" style="color: #1D4ED8;"> ${input.supportEmail}</a>.
      </p>
      <p style="margin: 0 0 4px;">We appreciate your prompt attention to this matter and thank you for choosing Garixo.</p>
      <p style="margin: 0; color: #6B7280;">— The Garixo Team<br /><a href="${input.websiteUrl}" style="color: #1D4ED8;">${input.websiteUrl}</a></p>
    </div>
  `.trim();

  return {
    subject,
    text,
    html
  };
}
