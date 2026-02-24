import { sendSmtpEmail } from '@/lib/email/smtp-client';
import { buildVerifyEmailTemplate } from '@/lib/email/templates/verify-email-template';

type SendVerificationEmailInput = {
  recipientEmail: string;
  ownerName?: string;
  verifyUrl: string;
};

export async function sendVerificationEmail(
  input: SendVerificationEmailInput
): Promise<boolean> {
  const template = buildVerifyEmailTemplate({
    recipientEmail: input.recipientEmail,
    ownerName: input.ownerName,
    requestedAt: new Date(),
    verifyUrl: input.verifyUrl
  });

  return sendSmtpEmail({
    to: input.recipientEmail,
    subject: template.subject,
    text: template.text,
    html: template.html
  });
}
