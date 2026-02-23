import type { CreateInventoryInput } from '@/features/inventory/schema';
import type { InventoryItem } from '@/features/inventory/types';
import { getStockStatus } from '@/features/inventory/utils';
import { firebaseAdmin } from '@/lib/firebase-admin';

type SortMode =
  | 'default'
  | 'name_asc'
  | 'name_desc'
  | 'quantity_asc'
  | 'quantity_desc';

export type InventoryListParams = {
  search?: string;
  category?: InventoryItem['category'];
  stockStatus?: ReturnType<typeof getStockStatus>;
  sort: SortMode;
  page: number;
  pageSize: number;
};

export type InventoryListResult = {
  items: InventoryItem[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

type InventoryFirestoreDoc = {
  id?: string;
  name?: string;
  sku?: string;
  category?: InventoryItem['category'];
  quantity?: number;
  minLevel?: number;
  costPrice?: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
};

function inventoryCollection(garageId: string) {
  return firebaseAdmin.db
    .collection('garages')
    .doc(garageId)
    .collection('inventory');
}

function withoutUndefined<T extends Record<string, unknown>>(value: T): T {
  const entries = Object.entries(value).filter(
    ([, entry]) => entry !== undefined
  );
  return Object.fromEntries(entries) as T;
}

function mapDoc(id: string, raw: InventoryFirestoreDoc): InventoryItem {
  const createdAt = raw.createdAt ?? new Date().toISOString();
  const updatedAt = raw.updatedAt ?? createdAt;

  return {
    id,
    name: raw.name ?? '',
    sku: raw.sku ?? '',
    category: raw.category ?? 'ENGINE',
    quantity: raw.quantity ?? 0,
    minLevel: raw.minLevel ?? 0,
    costPrice: raw.costPrice ?? 0,
    notes: raw.notes ?? '',
    createdAt,
    updatedAt
  };
}

function applySort(items: InventoryItem[], sort: SortMode): InventoryItem[] {
  const copy = [...items];

  switch (sort) {
    case 'name_asc':
      return copy.sort((a, b) => a.name.localeCompare(b.name));
    case 'name_desc':
      return copy.sort((a, b) => b.name.localeCompare(a.name));
    case 'quantity_asc':
      return copy.sort((a, b) => a.quantity - b.quantity);
    case 'quantity_desc':
      return copy.sort((a, b) => b.quantity - a.quantity);
    default:
      return copy.sort((a, b) => a.name.localeCompare(b.name));
  }
}

export async function listGarageInventory(
  garageId: string
): Promise<InventoryItem[]> {
  const snapshot = await inventoryCollection(garageId).get();
  return snapshot.docs.map((doc: { id: string; data: () => unknown }) =>
    mapDoc(doc.id, doc.data() as InventoryFirestoreDoc)
  );
}

export async function listGarageInventoryWithQuery(
  garageId: string,
  params: InventoryListParams
): Promise<InventoryListResult> {
  const { search, category, stockStatus, sort, page, pageSize } = params;
  let filtered = await listGarageInventory(garageId);

  if (search) {
    const needle = search.trim().toLowerCase();
    filtered = filtered.filter(
      (item) =>
        item.name.toLowerCase().includes(needle) ||
        (item.sku ?? '').toLowerCase().includes(needle)
    );
  }

  if (category) {
    filtered = filtered.filter((item) => item.category === category);
  }

  if (stockStatus) {
    filtered = filtered.filter((item) => getStockStatus(item) === stockStatus);
  }

  const sorted = applySort(filtered, sort);
  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;

  return {
    items: sorted.slice(start, start + pageSize),
    meta: {
      page: safePage,
      pageSize,
      total,
      totalPages
    }
  };
}

export async function findGarageInventoryById(
  garageId: string,
  itemId: string
): Promise<InventoryItem | null> {
  const snapshot = await inventoryCollection(garageId).doc(itemId).get();
  if (!snapshot.exists) {
    return null;
  }
  return mapDoc(snapshot.id, snapshot.data() as InventoryFirestoreDoc);
}

export async function hasDuplicateInventoryName(
  garageId: string,
  name: string,
  excludeId?: string
): Promise<boolean> {
  const normalized = name.trim().toLowerCase();
  const items = await listGarageInventory(garageId);
  return items.some(
    (item) =>
      item.name.trim().toLowerCase() === normalized &&
      (!excludeId || item.id !== excludeId)
  );
}

export async function createGarageInventory(
  garageId: string,
  input: CreateInventoryInput
): Promise<InventoryItem> {
  const now = new Date().toISOString();
  const ref = inventoryCollection(garageId).doc();
  const payload = withoutUndefined<InventoryFirestoreDoc>({
    name: input.name,
    sku: input.sku,
    category: input.category,
    quantity: input.quantity,
    minLevel: input.minLevel,
    costPrice: input.costPrice,
    notes: input.notes,
    createdAt: now,
    updatedAt: now
  });

  await ref.set(payload);
  return mapDoc(ref.id, payload);
}

export async function updateGarageInventory(
  garageId: string,
  itemId: string,
  input: Partial<CreateInventoryInput>
): Promise<InventoryItem | null> {
  const ref = inventoryCollection(garageId).doc(itemId);
  const current = await ref.get();
  if (!current.exists) {
    return null;
  }

  const next = withoutUndefined<InventoryFirestoreDoc>({
    ...(current.data() as InventoryFirestoreDoc),
    ...input,
    updatedAt: new Date().toISOString()
  });

  await ref.set(next, { merge: true });
  return mapDoc(itemId, next);
}

export async function deleteGarageInventory(
  garageId: string,
  itemId: string
): Promise<InventoryItem | null> {
  const current = await findGarageInventoryById(garageId, itemId);
  if (!current) {
    return null;
  }

  await inventoryCollection(garageId).doc(itemId).delete();
  return current;
}

export async function adjustGarageInventory(
  garageId: string,
  itemId: string,
  type: 'ADD' | 'REDUCE',
  amount: number
): Promise<InventoryItem | null> {
  const db = firebaseAdmin.db as any;
  return db.runTransaction(async (transaction: any) => {
    const ref = inventoryCollection(garageId).doc(itemId);
    const snapshot = await transaction.get(ref);

    if (!snapshot.exists) {
      return null;
    }

    const current = mapDoc(
      snapshot.id,
      snapshot.data() as InventoryFirestoreDoc
    );

    if (type === 'REDUCE' && amount > current.quantity) {
      throw new Error('Not enough quantity in stock.');
    }

    const nextQuantity =
      type === 'ADD' ? current.quantity + amount : current.quantity - amount;

    if (nextQuantity < 0) {
      throw new Error('Quantity cannot be negative.');
    }

    const updated: InventoryFirestoreDoc = {
      quantity: nextQuantity,
      updatedAt: new Date().toISOString()
    };

    transaction.set(ref, updated, { merge: true });
    return mapDoc(current.id, { ...current, ...updated });
  });
}
