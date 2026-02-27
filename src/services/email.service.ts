import { sendSmtpEmail } from '@/lib/email/smtp-client';
import { buildSubscriptionActivatedEmailTemplate } from '@/lib/email/templates/subscription-activated-template';
import { buildVerifyEmailTemplate } from '@/lib/email/templates/verify-email-template';

type SendVerificationEmailInput = {
  recipientEmail: string;
  ownerName?: string;
  verifyUrl: string;
};

type SendSubscriptionActivatedEmailInput = {
  recipientEmail: string;
  firstName?: string;
  planName: string;
  billingCycle: 'monthly' | 'annual';
  price: number;
  nextBillingDate: Date;
  dashboardLink: string;
  supportEmail: string;
  websiteUrl: string;
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

export async function sendSubscriptionActivatedEmail(
  input: SendSubscriptionActivatedEmailInput
): Promise<boolean> {
  const template = buildSubscriptionActivatedEmailTemplate({
    firstName: input.firstName,
    planName: input.planName,
    billingCycle: input.billingCycle === 'annual' ? 'Annual' : 'Monthly',
    price: input.price,
    nextBillingDate: input.nextBillingDate,
    dashboardLink: input.dashboardLink,
    supportEmail: input.supportEmail,
    websiteUrl: input.websiteUrl
  });

  return sendSmtpEmail({
    to: input.recipientEmail,
    subject: template.subject,
    text: template.text,
    html: template.html
  });
}
