export type ForgotPasswordEmailTemplateInput = {
  recipientEmail: string;
  requestedAt: Date;
  newPassword: string;
};

export type ForgotPasswordEmailTemplate = {
  subject: string;
  text: string;
  html: string;
};

/**
 * Owner-friendly copy: simple language, no technical jargon, no action links.
 */
export function buildForgotPasswordEmailTemplate(
  input: ForgotPasswordEmailTemplateInput
): ForgotPasswordEmailTemplate {
  const requestTime = input.requestedAt.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });

  const subject = 'Password reset request';

  const text = [
    'Hello,',
    '',
    'We received a request to reset your Garixo password.',
    '',
    'Account: ' + input.recipientEmail,
    'Time: ' + requestTime,
    'Temporary password: ' + input.newPassword,
    '',
    'Please sign in with this temporary password and change it immediately in Profile > Change Password.',
    'If this was not you, you can safely ignore this email. Your account is still protected.',
    '',
    'Garixo Support Team'
  ].join('\n');

  const html = `
    <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6; max-width: 560px; margin: 0 auto;">
      <h2 style="margin: 0 0 12px; font-size: 22px;">Password reset request</h2>
      <p style="margin: 0 0 12px;">Hello,</p>
      <p style="margin: 0 0 12px;">
        We received a request to reset your Garixo password.
      </p>
      <div style="background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; padding: 12px 14px; margin: 0 0 12px;">
        <p style="margin: 0 0 6px;"><strong>Account:</strong> ${input.recipientEmail}</p>
        <p style="margin: 0 0 6px;"><strong>Time:</strong> ${requestTime}</p>
        <p style="margin: 0;"><strong>Password:</strong> <b>${input.newPassword}</b></p>
      </div>
      <p style="margin: 0 0 10px;">
        Please sign in with this temporary password and change it immediately in <strong>Profile &gt; Change Password</strong>.
      </p>
      <p style="margin: 0 0 16px; color: #4B5563;">
        If this was not you, you can safely ignore this email. Your account is still protected.
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
