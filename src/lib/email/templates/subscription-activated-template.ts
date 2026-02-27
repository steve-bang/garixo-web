export type SubscriptionActivatedEmailTemplateInput = {
  firstName?: string;
  planName: string;
  billingCycle: 'Monthly' | 'Annual';
  price: number;
  nextBillingDate: Date;
  dashboardLink: string;
  supportEmail: string;
  websiteUrl: string;
};

export type SubscriptionActivatedEmailTemplate = {
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
 * Friendly billing activation confirmation for non-technical garage owners.
 */
export function buildSubscriptionActivatedEmailTemplate(
  input: SubscriptionActivatedEmailTemplateInput
): SubscriptionActivatedEmailTemplate {
  const firstName = input.firstName?.trim() ? input.firstName.trim() : '';
  const greeting = firstName ? `Hi ${firstName},` : 'Hi,';
  const formattedPrice = formatUsd(input.price);
  const formattedNextBillingDate = formatDate(input.nextBillingDate);
  const subject = 'Your subscription is active';

  const text = [
    greeting,
    '',
    'Your subscription has been successfully activated.',
    '',
    'Below are your subscription details:',
    '',
    `Plan: ${input.planName}`,
    `Billing cycle: ${input.billingCycle}`,
    `Amount: ${formattedPrice}`,
    `Next billing date: ${formattedNextBillingDate}`,
    'Payment method: PayPal',
    '',
    'Your account now has full access to all features included in your plan.',
    '',
    'You can access your dashboard here:',
    input.dashboardLink,
    '',
    'If you need to update billing information or manage your subscription, you can do so from your account settings at any time.',
    '',
    `If you have any questions, simply reply to this email or contact us at ${input.supportEmail}.`,
    '',
    'Thank you for choosing Garixo. We’re here to help you run your shop more efficiently.',
    '',
    '— The Garixo Team',
    input.websiteUrl
  ].join('\n');

  const html = `
    <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6; max-width: 560px; margin: 0 auto;">
      <h2 style="margin: 0 0 12px; font-size: 22px;">Your subscription is active</h2>
      <p style="margin: 0 0 12px;">${greeting}</p>
      <p style="margin: 0 0 12px;">
        Your subscription has been successfully activated.
      </p>
      <p style="margin: 0 0 8px;">
        Below are your subscription details:
      </p>
      <div style="background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; padding: 12px 14px; margin: 0 0 14px;">
        <p style="margin: 0 0 6px;"><strong>Plan:</strong> ${input.planName}</p>
        <p style="margin: 0 0 6px;"><strong>Billing cycle:</strong> ${input.billingCycle}</p>
        <p style="margin: 0 0 6px;"><strong>Amount:</strong> ${formattedPrice}</p>
        <p style="margin: 0 0 6px;"><strong>Next billing date:</strong> ${formattedNextBillingDate}</p>
        <p style="margin: 0;"><strong>Payment method:</strong> PayPal</p>
      </div>
      <p style="margin: 0 0 12px;">
        Your account now has full access to all features included in your plan.
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
        If you need to update billing information or manage your subscription, you can do so from your account settings at any time.
      </p>
      <p style="margin: 0 0 12px; color: #4B5563;">
        If you have any questions, simply reply to this email or contact us at
        <a href="mailto:${input.supportEmail}" style="color: #1D4ED8;"> ${input.supportEmail}</a>.
      </p>
      <p style="margin: 0 0 4px;">Thank you for choosing Garixo. We’re here to help you run your shop more efficiently.</p>
      <p style="margin: 0; color: #6B7280;">— The Garixo Team<br /><a href="${input.websiteUrl}" style="color: #1D4ED8;">${input.websiteUrl}</a></p>
    </div>
  `.trim();

  return {
    subject,
    text,
    html
  };
}
