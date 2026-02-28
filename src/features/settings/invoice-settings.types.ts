import type { GarageInvoicePaymentTerm } from '@/types/firebase-models';

export const invoicePaymentTerms = [
  'DUE_ON_RECEIPT',
  'NET_7',
  'NET_15',
  'NET_30'
] as const satisfies readonly GarageInvoicePaymentTerm[];

export type InvoicePaymentTerm = (typeof invoicePaymentTerms)[number];

export interface InvoiceSettings {
  tax: {
    enabled: boolean;
    rate: number;
    label: string;
  };
  paymentTerm: InvoicePaymentTerm;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateInvoiceSettingsInput {
  tax: {
    enabled: boolean;
    rate: number;
    label: string;
  };
  paymentTerm: InvoicePaymentTerm;
}
