export type SubscriptionCancelledEmailTemplateInput = {
  firstName?: string;
  planName: string;
  billingCycle: 'Monthly' | 'Annual';
  accessEndsAt: Date;
  dashboardLink: string;
  resubscribeLink: string;
  supportEmail: string;
  websiteUrl: string;
};

export type SubscriptionCancelledEmailTemplate = {
  subject: string;
  text: string;
  html: string;
};

function formatDate(value: Date): string {
  return value.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit'
  });
}

/**
 * Sent when a subscription is cancelled.
 * Messaging is simple and reassuring for non-technical garage owners.
 */
export function buildSubscriptionCancelledEmailTemplate(
  input: SubscriptionCancelledEmailTemplateInput
): SubscriptionCancelledEmailTemplate {
  const firstName = input.firstName?.trim() ? input.firstName.trim() : '';
  const greeting = firstName ? `Hi ${firstName},` : 'Hi,';
  const formattedAccessEndsAt = formatDate(input.accessEndsAt);
  const subject = 'Your Garixo subscription has been cancelled';

  const text = [
    greeting,
    '',
    'Your Garixo subscription has been cancelled.',
    '',
    'Subscription details:',
    '',
    `Plan: ${input.planName}`,
    `Billing cycle: ${input.billingCycle}`,
    `Access until: ${formattedAccessEndsAt}`,
    '',
    'You can continue to use your account until the date above.',
    '',
    'Open your dashboard:',
    input.dashboardLink,
    '',
    'If you want to continue your plan, you can reactivate anytime:',
    input.resubscribeLink,
    '',
    `Need help? Reply to this email or contact us at ${input.supportEmail}.`,
    '',
    'Thank you for using Garixo.',
    '',
    '— The Garixo Team',
    input.websiteUrl
  ].join('\n');

  const html = `
    <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6; max-width: 560px; margin: 0 auto;">
      <h2 style="margin: 0 0 12px; font-size: 22px;">Your Garixo subscription has been cancelled</h2>
      <p style="margin: 0 0 12px;">${greeting}</p>
      <p style="margin: 0 0 12px;">
        Your Garixo subscription has been cancelled.
      </p>
      <p style="margin: 0 0 8px;">Subscription details:</p>
      <div style="background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; padding: 12px 14px; margin: 0 0 14px;">
        <p style="margin: 0 0 6px;"><strong>Plan:</strong> ${input.planName}</p>
        <p style="margin: 0 0 6px;"><strong>Billing cycle:</strong> ${input.billingCycle}</p>
        <p style="margin: 0;"><strong>Access until:</strong> ${formattedAccessEndsAt}</p>
      </div>
      <p style="margin: 0 0 12px;">
        You can continue to use your account until the date above.
      </p>
      <p style="margin: 0 0 14px;">
        <a
          href="${input.dashboardLink}"
          style="display: inline-block; background: #1D4ED8; color: #FFFFFF; text-decoration: none; padding: 10px 16px; border-radius: 8px; font-weight: 600;"
        >
          Open Dashboard
        </a>
      </p>
      <p style="margin: 0 0 8px; color: #4B5563;">
        If you want to continue your plan, you can reactivate anytime:
      </p>
      <p style="margin: 0 0 12px;">
        <a href="${input.resubscribeLink}" style="color: #1D4ED8;">${input.resubscribeLink}</a>
      </p>
      <p style="margin: 0 0 12px; color: #4B5563;">
        Need help? Reply to this email or contact us at
        <a href="mailto:${input.supportEmail}" style="color: #1D4ED8;"> ${input.supportEmail}</a>.
      </p>
      <p style="margin: 0 0 4px;">Thank you for using Garixo.</p>
      <p style="margin: 0; color: #6B7280;">— The Garixo Team<br /><a href="${input.websiteUrl}" style="color: #1D4ED8;">${input.websiteUrl}</a></p>
    </div>
  `.trim();

  return {
    subject,
    text,
    html
  };
}
