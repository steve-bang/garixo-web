import type { WorkOrder } from '@/features/work-orders/types';
import type {
  Invoice,
  InvoiceLineItem,
  InvoicePaymentTerm,
  PublicInvoiceView,
  UpdateInvoiceInput
} from '@/features/invoices/types';
import { WorkOrderStatusEnum } from '@/features/work-orders/types';
import { toPlateDisplay } from '@/features/work-orders/utils';
import { firebaseAdmin } from '@/lib/firebase-admin';
import type {
  GarageInvoiceDocument,
  GarageInvoiceLineItemDocument,
  GarageInvoicePaymentTerm,
  GarageInvoiceSettingsDocument,
  InvoicePublicShareDocument
} from '@/types/firebase-models';

const INVOICE_SEQUENCE_DOC_ID = 'invoice-sequence';
const PUBLIC_INVOICE_SHARES_COLLECTION = 'invoicePublicShares';

/**
 * Invoice persistence layer for garages/{garageId}/invoices.
 *
 * Design goals:
 * - Keep invoice data as a stable financial snapshot of a work order.
 * - Avoid accounting complexity for MVP while preserving future extensibility.
 * - Keep operations idempotent and owner-friendly.
 */

type InvoiceSequenceDoc = {
  nextNumber: number;
  updatedAt: string;
};

function invoicesCollection(garageId: string) {
  return firebaseAdmin.db
    .collection('garages')
    .doc(garageId)
    .collection('invoices');
}

function invoiceRef(garageId: string, invoiceId: string) {
  return invoicesCollection(garageId).doc(invoiceId);
}

function invoiceSequenceRef(garageId: string) {
  return firebaseAdmin.db
    .collection('garages')
    .doc(garageId)
    .collection('settings')
    .doc(INVOICE_SEQUENCE_DOC_ID);
}

function publicInvoiceSharesCollection() {
  return firebaseAdmin.db.collection(PUBLIC_INVOICE_SHARES_COLLECTION);
}

function publicInvoiceShareRef(shareId: string) {
  return publicInvoiceSharesCollection().doc(shareId);
}

function maskCustomerName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) {
    return 'Customer';
  }

  if (parts.length === 1) {
    return parts[0];
  }

  const [first, second] = parts;
  return `${first} ${second.charAt(0)}.`;
}

function sanitizeLineItems(
  lineItems: InvoiceLineItem[]
): GarageInvoiceLineItemDocument[] {
  return lineItems
    .map((item) => {
      const quantity = Math.max(0, Number(item.quantity) || 0);
      const unitPrice = Math.max(0, Number(item.unitPrice) || 0);
      return {
        key: item.key,
        type: item.type,
        name: item.name,
        quantity,
        unitPrice,
        amount: Math.max(0, Number((quantity * unitPrice).toFixed(2)))
      };
    })
    .filter((item) => item.name.trim().length > 0 && item.quantity > 0);
}

function computeSubtotal(lineItems: GarageInvoiceLineItemDocument[]): number {
  return Math.max(
    0,
    Number(lineItems.reduce((sum, item) => sum + item.amount, 0).toFixed(2))
  );
}

