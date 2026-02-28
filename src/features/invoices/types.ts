import type { ISODateString, PaginatedResponse } from '@/types/primitives';

export type InvoicePaymentTerm =
  | 'DUE_ON_RECEIPT'
  | 'NET_7'
  | 'NET_15'
  | 'NET_30';

export type InvoiceLineItemType = 'service' | 'part' | 'custom';

export type InvoiceLineItem = {
  key: string;
  type: InvoiceLineItemType;
  name: string;
  quantity: number;
  unitPrice: number;
  amount: number;
};

export type InvoiceTax = {
  enabled: boolean;
  rate: number;
  label: string;
  amount: number;
};

export type Invoice = {
  id: string;
  invoiceNumber: string;
  workOrderId: string;
  orderCode: string;
  customerId: string | null;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
  vehicleId: string | null;
  vehicleLabel: string;
  issuedAt: ISODateString;
  dueDate: ISODateString;
  paymentTerm: InvoicePaymentTerm;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  tax: InvoiceTax;
  total: number;
  notes: string | null;
  sentAt: ISODateString | null;
  lastSentAt: ISODateString | null;
  sentCount: number;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  createdByUserId: string;
  updatedByUserId: string;
};

export type InvoiceListResponse = PaginatedResponse<Invoice>;

export type CreateInvoiceFromWorkOrderInput = {
  workOrderId: string;
};

export type UpdateInvoiceInput = {
  dueDate: ISODateString;
  paymentTerm: InvoicePaymentTerm;
  notes?: string;
  tax: {
    enabled: boolean;
    rate: number;
    label: string;
  };
  lineItems: InvoiceLineItem[];
};

export type SendInvoiceInput = {
  recipientEmail?: string;
};

export type CreateInvoiceShareInput = {
  expiresInDays?: number;
};

export type InvoiceShareResult = {
  publicUrl: string;
  expiresAt: ISODateString | null;
};

export type PublicInvoiceView = {
  invoiceNumber: string;
  issuedAt: ISODateString;
  dueDate: ISODateString;
  paymentTerm: InvoicePaymentTerm;
  customerDisplayName: string;
  garageDisplayName: string;
  lineItems: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }>;
  subtotal: number;
  tax: {
    enabled: boolean;
    label: string;
    rate: number;
    amount: number;
  };
  total: number;
};
