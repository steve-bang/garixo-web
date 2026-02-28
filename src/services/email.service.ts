import { sendSmtpEmail } from '@/lib/email/smtp-client';
import { buildSubscriptionActivatedEmailTemplate } from '@/lib/email/templates/subscription-activated-template';
import { buildSubscriptionCancelledEmailTemplate } from '@/lib/email/templates/subscription-cancelled-template';
import { buildSubscriptionPaymentFailedEmailTemplate } from '@/lib/email/templates/subscription-payment-failed-template';
import { buildSubscriptionPaymentSucceededEmailTemplate } from '@/lib/email/templates/subscription-payment-succeeded-template';
import { buildSubscriptionSuspendedEmailTemplate } from '@/lib/email/templates/subscription-suspended-template';
import { buildInvoiceEmailTemplate } from '@/lib/email/templates/invoice-template';
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

type SendSubscriptionCancelledEmailInput = {
  recipientEmail: string;
  firstName?: string;
  planName: string;
  billingCycle: 'monthly' | 'annual';
  accessEndsAt: Date;
  dashboardLink: string;
  resubscribeLink: string;
  supportEmail: string;
  websiteUrl: string;
};

type SendSubscriptionSuspendedEmailInput = {
  recipientEmail: string;
  firstName?: string;
  planName: string;
  billingCycle: 'monthly' | 'annual';
  restoreAccessLink: string;
  dashboardLink: string;
  supportEmail: string;
  websiteUrl: string;
};

type SendInvoiceEmailInput = {
  recipientEmail: string;
  garageName: string;
  customerName: string;
  invoiceNumber: string;
  orderCode: string;
  paymentTerm: 'DUE_ON_RECEIPT' | 'NET_7' | 'NET_15' | 'NET_30';
  issuedAt: Date;
  total: number;
  subtotal: number;
  taxLabel: string;
  taxRate: number;
  taxAmount: number;
  dueDate: Date;
  lineItems: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }>;
  invoiceLink: string;
  supportEmail?: string;
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

export async function sendSubscriptionCancelledEmail(
  input: SendSubscriptionCancelledEmailInput
): Promise<boolean> {
  const template = buildSubscriptionCancelledEmailTemplate({
    firstName: input.firstName,
    planName: input.planName,
    billingCycle: input.billingCycle === 'annual' ? 'Annual' : 'Monthly',
    accessEndsAt: input.accessEndsAt,
    dashboardLink: input.dashboardLink,
    resubscribeLink: input.resubscribeLink,
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

export async function sendSubscriptionSuspendedEmail(
  input: SendSubscriptionSuspendedEmailInput
): Promise<boolean> {
  const template = buildSubscriptionSuspendedEmailTemplate({
    firstName: input.firstName,
    planName: input.planName,
    billingCycle: input.billingCycle === 'annual' ? 'Annual' : 'Monthly',
    restoreAccessLink: input.restoreAccessLink,
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

export async function sendInvoiceEmail(
  input: SendInvoiceEmailInput
): Promise<boolean> {
  const template = buildInvoiceEmailTemplate({
    garageName: input.garageName,
    customerName: input.customerName,
    invoiceNumber: input.invoiceNumber,
    orderCode: input.orderCode,
    paymentTerm: input.paymentTerm,
    issuedAt: input.issuedAt,
    total: input.total,
    subtotal: input.subtotal,
    taxLabel: input.taxLabel,
    taxRate: input.taxRate,
    taxAmount: input.taxAmount,
    dueDate: input.dueDate,
    lineItems: input.lineItems,
    invoiceLink: input.invoiceLink,
    supportEmail: input.supportEmail
  });

  return sendSmtpEmail({
    to: input.recipientEmail,
    subject: template.subject,
    text: template.text,
    html: template.html
  });
}