function computeTaxAmount(subtotal: number, taxRate: number): number {
  return Math.max(0, Number(((subtotal * taxRate) / 100).toFixed(2)));
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

export function resolveDueDateByPaymentTerm(
  issuedAtIso: string,
  paymentTerm: InvoicePaymentTerm
): string {
  const issuedAt = new Date(issuedAtIso);

  if (paymentTerm === 'DUE_ON_RECEIPT') {
    return issuedAtIso;
  }

  if (paymentTerm === 'NET_7') {
    return addDays(issuedAt, 7).toISOString();
  }

  if (paymentTerm === 'NET_15') {
    return addDays(issuedAt, 15).toISOString();
  }

  return addDays(issuedAt, 30).toISOString();
}

function buildLineItemsFromWorkOrder(order: WorkOrder): InvoiceLineItem[] {
  const serviceItems = order.services.map((service) => ({
    key: `service-${service.id}`,
    type: 'service' as const,
    name: service.name,
    quantity: 1,
    unitPrice: service.price,
    amount: service.price
  }));

  const partItems = order.parts.map((part) => ({
    key: `part-${part.id}`,
    type: 'part' as const,
    name: part.partName,
    quantity: part.quantity,
    unitPrice: part.unitPrice,
    amount: part.quantity * part.unitPrice
  }));

  return [...serviceItems, ...partItems];
}

function mapInvoiceDoc(id: string, data: GarageInvoiceDocument): Invoice {
  return {
    id,
    invoiceNumber: data.invoiceNumber,
    workOrderId: data.workOrderId,
    orderCode: data.orderCode,
    customerId: data.customerId,
    customerName: data.customerName,
    customerEmail: data.customerEmail,
    customerPhone: data.customerPhone,
    vehicleId: data.vehicleId,
    vehicleLabel: data.vehicleLabel,
    issuedAt: data.issuedAt,
    dueDate: data.dueDate,
    paymentTerm: data.paymentTerm,
    lineItems: data.lineItems,
    subtotal: data.subtotal,
    tax: data.tax,
    total: data.total,
    notes: data.notes,
    sentAt: data.sentAt,
    lastSentAt: data.lastSentAt,
    sentCount: data.sentCount,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    createdByUserId: data.createdByUserId,
    updatedByUserId: data.updatedByUserId
  };
}

async function allocateNextInvoiceNumber(garageId: string): Promise<string> {
  const ref = invoiceSequenceRef(garageId);
  const nowIso = new Date().toISOString();

  return firebaseAdmin.db.runTransaction(async (tx: any) => {
    const snap = await tx.get(ref);
    const current: InvoiceSequenceDoc = snap.exists
      ? (snap.data() as InvoiceSequenceDoc)
      : { nextNumber: 1, updatedAt: nowIso };

    const nextNumber = Number.isFinite(current.nextNumber)
      ? Math.max(1, Math.floor(current.nextNumber))
      : 1;

    tx.set(
      ref,
      {
        nextNumber: nextNumber + 1,
        updatedAt: nowIso
      },
      { merge: true }
    );

    return `INV-${String(nextNumber).padStart(6, '0')}`;
  });
}

/**
 * Returns an existing invoice by work order to keep invoice creation idempotent.
 */
export async function findGarageInvoiceByWorkOrderId(
  garageId: string,
  workOrderId: string
): Promise<Invoice | null> {
  const snap = await invoicesCollection(garageId)
    .where('workOrderId', '==', workOrderId)
    .limit(1)
    .get();

  if (snap.empty) {
    return null;
  }

  const doc = snap.docs[0];
  return mapInvoiceDoc(doc.id, doc.data() as GarageInvoiceDocument);
}

export async function findGarageInvoiceById(
  garageId: string,
  invoiceId: string
): Promise<Invoice | null> {
  const snap = await invoiceRef(garageId, invoiceId).get();

  if (!snap.exists) {
    return null;
  }

  return mapInvoiceDoc(snap.id, snap.data() as GarageInvoiceDocument);
}

export async function listGarageInvoices(
  garageId: string,
  filters: {
    search?: string;
    workOrderId?: string;
    page: number;
    pageSize: number;
  }
): Promise<{
  items: Invoice[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}> {
  const snap = await invoicesCollection(garageId).get();
  const search = filters.search?.trim().toLowerCase() ?? '';

  const all = snap.docs
    .map((doc: { id: string; data: () => unknown }) =>
      mapInvoiceDoc(doc.id, doc.data() as GarageInvoiceDocument)
    )
    .filter((item: Invoice) => {
      if (filters.workOrderId && item.workOrderId !== filters.workOrderId) {
        return false;
      }

      if (!search) {
        return true;
      }

      return (
        item.invoiceNumber.toLowerCase().includes(search) ||
        item.orderCode.toLowerCase().includes(search) ||
        item.customerName.toLowerCase().includes(search) ||
        (item.customerPhone ?? '').toLowerCase().includes(search) ||
        item.vehicleLabel.toLowerCase().includes(search)
      );
    })
    .sort(
      (a: Invoice, b: Invoice) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  const total = all.length;
  const totalPages = Math.max(1, Math.ceil(total / filters.pageSize));
  const page = Math.min(Math.max(1, filters.page), totalPages);
  const start = (page - 1) * filters.pageSize;
  const items = all.slice(start, start + filters.pageSize);

  return {
    items,
    total,
    page,
    pageSize: filters.pageSize,
    totalPages
  };
}

/**
 * Creates an invoice snapshot from an existing work order.
 * The snapshot keeps historical pricing/details even when the work order changes later.
 */
export async function createGarageInvoiceFromWorkOrder(
  garageId: string,
  input: {
    order: WorkOrder;
    customerEmail: string | null;
    invoiceSettings: GarageInvoiceSettingsDocument;
    userId: string;
  }
): Promise<Invoice> {
  const existing = await findGarageInvoiceByWorkOrderId(
    garageId,
    input.order.id
  );
  if (existing) {
    return existing;
  }

  if (
    input.order.status !== WorkOrderStatusEnum.Completed &&
    input.order.status !== WorkOrderStatusEnum.Paid
  ) {
    throw new Error('Work order must be completed before creating an invoice.');
  }

  const nowIso = new Date().toISOString();
  const invoiceNumber = await allocateNextInvoiceNumber(garageId);
  const lineItems = sanitizeLineItems(buildLineItemsFromWorkOrder(input.order));

  if (!lineItems.length) {
    throw new Error('Invoice requires at least one billable item.');
  }

  const subtotal = computeSubtotal(lineItems);
  const taxRate = input.invoiceSettings.tax.enabled
    ? input.invoiceSettings.tax.rate
    : 0;
  const taxAmount = input.invoiceSettings.tax.enabled
    ? computeTaxAmount(subtotal, taxRate)
    : 0;
  const total = Number((subtotal + taxAmount).toFixed(2));

  const paymentTerm = input.invoiceSettings.paymentTerm;
  const dueDate = resolveDueDateByPaymentTerm(nowIso, paymentTerm);

  const payload: GarageInvoiceDocument = {
    invoiceNumber,
    workOrderId: input.order.id,
    orderCode: input.order.orderCode,
    customerId: input.order.customerId ?? null,
    customerName: input.order.customerName,
    customerEmail: input.customerEmail,
    customerPhone: input.order.customerPhone ?? null,
    vehicleId: input.order.vehicleId ?? null,
    vehicleLabel: `${toPlateDisplay(input.order.plateNumber)}${
      input.order.vehicleModel ? ` - ${input.order.vehicleModel}` : ''
    }`,
    issuedAt: nowIso,
    dueDate,
    paymentTerm,
    lineItems,
    subtotal,
    tax: {
      enabled: input.invoiceSettings.tax.enabled,
      rate: taxRate,
      label: input.invoiceSettings.tax.label,
      amount: taxAmount
    },
    total,
    notes: input.order.notes ?? null,
    sentAt: null,
    lastSentAt: null,
    sentCount: 0,
    createdAt: nowIso,
    updatedAt: nowIso,
    createdByUserId: input.userId,
    updatedByUserId: input.userId
  };

  const ref = invoicesCollection(garageId).doc();
  await ref.set(payload);

  return mapInvoiceDoc(ref.id, payload);
}

/**
 * Updates editable invoice fields. Financial values are recalculated server-side.
 */
export async function updateGarageInvoice(
  garageId: string,
  invoiceId: string,
  input: UpdateInvoiceInput,
  userId: string
): Promise<Invoice | null> {
  const ref = invoiceRef(garageId, invoiceId);
  const snap = await ref.get();

  if (!snap.exists) {
    return null;
  }

  const lineItems = sanitizeLineItems(input.lineItems);
  if (!lineItems.length) {
    throw new Error('At least one line item is required.');
  }

  const subtotal = computeSubtotal(lineItems);
  const taxAmount = input.tax.enabled
    ? computeTaxAmount(subtotal, input.tax.rate)
    : 0;
  const total = Number((subtotal + taxAmount).toFixed(2));

  const patch: Partial<GarageInvoiceDocument> = {
    dueDate: input.dueDate,
    paymentTerm: input.paymentTerm as GarageInvoicePaymentTerm,
    notes: input.notes?.trim() ? input.notes.trim() : null,
    lineItems,
    subtotal,
    tax: {
      enabled: input.tax.enabled,
      rate: input.tax.rate,
      label: input.tax.label.trim(),
      amount: taxAmount
    },
    total,
    updatedAt: new Date().toISOString(),
    updatedByUserId: userId
  };

  await ref.set(patch, { merge: true });
  const updated = await ref.get();

  return mapInvoiceDoc(updated.id, updated.data() as GarageInvoiceDocument);
}

/**
 * Marks invoice as sent and increments send count atomically.
 */
export async function markGarageInvoiceSent(
  garageId: string,
  invoiceId: string
): Promise<{ sentAt: string; sentCount: number } | null> {
  const ref = invoiceRef(garageId, invoiceId);
  const nowIso = new Date().toISOString();

  return firebaseAdmin.db.runTransaction(async (tx: any) => {
    const snap = await tx.get(ref);
    if (!snap.exists) {
      return null;
    }

    const current = snap.data() as GarageInvoiceDocument;
    const nextCount = Math.max(0, current.sentCount ?? 0) + 1;

    tx.set(
      ref,
      {
        sentAt: current.sentAt ?? nowIso,
        lastSentAt: nowIso,
        sentCount: nextCount,
        updatedAt: nowIso
      },
      { merge: true }
    );

    return {
      sentAt: current.sentAt ?? nowIso,
      sentCount: nextCount
    };
  });
}

/**
 * Synchronizes recipient email to invoice snapshot for future sends.
 */
export async function updateGarageInvoiceCustomerEmail(
  garageId: string,
  invoiceId: string,
  customerEmail: string
): Promise<void> {
  await invoiceRef(garageId, invoiceId).set(
    {
      customerEmail,
      updatedAt: new Date().toISOString()
    },
    { merge: true }
  );
}

/**
 * Creates a new public share token record for an invoice and deactivates previous links.
 */
export async function createGarageInvoicePublicShare(input: {
  garageId: string;
  invoiceId: string;
  tokenHash: string;
  publicToken: string;
  createdByUserId: string;
  expiresAt: string | null;
}): Promise<{ shareId: string; expiresAt: string | null }> {
  const nowIso = new Date().toISOString();
  const allSnap = await publicInvoiceSharesCollection().get();
  const activeForInvoice = allSnap.docs
    .map((doc: { id: string; data: () => unknown }) => ({
      id: doc.id,
      data: doc.data() as InvoicePublicShareDocument
    }))
    .filter(
      (item) =>
        item.data.garageId === input.garageId &&
        item.data.invoiceId === input.invoiceId &&
        item.data.isActive
    );

  await Promise.all(
    activeForInvoice.map((item) =>
      publicInvoiceShareRef(item.id).set(
        {
          isActive: false,
          updatedAt: nowIso
        },
        { merge: true }
      )
    )
  );

  const shareRef = publicInvoiceShareRef(input.tokenHash);
  const payload: InvoicePublicShareDocument = {
    garageId: input.garageId,
    invoiceId: input.invoiceId,
    tokenHash: input.tokenHash,
    publicToken: input.publicToken,
    isActive: true,
    expiresAt: input.expiresAt,
    createdByUserId: input.createdByUserId,
    lastViewedAt: null,
    createdAt: nowIso,
    updatedAt: nowIso
  };
  await shareRef.set(payload);

  return {
    shareId: input.tokenHash,
    expiresAt: input.expiresAt
  };
}

/**
 * Revokes all active public shares for an invoice.
 */
export async function revokeGarageInvoicePublicShares(
  garageId: string,
  invoiceId: string
): Promise<number> {
  const nowIso = new Date().toISOString();
  const snap = await publicInvoiceSharesCollection().get();
  const activeForInvoice = snap.docs
    .map((doc: { id: string; data: () => unknown }) => ({
      id: doc.id,
      data: doc.data() as InvoicePublicShareDocument
    }))
    .filter(
      (item) =>
        item.data.garageId === garageId &&
        item.data.invoiceId === invoiceId &&
        item.data.isActive
    );

  if (!activeForInvoice.length) {
    return 0;
  }

  await Promise.all(
    activeForInvoice.map((item) =>
      publicInvoiceShareRef(item.id).set(
        {
          isActive: false,
          updatedAt: nowIso
        },
        { merge: true }
      )
    )
  );

  return activeForInvoice.length;
}

export async function findInvoicePublicShareByTokenHash(
  tokenHash: string
): Promise<(InvoicePublicShareDocument & { id: string }) | null> {
  const snap = await publicInvoiceShareRef(tokenHash).get();
  if (!snap.exists) {
    return null;
  }

  return {
    id: snap.id,
    ...(snap.data() as InvoicePublicShareDocument)
  };
}

export async function findActiveGarageInvoicePublicShare(
  garageId: string,
  invoiceId: string
): Promise<(InvoicePublicShareDocument & { id: string }) | null> {
  const snap = await publicInvoiceSharesCollection().get();
  const active = snap.docs
    .map((doc: { id: string; data: () => unknown }) => ({
      id: doc.id,
      data: doc.data() as InvoicePublicShareDocument
    }))
    .find(
      (item) =>
        item.data.garageId === garageId &&
        item.data.invoiceId === invoiceId &&
        item.data.isActive
    );

  if (!active) {
    return null;
  }

  return {
    id: active.id,
    ...active.data
  };
}

export async function touchInvoicePublicShareViewedAt(
  shareId: string
): Promise<void> {
  const nowIso = new Date().toISOString();
  await publicInvoiceShareRef(shareId).set(
    {
      lastViewedAt: nowIso,
      updatedAt: nowIso
    },
    { merge: true }
  );
}

/**
 * Builds a sanitized invoice payload safe for public sharing.
 * Internal ids/contact details are intentionally excluded.
 */
export function toPublicInvoiceView(
  invoice: Invoice,
  garageDisplayName: string
): PublicInvoiceView {
  return {
    invoiceNumber: invoice.invoiceNumber,
    issuedAt: invoice.issuedAt,
    dueDate: invoice.dueDate,
    paymentTerm: invoice.paymentTerm,
    customerDisplayName: maskCustomerName(invoice.customerName),
    garageDisplayName,
    lineItems: invoice.lineItems.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      amount: item.amount
    })),
    subtotal: invoice.subtotal,
    tax: {
      enabled: invoice.tax.enabled,
      label: invoice.tax.label,
      rate: invoice.tax.rate,
      amount: invoice.tax.amount
    },
    total: invoice.total
  };
}
