export type SubscriptionSuspendedEmailTemplateInput = {
  firstName?: string;
  planName: string;
  billingCycle: 'Monthly' | 'Annual';
  restoreAccessLink: string;
  dashboardLink: string;
  supportEmail: string;
  websiteUrl: string;
};

export type SubscriptionSuspendedEmailTemplate = {
  subject: string;
  text: string;
  html: string;
};

/**
 * Sent when PayPal marks the subscription as suspended.
 * Keep tone calm and action-focused for non-technical shop owners.
 */
export function buildSubscriptionSuspendedEmailTemplate(
  input: SubscriptionSuspendedEmailTemplateInput
): SubscriptionSuspendedEmailTemplate {
  const firstName = input.firstName?.trim() ? input.firstName.trim() : '';
  const greeting = firstName ? `Hi ${firstName},` : 'Hi,';
  const subject = 'Action needed: your Garixo subscription is suspended';

  const text = [
    greeting,
    '',
    'Your Garixo subscription is currently suspended.',
    '',
    'Subscription details:',
    '',
    `Plan: ${input.planName}`,
    `Billing cycle: ${input.billingCycle}`,
    'Status: Suspended',
    '',
    'To restore full access, please review your billing details and reactivate your subscription:',
    input.restoreAccessLink,
    '',
    'You can still open your dashboard here:',
    input.dashboardLink,
    '',
    `If you need help, reply to this email or contact us at ${input.supportEmail}.`,
    '',
    '— The Garixo Team',
    input.websiteUrl
  ].join('\n');

  const html = `
    <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6; max-width: 560px; margin: 0 auto;">
      <h2 style="margin: 0 0 12px; font-size: 22px;">Action needed: your Garixo subscription is suspended</h2>
      <p style="margin: 0 0 12px;">${greeting}</p>
      <p style="margin: 0 0 12px;">
        Your Garixo subscription is currently suspended.
      </p>
      <p style="margin: 0 0 8px;">Subscription details:</p>
      <div style="background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; padding: 12px 14px; margin: 0 0 14px;">
        <p style="margin: 0 0 6px;"><strong>Plan:</strong> ${input.planName}</p>
        <p style="margin: 0 0 6px;"><strong>Billing cycle:</strong> ${input.billingCycle}</p>
        <p style="margin: 0;"><strong>Status:</strong> Suspended</p>
      </div>
      <p style="margin: 0 0 12px;">
        To restore full access, please review your billing details and reactivate your subscription.
      </p>
      <p style="margin: 0 0 14px;">
        <a
          href="${input.restoreAccessLink}"
          style="display: inline-block; background: #DC2626; color: #FFFFFF; text-decoration: none; padding: 10px 16px; border-radius: 8px; font-weight: 600;"
        >
          Review Billing & Reactivate
        </a>
      </p>
      <p style="margin: 0 0 8px; color: #4B5563;">
        You can still open your dashboard here:
      </p>
      <p style="margin: 0 0 12px;">
        <a href="${input.dashboardLink}" style="color: #1D4ED8;">${input.dashboardLink}</a>
      </p>
      <p style="margin: 0 0 12px; color: #4B5563;">
        If you need help, reply to this email or contact us at
        <a href="mailto:${input.supportEmail}" style="color: #1D4ED8;"> ${input.supportEmail}</a>.
      </p>
      <p style="margin: 0; color: #6B7280;">— The Garixo Team<br /><a href="${input.websiteUrl}" style="color: #1D4ED8;">${input.websiteUrl}</a></p>
    </div>
  `.trim();

  return {
    subject,
    text,
    html
  };
}
