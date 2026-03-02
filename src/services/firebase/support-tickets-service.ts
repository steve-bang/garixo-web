import { firebaseAdmin } from '@/lib/firebase-admin';
import type { SupportTicket } from '@/features/support/types';
import type { GarageSupportTicketDocument } from '@/types/firebase-models';
import type { AdminSupportTicketsQueryInput } from '@/features/support/schema';
import type { SupportTicketListResponse } from '@/features/support/types';

function supportTicketsCollection(garageId: string) {
  return firebaseAdmin.db
    .collection('garages')
    .doc(garageId)
    .collection('supportTickets');
}

function mapSupportTicketDoc(
  id: string,
  data: GarageSupportTicketDocument
): SupportTicket {
  const now = new Date().toISOString();

  return {
    id,
    garageId: data.garageId,
    createdByUserId: data.createdByUserId,
    createdByName: data.createdByName,
    createdByEmail: data.createdByEmail,
    type: data.type ?? 'problem',
    shortDescription: data.shortDescription ?? '',
    message: data.message ?? '',
    screenshot: data.screenshot ?? null,
    status: data.status ?? 'open',
    source: data.source ?? 'dashboard',
    createdAt: data.createdAt ?? now,
    updatedAt: data.updatedAt ?? now
  };
}

export async function createGarageSupportTicket(
  garageId: string,
  payload: Omit<GarageSupportTicketDocument, 'id'>
): Promise<SupportTicket> {
  const ref = supportTicketsCollection(garageId).doc();
  await ref.set(payload);
  return mapSupportTicketDoc(ref.id, payload);
}

export async function listGarageSupportTickets(
  garageId: string,
  limit = 10
): Promise<SupportTicket[]> {
  const safeLimit = Math.max(1, Math.min(50, limit));
  const snap = await supportTicketsCollection(garageId).get();

  return snap.docs
    .map((doc: { id: string; data: () => unknown }) =>
      mapSupportTicketDoc(doc.id, doc.data() as GarageSupportTicketDocument)
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, safeLimit);
}

/**
 * Admin/owner detail lookup for one garage-scoped support ticket.
 */
export async function getGarageSupportTicketById(
  garageId: string,
  ticketId: string
): Promise<SupportTicket | null> {
  const doc = await supportTicketsCollection(garageId).doc(ticketId).get();

  if (!doc.exists) {
    return null;
  }

  return mapSupportTicketDoc(doc.id, doc.data() as GarageSupportTicketDocument);
}

/**
 * Admin status control for a support ticket.
 */
export async function updateGarageSupportTicketStatus(
  garageId: string,
  ticketId: string,
  status: GarageSupportTicketDocument['status']
): Promise<SupportTicket | null> {
  const ref = supportTicketsCollection(garageId).doc(ticketId);
  const snapshot = await ref.get();

  if (!snapshot.exists) {
    return null;
  }

  const existing = snapshot.data() as GarageSupportTicketDocument;
  const now = new Date().toISOString();
  const next: GarageSupportTicketDocument = {
    ...existing,
    status,
    updatedAt: now
  };

  await ref.set(next, { merge: true });

  return mapSupportTicketDoc(ticketId, next);
}

function toDateCutoffIso(
  filter: AdminSupportTicketsQueryInput['date']
): string | null {
  const now = Date.now();
  if (filter === 'today') {
    return new Date(now - 24 * 60 * 60 * 1000).toISOString();
  }
  if (filter === '7d') {
    return new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();
  }
  if (filter === '30d') {
    return new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();
  }
  return null;
}

function isMissingIndexError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const maybeError = error as {
    code?: number | string;
    message?: string;
    details?: string;
  };

  // Firestore missing-index errors are FAILED_PRECONDITION (code 9).
  return (
    maybeError.code === 9 ||
    maybeError.code === '9' ||
    maybeError.message?.includes('FAILED_PRECONDITION') === true ||
    maybeError.details?.includes('requires an index') === true
  );
}

/**
 * Admin-only cross-garage ticket listing.
 * Uses collectionGroup("supportTickets") to query all garage subcollections.
 */
export async function listAllSupportTicketsForAdmin(
  query: AdminSupportTicketsQueryInput
): Promise<SupportTicketListResponse> {
  // Use a narrow `any` cast at the boundary because local Firestore type shims
  // currently do not include collectionGroup, while runtime SDK supports it.
  const baseRef: any = (firebaseAdmin.db as any).collectionGroup(
    'supportTickets'
  );
  let ref: any = baseRef;

  if (query.status) {
    ref = ref.where('status', '==', query.status);
  }

  if (query.type) {
    ref = ref.where('type', '==', query.type);
  }

  const cutoffIso = toDateCutoffIso(query.date);
  if (cutoffIso) {
    ref = ref.where('createdAt', '>=', cutoffIso);
  }

  let snapshot: any;

  try {
    snapshot = await ref.get();
  } catch (error) {
    if (!isMissingIndexError(error)) {
      throw error;
    }

    // Fallback path when composite index is not ready yet:
    // read base collectionGroup and apply filters in-memory to keep UI working.
    snapshot = await baseRef.get();
  }

  const allTickets = snapshot.docs.map(
    (doc: { id: string; data: () => unknown }) =>
      mapSupportTicketDoc(doc.id, doc.data() as GarageSupportTicketDocument)
  );

  const filtered = allTickets
    .filter((ticket: SupportTicket) => {
      if (query.status && ticket.status !== query.status) {
        return false;
      }
      if (query.type && ticket.type !== query.type) {
        return false;
      }
      if (cutoffIso && ticket.createdAt < cutoffIso) {
        return false;
      }
      return true;
    })
    .sort(
      (a: SupportTicket, b: SupportTicket) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / query.pageSize));
  const page = Math.min(query.page, totalPages);
  const start = (page - 1) * query.pageSize;
  const items = filtered.slice(start, start + query.pageSize);

  return {
    items,
    meta: {
      page,
      pageSize: query.pageSize,
      total,
      totalPages
    }
  };
}
