import { sendSmtpEmail } from '@/lib/email/smtp-client';
import { buildSubscriptionActivatedEmailTemplate } from '@/lib/email/templates/subscription-activated-template';
import { buildSubscriptionPaymentFailedEmailTemplate } from '@/lib/email/templates/subscription-payment-failed-template';
import { buildSubscriptionPaymentSucceededEmailTemplate } from '@/lib/email/templates/subscription-payment-succeeded-template';
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

type SendSubscriptionPaymentFailedEmailInput = {
  recipientEmail: string;
  firstName?: string;
  planName: string;
  amount: number;
  billingDate: Date;
  gracePeriodDate: Date;
  updateBillingLink: string;
  supportEmail: string;
  websiteUrl: string;
};

type SendSubscriptionPaymentSucceededEmailInput = {
  recipientEmail: string;
  firstName?: string;
  planName: string;
  billingCycle: 'monthly' | 'annual';
  amount: number;
  billedAt: Date;
  nextBillingDate: Date;
  dashboardLink: string;
  supportEmail: string;
  websiteUrl: string;
};

type SendSubscriptionTrialConvertedEmailInput = {
  recipientEmail: string;
  firstName?: string;
  planName: string;
  billingCycle: 'monthly' | 'annual';
  amount: number;
  billedAt: Date;
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

export async function sendSubscriptionPaymentFailedEmail(
  input: SendSubscriptionPaymentFailedEmailInput
): Promise<boolean> {
  const template = buildSubscriptionPaymentFailedEmailTemplate({
    firstName: input.firstName,
    planName: input.planName,
    amount: input.amount,
    billingDate: input.billingDate,
    gracePeriodDate: input.gracePeriodDate,
    updateBillingLink: input.updateBillingLink,
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

export async function sendSubscriptionPaymentSucceededEmail(
  input: SendSubscriptionPaymentSucceededEmailInput
): Promise<boolean> {
  const template = buildSubscriptionPaymentSucceededEmailTemplate({
    firstName: input.firstName,
    planName: input.planName,
    billingCycle: input.billingCycle === 'annual' ? 'Annual' : 'Monthly',
    amount: input.amount,
    billedAt: input.billedAt,
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
