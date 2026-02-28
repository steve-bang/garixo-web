export {
  createInvoiceShare,
  createInvoiceFromWorkOrder,
  getCurrentInvoiceShare,
  getInvoiceById,
  getInvoices,
  getPublicInvoiceByToken,
  revokeInvoiceShare,
  sendInvoice,
  updateInvoice
} from '@/features/invoices/service';

export const invoicesQueryKey = ['invoices'] as const;
