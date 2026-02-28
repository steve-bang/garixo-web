import { firebaseAdmin } from '@/lib/firebase-admin';
import type {
  GarageInvoicePaymentTerm,
  GarageInvoiceSettingsDocument
} from '@/types/firebase-models';

const SETTINGS_COLLECTION = 'settings';
const INVOICE_DOC_ID = 'invoice';

export type UpdateGarageInvoiceSettingsInput = {
  tax: {
    enabled: boolean;
    rate: number;
    label: string;
  };
  paymentTerm: GarageInvoicePaymentTerm;
};

export function getDefaultGarageInvoiceSettings(
  nowIso: string
): GarageInvoiceSettingsDocument {
  return {
    tax: {
      enabled: false,
      rate: 8.25,
      label: 'Sales Tax'
    },
    paymentTerm: 'DUE_ON_RECEIPT',
    createdAt: nowIso,
    updatedAt: nowIso
  };
}

function garageInvoiceSettingsRef(garageId: string) {
  return firebaseAdmin.db
    .collection('garages')
    .doc(garageId)
    .collection(SETTINGS_COLLECTION)
    .doc(INVOICE_DOC_ID);
}

export async function getGarageInvoiceSettings(
  garageId: string
): Promise<GarageInvoiceSettingsDocument | null> {
  const snap = await garageInvoiceSettingsRef(garageId).get();
  if (!snap.exists) {
    return null;
  }

  return snap.data() as GarageInvoiceSettingsDocument;
}

export async function ensureGarageInvoiceSettings(
  garageId: string
): Promise<GarageInvoiceSettingsDocument> {
  const ref = garageInvoiceSettingsRef(garageId);
  const nowIso = new Date().toISOString();

  return firebaseAdmin.db.runTransaction(async (tx: any) => {
    const snap = await tx.get(ref);

    if (!snap.exists) {
      const defaults = getDefaultGarageInvoiceSettings(nowIso);
      tx.set(ref, defaults);
      return defaults;
    }

    return snap.data() as GarageInvoiceSettingsDocument;
  });
}

export async function updateGarageInvoiceSettings(
  garageId: string,
  input: UpdateGarageInvoiceSettingsInput
): Promise<GarageInvoiceSettingsDocument> {
  const ref = garageInvoiceSettingsRef(garageId);
  const nowIso = new Date().toISOString();

  await firebaseAdmin.db.runTransaction(async (tx: any) => {
    const snap = await tx.get(ref);

    if (!snap.exists) {
      tx.set(ref, {
        ...getDefaultGarageInvoiceSettings(nowIso),
        tax: input.tax,
        paymentTerm: input.paymentTerm,
        updatedAt: nowIso,
        createdAt: nowIso
      });
      return;
    }

    tx.set(
      ref,
      {
        tax: input.tax,
        paymentTerm: input.paymentTerm,
        updatedAt: nowIso
      },
      { merge: true }
    );
  });

  const updated = await ref.get();
  return updated.data() as GarageInvoiceSettingsDocument;
}
