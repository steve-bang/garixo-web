export type VerifyEmailTemplateInput = {
  recipientEmail: string;
  verifyUrl: string;
  requestedAt: Date;
  ownerName?: string;
};

export type VerifyEmailTemplate = {
  subject: string;
  text: string;
  html: string;
};

/**
 * Owner-friendly copy for non-technical garage users.
 * Keep instructions short and action-focused.
 */
export function buildVerifyEmailTemplate(
  input: VerifyEmailTemplateInput
): VerifyEmailTemplate {
  const requestTime = input.requestedAt.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });

  const greeting = input.ownerName?.trim()
    ? `Hello ${input.ownerName.trim()},`
    : 'Hello,';
  const subject = 'Verify your email address';

  const text = [
    greeting,
    '',
    'Please verify your email address to finish setting up your Garixo account.',
    '',
    'Account: ' + input.recipientEmail,
    'Time: ' + requestTime,
    '',
    'Click this link to verify your email:',
    input.verifyUrl,
    '',
    'If you did not create a Garixo account, you can ignore this email.',
    '',
    'Garixo Support Team'
  ].join('\n');

  const html = `
    <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6; max-width: 560px; margin: 0 auto;">
      <h2 style="margin: 0 0 12px; font-size: 22px;">Verify your email address</h2>
      <p style="margin: 0 0 12px;">${greeting}</p>
      <p style="margin: 0 0 12px;">
        Please verify your email address to finish setting up your Garixo account.
      </p>
      <div style="background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; padding: 12px 14px; margin: 0 0 14px;">
        <p style="margin: 0 0 6px;"><strong>Account:</strong> ${input.recipientEmail}</p>
        <p style="margin: 0;"><strong>Time:</strong> ${requestTime}</p>
      </div>
      <p style="margin: 0 0 14px;">
        <a
          href="${input.verifyUrl}"
          style="display: inline-block; background: #1D4ED8; color: #FFFFFF; text-decoration: none; padding: 10px 16px; border-radius: 8px; font-weight: 600;"
        >
          Verify Email Address
        </a>
      </p>
      <p style="margin: 0 0 8px; color: #4B5563;">
        If the button does not open, copy and paste this link into your browser:
      </p>
      <p style="margin: 0 0 14px; word-break: break-word;">
        <a href="${input.verifyUrl}" style="color: #1D4ED8;">${input.verifyUrl}</a>
      </p>
      <p style="margin: 0 0 16px; color: #4B5563;">
        If you did not create a Garixo account, you can ignore this email.
      </p>
      <p style="margin: 0; color: #6B7280;">Garixo Support Team</p>
    </div>
  `.trim();

  return {
    subject,
    text,
    html
  };
}
